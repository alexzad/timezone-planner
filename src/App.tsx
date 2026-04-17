import { DateTime } from 'luxon'
import './App.css'

const previewZones = [
  { city: 'San Francisco', zone: 'America/Los_Angeles' },
  { city: 'London', zone: 'Europe/London' },
  { city: 'Singapore', zone: 'Asia/Singapore' },
]

const iterationChecklist = [
  'Project shell is in place',
  'Core dependencies are installed',
  'Test runner and formatting commands are configured',
]

function App() {
  const updatedAt = DateTime.now().toFormat('ccc, dd LLL yyyy HH:mm')

  return (
    <div className="app-shell">
      <header className="hero-panel">
        <div>
          <p className="eyebrow">24x7 Operations Planner</p>
          <h1>Time zone overlap workspace</h1>
          <p className="hero-copy">
            This first checkpoint establishes the project frame for timezone
            selection, overlap visualization, and coverage analysis.
          </p>
        </div>

        <div className="hero-status" aria-label="Project readiness summary">
          <span className="status-chip">Iteration 0</span>
          <span className="status-text">App shell ready for feature work</span>
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

          <div className="search-placeholder" aria-hidden="true">
            Search IANA timezone list
          </div>

          <ul className="zone-list">
            {previewZones.map((entry) => (
              <li className="zone-card" key={entry.zone}>
                <span>
                  <strong>{entry.city}</strong>
                  <small>{entry.zone}</small>
                </span>
                <button type="button" disabled>
                  Target
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="panel timeline-panel"
          aria-labelledby="timeline-heading"
        >
          <div className="panel-header">
            <p className="panel-kicker">Main view</p>
            <h2 id="timeline-heading">Timeline canvas</h2>
          </div>

          <div className="timeline-ruler" aria-hidden="true">
            {Array.from({ length: 24 }, (_, hour) => (
              <span key={hour}>{hour.toString().padStart(2, '0')}</span>
            ))}
          </div>

          <div className="timeline-placeholder">
            <p>
              Timezone rows, business hours, and overlap bands will render here.
            </p>
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
            <h3>Next implementation slice</h3>
            <p>
              Replace the preview cards with real application state and add the
              timezone search flow.
            </p>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App
