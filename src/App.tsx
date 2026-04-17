import type { CSSProperties } from 'react'
import { DateTime } from 'luxon'
import './App.css'
import { useAppStore } from './state/appStore'

const HOURS_IN_DAY = 24

const parseTimeToMinutes = (value: string): number => {
  const [hours, minutes] = value.split(':').map(Number)

  return hours * 60 + minutes
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

function App() {
  const {
    selectedZones,
    moveZoneEarlier,
    moveZoneLater,
    toggleTarget,
    resetTargets,
  } = useAppStore()

  // Compute a shared UTC center hour from the first targeted zone so its
  // business hours land in the middle of every timeline card.
  const targetZone = selectedZones.find((z) => z.isTarget) ?? selectedZones[0]
  const utcCenterHour = targetZone
    ? computeUtcCenterHour(
        targetZone.businessHours.start,
        targetZone.businessHours.end,
        DateTime.now().setZone(targetZone.zone).offset,
      )
    : 12

  return (
    <div className="app-shell">
      <header className="hero-panel">
        <div>
          <p className="eyebrow">24x7 Operations Planner</p>
          <h1>Time zone overlap workspace</h1>
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

          <div className="search-placeholder">
            Search and add come next. This slice adds ordering controls so you
            can test state-backed row movement before drag and drop lands.
          </div>

          <ul className="zone-list">
            {selectedZones.map((entry, index) => {
              const localNow = DateTime.now().setZone(entry.zone)
              const isFirst = index === 0
              const isLast = index === selectedZones.length - 1

              return (
                <li className="zone-card" key={entry.id}>
                  <span>
                    <strong>{entry.city}</strong>
                    <small>{entry.zone}</small>
                    <small>
                      {localNow.toFormat('HH:mm')} local ·{' '}
                      {localNow.offsetNameShort}
                    </small>
                  </span>

                  <div
                    className="zone-actions"
                    aria-label={`${entry.city} actions`}
                  >
                    <div
                      className="reorder-controls"
                      aria-label={`${entry.city} ordering`}
                    >
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => moveZoneEarlier(entry.id)}
                        disabled={isFirst}
                        aria-label={`Move ${entry.city} earlier`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => moveZoneLater(entry.id)}
                        disabled={isLast}
                        aria-label={`Move ${entry.city} later`}
                      >
                        ↓
                      </button>
                    </div>

                    <button
                      type="button"
                      className={
                        entry.isTarget
                          ? 'target-button is-active'
                          : 'target-button'
                      }
                      onClick={() => toggleTarget(entry.id)}
                    >
                      {entry.isTarget ? 'Targeted' : 'Make target'}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          <button
            type="button"
            className="secondary-button"
            onClick={resetTargets}
          >
            Reset targets
          </button>
        </section>

        <section
          className="panel timeline-panel"
          aria-labelledby="timeline-heading"
        >
          <div className="panel-header">
            <p className="panel-kicker">Main view</p>
            <h2 id="timeline-heading">Seeded timezone rows</h2>
          </div>

          <div className="timeline-stack">
            {selectedZones.map((entry) => {
              const localNow = DateTime.now().setZone(entry.zone)
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
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      />
                    ))}
                  </div>

                  <p className="timeline-card__footnote">
                    {entry.isTarget
                      ? 'Included in target-focused planning.'
                      : 'Available for comparison and future overlap analysis.'}
                  </p>
                </article>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
