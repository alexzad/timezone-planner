import type { CSSProperties } from 'react'
import { DateTime } from 'luxon'
import './App.css'
import { useAppStore } from './state/appStore'

const iterationChecklist = [
  'Core app state is defined',
  'Seeded timezone scenario is loaded',
  'Timezone list is rendered from state',
]

function App() {
  const updatedAt = DateTime.now().toFormat('ccc, dd LLL yyyy HH:mm')
  const { selectedZones, toggleTarget, resetTargets } = useAppStore()
  const targetCount = selectedZones.filter((entry) => entry.isTarget).length

  return (
    <div className="app-shell">
      <header className="hero-panel">
        <div>
          <p className="eyebrow">24x7 Operations Planner</p>
          <h1>Time zone overlap workspace</h1>
          <p className="hero-copy">
            Iteration 1 replaces the static preview with real application state,
            a seeded global scenario, and target-zone toggles you can test.
          </p>
        </div>

        <div className="hero-status" aria-label="Project readiness summary">
          <span className="status-chip">Iteration 1</span>
          <span className="status-text">
            State-driven timezone preview ready
          </span>
          <span className="status-meta">
            {selectedZones.length} zones loaded, {targetCount} target
            {targetCount === 1 ? '' : 's'} selected
          </span>
          <span className="status-meta">Updated {updatedAt}</span>
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
            Search and add come next. For now, this seeded scenario is driven by
            the real app store.
          </div>

          <ul className="zone-list">
            {selectedZones.map((entry) => {
              const localNow = DateTime.now().setZone(entry.zone)

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

          <div className="timeline-ruler" aria-hidden="true">
            {Array.from({ length: 24 }, (_, hour) => (
              <span key={hour}>{hour.toString().padStart(2, '0')}</span>
            ))}
          </div>

          <div className="timeline-stack">
            {selectedZones.map((entry) => {
              const localNow = DateTime.now().setZone(entry.zone)

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

                  <div className="timeline-mini-track" aria-hidden="true">
                    {Array.from({ length: 24 }, (_, hour) => {
                      const isBusinessHour = hour >= 9 && hour < 17
                      const isCurrentHour = localNow.hour === hour

                      return (
                        <span
                          key={`${entry.id}-${hour}`}
                          className={[
                            'timeline-mini-track__cell',
                            isBusinessHour ? 'is-business-hour' : '',
                            isCurrentHour ? 'is-current-hour' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        />
                      )
                    })}
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

        <aside
          className="panel analysis-panel"
          aria-labelledby="analysis-heading"
        >
          <div className="panel-header">
            <p className="panel-kicker">Analysis</p>
            <h2 id="analysis-heading">Checkpoint tracker</h2>
          </div>

          <ol className="checklist">
            {iterationChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>

          <div className="note-card">
            <h3>What to test now</h3>
            <p>
              Toggle target zones in the sidebar and verify that the target
              count, button state, and highlighted rows update immediately.
            </p>
          </div>

          <div className="summary-card">
            <h3>Seeded scenario</h3>
            <dl className="summary-list">
              <div>
                <dt>Loaded zones</dt>
                <dd>{selectedZones.length}</dd>
              </div>
              <div>
                <dt>Current targets</dt>
                <dd>{targetCount}</dd>
              </div>
              <div>
                <dt>Weekday business hours</dt>
                <dd>09:00-17:00</dd>
              </div>
            </dl>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App
