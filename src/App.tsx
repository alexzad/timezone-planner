import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { DateTime } from 'luxon'
import './App.css'
import { useAppStore } from './state/appStore'
import type { SelectedTimeZone } from './state/appStore'
import { ALL_TIMEZONES } from './data/timezones'
import {
  parseTimeToMinutes,
  computeAllZoneOverlap,
  computePairwiseOverlapDuration,
  type UtcInterval,
} from './lib/timezone'

const HOURS_IN_DAY = 24
const THEME_STORAGE_KEY = 'timezone-planner/theme'

type ThemeMode = 'dark' | 'light'

const isThemeMode = (value: string | null): value is ThemeMode =>
  value === 'dark' || value === 'light'

const getThemeStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const candidate = window.localStorage
  if (
    candidate &&
    typeof candidate.getItem === 'function' &&
    typeof candidate.setItem === 'function'
  ) {
    return candidate
  }

  return null
}

const readInitialTheme = (): ThemeMode => {
  const storage = getThemeStorage()
  const storedTheme = storage?.getItem(THEME_STORAGE_KEY) ?? null
  if (isThemeMode(storedTheme)) {
    return storedTheme
  }

  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: light)').matches
  ) {
    return 'light'
  }

  return 'dark'
}

const isHourWithinBusinessWindow = (
  hour: number,
  start: string,
  end: string,
): boolean => {
  const slotStart = hour * 60
  const slotEnd = slotStart + 60
  const businessStart = parseTimeToMinutes(start)
  const businessEnd = parseTimeToMinutes(end)

  if (businessStart === businessEnd) {
    return true
  }

  if (businessStart < businessEnd) {
    return slotStart < businessEnd && slotEnd > businessStart
  }

  return (
    slotEnd > businessStart ||
    slotStart < businessEnd ||
    slotStart === 0 ||
    slotEnd === HOURS_IN_DAY * 60
  )
}

/**
 * Check if a local hour slot overlaps with any all-zone overlap intervals.
 * Converts the local hour to UTC using the zone's offset, then checks against intervals.
 */
const isHourInAllZoneOverlap = (
  hour: number,
  tzName: string,
  allZoneOverlaps: UtcInterval[],
): boolean => {
  if (allZoneOverlaps.length === 0) return false

  // Get the current offset for the timezone (used to convert local to UTC)
  const offset = DateTime.now().setZone(tzName).offset
  const slotStartLocalMin = hour * 60
  const slotEndLocalMin = slotStartLocalMin + 60
  const slotStartUtcMin =
    (slotStartLocalMin - offset + HOURS_IN_DAY * 60 * 2) % (HOURS_IN_DAY * 60)
  const slotEndUtcMin =
    (slotEndLocalMin - offset + HOURS_IN_DAY * 60 * 2) % (HOURS_IN_DAY * 60)

  // Check if this UTC slot overlaps with any of the all-zone overlap intervals
  for (const interval of allZoneOverlaps) {
    if (slotStartUtcMin < interval.end && slotEndUtcMin > interval.start) {
      return true
    }
  }

  return false
}

/**
 * Returns the UTC hour that sits at the midpoint of the given business-hours
 * window for a specific timezone offset. The result is used as the center of
 * the shared 24-cell timeline so that the target zone's working day is
 * visually centered and all other zones are shifted relative to it.
 */
const computeUtcCenterHour = (
  businessStart: string,
  businessEnd: string,
  zoneOffsetMinutes: number,
): number => {
  const startMin = parseTimeToMinutes(businessStart)
  const endMin = parseTimeToMinutes(businessEnd)
  const totalMin = HOURS_IN_DAY * 60

  let midLocalMinutes: number
  if (startMin <= endMin) {
    midLocalMinutes = (startMin + endMin) / 2
  } else {
    // overnight window — span wraps past midnight
    const span = (endMin + totalMin - startMin) / 2
    midLocalMinutes = (startMin + span) % totalMin
  }

  const utcMidMinutes =
    (((midLocalMinutes - zoneOffsetMinutes) % totalMin) + totalMin) % totalMin

  return Math.round(utcMidMinutes / 60) % HOURS_IN_DAY
}

const formatDurationLabel = (minutes: number): string => {
  if (minutes === 0) {
    return 'none'
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${remainingMinutes}m`
}

type SortableZoneCardProps = {
  entry: SelectedTimeZone
  index: number
  total: number
  onMoveEarlier: (id: string) => void
  onMoveLater: (id: string) => void
  onRemove: (id: string) => void
  onToggleTarget: (id: string) => void
  onSetBusinessHours: (id: string, start: string, end: string) => void
}

function SortableZoneCard({
  entry,
  index,
  total,
  onMoveEarlier,
  onMoveLater,
  onRemove,
  onToggleTarget,
  onSetBusinessHours,
}: SortableZoneCardProps) {
  const localNow = DateTime.now().setZone(entry.zone)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as CSSProperties

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'zone-card is-dragging' : 'zone-card'}
    >
      <div className="zone-card__main">
        <button
          type="button"
          className="drag-handle"
          aria-label={`Drag ${entry.city} to reorder`}
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>

        <span>
          <strong>{entry.city}</strong>
          <small>{entry.zone}</small>
          <small>
            {localNow.toFormat('HH:mm')} local · {localNow.offsetNameShort}
          </small>
        </span>

        <div className="zone-actions" aria-label={`${entry.city} actions`}>
          <button
            type="button"
            className="remove-button"
            onClick={() => onRemove(entry.id)}
            aria-label={`Remove ${entry.city}`}
          >
            ×
          </button>

          <div
            className="reorder-controls"
            aria-label={`${entry.city} ordering`}
          >
            <button
              type="button"
              className="icon-button"
              onClick={() => onMoveEarlier(entry.id)}
              disabled={index === 0}
              aria-label={`Move ${entry.city} earlier`}
            >
              ↑
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={() => onMoveLater(entry.id)}
              disabled={index === total - 1}
              aria-label={`Move ${entry.city} later`}
            >
              ↓
            </button>
          </div>

          <button
            type="button"
            className={
              entry.isTarget ? 'target-button is-active' : 'target-button'
            }
            onClick={() => onToggleTarget(entry.id)}
          >
            {entry.isTarget ? 'Targeted' : 'Make target'}
          </button>
        </div>
      </div>

      <div className="biz-hours-row">
        <label className="biz-hours-label">
          Start
          <input
            type="time"
            className="time-input"
            value={entry.businessHours.start}
            aria-label={`${entry.city} business hours start`}
            onChange={(e) =>
              onSetBusinessHours(
                entry.id,
                e.target.value,
                entry.businessHours.end,
              )
            }
          />
        </label>
        <label className="biz-hours-label">
          End
          <input
            type="time"
            className="time-input"
            value={entry.businessHours.end}
            aria-label={`${entry.city} business hours end`}
            onChange={(e) =>
              onSetBusinessHours(
                entry.id,
                entry.businessHours.start,
                e.target.value,
              )
            }
          />
        </label>
      </div>
    </li>
  )
}

function App() {
  const {
    selectedZones,
    addZone,
    removeZone,
    reorderZones,
    setBusinessHours,
    moveZoneEarlier,
    moveZoneLater,
    toggleTarget,
    resetTargets,
  } = useAppStore()

  const [query, setQuery] = useState('')
  const [theme, setTheme] = useState<ThemeMode>(readInitialTheme)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [activeSearchIndex, setActiveSearchIndex] = useState(0)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>(
    'idle',
  )
  const referenceDate = DateTime.now()

  useEffect(() => {
    document.documentElement.dataset.theme = theme

    const storage = getThemeStorage()
    storage?.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      reorderZones(String(active.id), String(over.id))
    }
  }

  const handleCopyShareUrl = async () => {
    if (typeof window === 'undefined' || !navigator.clipboard?.writeText) {
      setShareStatus('error')
      return
    }

    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareStatus('copied')
    } catch {
      setShareStatus('error')
    }
  }

  const handleAddTimezone = (zone: string, city: string) => {
    addZone(zone, city)
    setQuery('')
    setDropdownOpen(false)
    setActiveSearchIndex(0)
  }

  const selectedZoneIanaIds = new Set(selectedZones.map((z) => z.zone))

  const filteredTimezones =
    query.length >= 1
      ? ALL_TIMEZONES.filter(
          (tz) =>
            !selectedZoneIanaIds.has(tz.zone) &&
            (tz.city.toLowerCase().includes(query.toLowerCase()) ||
              tz.zone.toLowerCase().includes(query.toLowerCase())),
        ).slice(0, 8)
      : []

  const activeSearchOption = filteredTimezones[activeSearchIndex] ?? null

  // Compute a shared UTC center hour from the first targeted zone so its
  // business hours land in the middle of every timeline card.
  const targetZone = selectedZones.find((z) => z.isTarget) ?? selectedZones[0]
  const utcCenterHour = targetZone
    ? computeUtcCenterHour(
        targetZone.businessHours.start,
        targetZone.businessHours.end,
        referenceDate.setZone(targetZone.zone).offset,
      )
    : 12

  // Compute all-zone overlap windows for visualization
  const allZoneOverlapIntervals = computeAllZoneOverlap(
    selectedZones.map((z) => ({
      tz: z.zone,
      start: z.businessHours.start,
      end: z.businessHours.end,
    })),
    referenceDate,
  )

  return (
    <div className="app-shell">
      <header className="hero-panel">
        <div className="hero-panel__content">
          <div>
            <p className="eyebrow">24x7 Operations Planner</p>
            <h1>Time zone overlap workspace</h1>
          </div>

          <form className="theme-toggle" aria-label="Color theme">
            <span className="theme-toggle__label">Theme</span>
            <div className="theme-toggle__options" role="radiogroup">
              <label className="theme-toggle__option">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={theme === 'light'}
                  onChange={() => setTheme('light')}
                />
                <span>Light</span>
              </label>
              <label className="theme-toggle__option">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={theme === 'dark'}
                  onChange={() => setTheme('dark')}
                />
                <span>Dark</span>
              </label>
            </div>
          </form>
        </div>
      </header>

      <main className="workspace-grid">
        <section
          className="panel sidebar-panel"
          aria-labelledby="zones-heading"
        >
          <div className="panel-header">
            <p className="panel-kicker">Sidebar</p>
            <h2 id="zones-heading">Timezone selection</h2>
          </div>

          <div className="timezone-search">
            <label htmlFor="tz-search" className="visually-hidden">
              Search and add timezone
            </label>
            <input
              id="tz-search"
              type="text"
              className="search-input"
              placeholder="Search and add timezone…"
              value={query}
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls="tz-search-results"
              aria-activedescendant={
                dropdownOpen && activeSearchOption
                  ? `tz-option-${activeSearchOption.zone}::${activeSearchOption.city}`
                  : undefined
              }
              aria-expanded={dropdownOpen && filteredTimezones.length > 0}
              onChange={(e) => {
                setQuery(e.target.value)
                setDropdownOpen(true)
                setActiveSearchIndex(0)
              }}
              onFocus={() => setDropdownOpen(true)}
              onKeyDown={(e) => {
                if (!filteredTimezones.length) {
                  if (e.key === 'Escape') {
                    setDropdownOpen(false)
                  }

                  return
                }

                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setDropdownOpen(true)
                  setActiveSearchIndex(
                    (current) => (current + 1) % filteredTimezones.length,
                  )
                }

                if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setDropdownOpen(true)
                  setActiveSearchIndex(
                    (current) =>
                      (current - 1 + filteredTimezones.length) %
                      filteredTimezones.length,
                  )
                }

                if (e.key === 'Enter' && activeSearchOption) {
                  e.preventDefault()
                  handleAddTimezone(
                    activeSearchOption.zone,
                    activeSearchOption.city,
                  )
                }

                if (e.key === 'Escape') {
                  setDropdownOpen(false)
                }
              }}
              onBlur={() =>
                setTimeout(() => {
                  setDropdownOpen(false)
                  setActiveSearchIndex(0)
                }, 150)
              }
            />
            {dropdownOpen && filteredTimezones.length > 0 && (
              <ul
                id="tz-search-results"
                className="search-dropdown"
                role="listbox"
                aria-label="Matching timezones"
              >
                {filteredTimezones.map((tz, index) => (
                  <li
                    id={`tz-option-${tz.zone}::${tz.city}`}
                    key={`${tz.zone}::${tz.city}`}
                    role="option"
                    aria-selected={index === activeSearchIndex}
                    className={
                      index === activeSearchIndex
                        ? 'search-option is-active'
                        : 'search-option'
                    }
                    onMouseEnter={() => setActiveSearchIndex(index)}
                    onMouseDown={() => handleAddTimezone(tz.zone, tz.city)}
                  >
                    <span className="search-option__city">{tz.city}</span>
                    <span className="search-option__zone">{tz.zone}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={selectedZones.map((z) => z.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="zone-list">
                {selectedZones.map((entry, index) => (
                  <SortableZoneCard
                    key={entry.id}
                    entry={entry}
                    index={index}
                    total={selectedZones.length}
                    onMoveEarlier={moveZoneEarlier}
                    onMoveLater={moveZoneLater}
                    onRemove={removeZone}
                    onToggleTarget={toggleTarget}
                    onSetBusinessHours={setBusinessHours}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>

          <div className="sidebar-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={resetTargets}
            >
              Reset targets
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                void handleCopyShareUrl()
              }}
            >
              Copy share URL
            </button>
            {shareStatus !== 'idle' && (
              <p className="share-status" role="status" aria-live="polite">
                {shareStatus === 'copied'
                  ? 'Share URL copied.'
                  : 'Copy failed.'}
              </p>
            )}
          </div>
        </section>

        <section
          className="panel timeline-panel"
          aria-labelledby="timeline-heading"
        >
          <div className="panel-header">
            <p className="panel-kicker">Main view</p>
            <h2 id="timeline-heading">Timezone comparison</h2>
          </div>

          <div className="timeline-legend" aria-label="Timeline meaning">
            <p className="timeline-legend__title">Reading the timeline</p>
            <ul className="timeline-legend__items">
              <li>
                <span className="timeline-legend__marker timeline-legend__marker--business" />
                Business hours
              </li>
              <li>
                <span className="timeline-legend__marker timeline-legend__marker--current" />
                Current local hour
              </li>
              {allZoneOverlapIntervals.length > 0 && (
                <li>
                  <span className="timeline-legend__marker timeline-legend__marker--overlap" />
                  Shared overlap across all zones
                </li>
              )}
              <li>
                <span className="timeline-legend__marker timeline-legend__marker--target" />
                Target zone card
              </li>
            </ul>
          </div>

          <div className="timeline-stack">
            {selectedZones.map((entry) => {
              const localNow = referenceDate.setZone(entry.zone)
              // Round to the nearest hour so half-hour offset zones (e.g.
              // Asia/Kolkata) stay close to correct until the DST engine lands.
              const zoneOffsetHours = Math.round(localNow.offset / 60)

              // Build each cell from the shared UTC window so the tracks are
              // horizontally aligned to real time differences.
              const slots = Array.from({ length: HOURS_IN_DAY }, (_, i) => {
                const utcHour =
                  (utcCenterHour - 12 + i + HOURS_IN_DAY * 2) % HOURS_IN_DAY
                const localHour =
                  (utcHour + zoneOffsetHours + HOURS_IN_DAY * 2) % HOURS_IN_DAY
                return {
                  localHour,
                  isBusinessHour: isHourWithinBusinessWindow(
                    localHour,
                    entry.businessHours.start,
                    entry.businessHours.end,
                  ),
                  isCurrentHour: localNow.hour === localHour,
                  isAllZoneOverlap: isHourInAllZoneOverlap(
                    localHour,
                    entry.zone,
                    allZoneOverlapIntervals,
                  ),
                }
              })

              return (
                <article
                  className={
                    entry.isTarget ? 'timeline-card is-target' : 'timeline-card'
                  }
                  key={entry.id}
                  style={{ '--zone-accent': entry.color } as CSSProperties}
                >
                  <div className="timeline-card__header">
                    <div>
                      <h3>{entry.city}</h3>
                      <p>{entry.zone}</p>
                      <p className="timeline-card__status">
                        {entry.isTarget ? 'Target zone' : 'Comparison zone'}
                      </p>
                    </div>

                    <div className="timeline-badges">
                      <span className="time-badge">
                        {localNow.toFormat('HH:mm')} local
                      </span>
                      <span className="time-badge">
                        {entry.businessHours.start}-{entry.businessHours.end}
                      </span>
                    </div>
                  </div>

                  <div className="timeline-card__scroll">
                    <div
                      className="timeline-card__ruler"
                      aria-label={`${entry.city} local hours`}
                    >
                      {slots.map((slot, i) => (
                        <span key={`${entry.id}-label-${i}`}>
                          {slot.localHour.toString().padStart(2, '0')}
                        </span>
                      ))}
                    </div>

                    <div className="timeline-mini-track" aria-hidden="true">
                      {slots.map((slot, i) => (
                        <span
                          key={`${entry.id}-${i}`}
                          data-hour={slot.localHour}
                          className={[
                            'timeline-mini-track__cell',
                            slot.isBusinessHour ? 'is-business-hour' : '',
                            slot.isCurrentHour ? 'is-current-hour' : '',
                            slot.isAllZoneOverlap ? 'is-all-zone-overlap' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="timeline-card__footnote">
                    {entry.isTarget
                      ? 'Target zone: this card anchors planning and timeline centering.'
                      : 'Comparison zone: included for side-by-side schedule analysis.'}
                  </p>
                </article>
              )
            })}
          </div>

          {selectedZones.length >= 2 && (
            <section
              className="overlap-matrix-section"
              aria-labelledby="matrix-heading"
            >
              <h3 id="matrix-heading" className="overlap-matrix__heading">
                Pairwise overlap summary
              </h3>
              <p className="overlap-matrix__desc">
                Total overlapping business-hour minutes for each zone pair
                today.
              </p>
              <div className="overlap-matrix-scroll">
                <table
                  className="overlap-matrix"
                  aria-label="Pairwise overlap matrix"
                >
                  <thead>
                    <tr>
                      <th scope="col" />
                      {selectedZones.map((zone) => (
                        <th
                          key={zone.id}
                          scope="col"
                          className="overlap-matrix__col-header"
                          title={zone.zone}
                        >
                          {zone.city}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedZones.map((rowZone) => (
                      <tr key={rowZone.id}>
                        <th
                          scope="row"
                          className="overlap-matrix__row-header"
                          title={rowZone.zone}
                        >
                          {rowZone.city}
                        </th>
                        {selectedZones.map((colZone) => {
                          if (rowZone.id === colZone.id) {
                            return (
                              <td
                                key={colZone.id}
                                className="overlap-matrix__cell overlap-matrix__cell--self"
                                aria-label={`${rowZone.city} same zone`}
                              >
                                —
                              </td>
                            )
                          }
                          const minutes = computePairwiseOverlapDuration(
                            rowZone.zone,
                            rowZone.businessHours.start,
                            rowZone.businessHours.end,
                            colZone.zone,
                            colZone.businessHours.start,
                            colZone.businessHours.end,
                            referenceDate,
                          )
                          const label = formatDurationLabel(minutes)
                          const intensity = Math.min(minutes / 480, 1)
                          return (
                            <td
                              key={colZone.id}
                              className={[
                                'overlap-matrix__cell',
                                minutes > 0
                                  ? 'overlap-matrix__cell--has-overlap'
                                  : 'overlap-matrix__cell--no-overlap',
                              ].join(' ')}
                              style={
                                {
                                  '--overlap-intensity': intensity,
                                } as CSSProperties
                              }
                              aria-label={`${rowZone.city} and ${colZone.city}: ${label}`}
                            >
                              {label}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
