import { fireEvent, render, screen, within } from '@testing-library/react'
import App from './App'
import {
  clearPersistedState,
  cloneSeededTimeZones,
  useAppStore,
} from './state/appStore'

describe('App shell', () => {
  beforeEach(() => {
    clearPersistedState()
    useAppStore.setState({ selectedZones: cloneSeededTimeZones() })
  })

  it('renders workspace regions and seeded timezone state', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /time zone overlap workspace/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /timezone selection/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /timezone comparison/i }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('New York').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('London').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('Tokyo').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByLabelText('New York local hours')).toBeInTheDocument()
    expect(screen.getByLabelText('London local hours')).toBeInTheDocument()
    expect(screen.getByLabelText('Tokyo local hours')).toBeInTheDocument()
  })

  it('renders business hours from each timezone preset instead of a shared fixed range', () => {
    const customZones = cloneSeededTimeZones()

    customZones[0].businessHours = {
      start: '07:00',
      end: '15:00',
      weekdaysOnly: true,
    }
    customZones[1].businessHours = {
      start: '12:00',
      end: '18:00',
      weekdaysOnly: true,
    }
    customZones[2].businessHours = {
      start: '22:00',
      end: '06:00',
      weekdaysOnly: true,
    }

    useAppStore.setState({ selectedZones: customZones })

    render(<App />)

    const getBusinessHoursForCard = (city: string) => {
      const card = screen
        .getByRole('heading', { name: city, level: 3 })
        .closest('article')

      expect(card).not.toBeNull()

      // Sort values so overnight windows that wrap the track edge don't
      // produce an order-dependent result.
      return Array.from(
        (card as HTMLElement).querySelectorAll(
          '.timeline-mini-track__cell.is-business-hour',
        ),
      )
        .map((cell) => Number(cell.getAttribute('data-hour')))
        .sort((a, b) => a - b)
    }

    expect(getBusinessHoursForCard('New York')).toEqual([
      7, 8, 9, 10, 11, 12, 13, 14,
    ])
    expect(getBusinessHoursForCard('London')).toEqual([12, 13, 14, 15, 16, 17])
    expect(getBusinessHoursForCard('Tokyo')).toEqual([0, 1, 2, 3, 4, 5, 22, 23])
  })

  it('updates the UI when a target zone is toggled', () => {
    render(<App />)

    const londonCard = screen.getAllByText('London')[0]?.closest('li')

    expect(londonCard).not.toBeNull()

    fireEvent.click(
      within(londonCard as HTMLElement).getByRole('button', {
        name: /make target/i,
      }),
    )

    expect(screen.getAllByRole('button', { name: /targeted/i })).toHaveLength(2)

    const timelinePanel = screen
      .getByRole('heading', {
        name: /timezone comparison/i,
      })
      .closest('section')

    expect(timelinePanel).not.toBeNull()
    expect(
      (timelinePanel as HTMLElement).querySelectorAll(
        '.timeline-card.is-target',
      ),
    ).toHaveLength(2)
  })

  it('reorders timezone cards and timeline rows from the sidebar controls', () => {
    render(<App />)

    fireEvent.click(
      screen.getByRole('button', {
        name: /move tokyo earlier/i,
      }),
    )

    expect(
      useAppStore.getState().selectedZones.map((entry) => entry.id),
    ).toEqual(['new-york', 'tokyo', 'london'])

    const timezoneCards = screen.getAllByRole('listitem')

    expect(
      within(timezoneCards[1] as HTMLElement).getByText('Tokyo'),
    ).toBeInTheDocument()

    const timelinePanel = screen
      .getByRole('heading', {
        name: /timezone comparison/i,
      })
      .closest('section')

    expect(timelinePanel).not.toBeNull()

    const timelineHeadings = within(timelinePanel as HTMLElement)
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent)
      .filter((t) => ['New York', 'Tokyo', 'London'].includes(t ?? ''))

    expect(timelineHeadings).toEqual(['New York', 'Tokyo', 'London'])
  })

  it('adds a timezone via search and updates the sidebar and timeline', () => {
    render(<App />)

    const input = screen.getByRole('textbox', {
      name: /search and add timezone/i,
    })

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Paris' } })

    const options = screen.getAllByRole('option', { name: /paris/i })
    fireEvent.mouseDown(options[0])

    expect(useAppStore.getState().selectedZones).toHaveLength(4)
    expect(useAppStore.getState().selectedZones.map((z) => z.city)).toContain(
      'Paris',
    )
    expect(screen.getAllByText('Paris')).not.toHaveLength(0)
  })

  it('supports keyboard selection in timezone search', () => {
    render(<App />)

    const input = screen.getByRole('textbox', {
      name: /search and add timezone/i,
    })

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Paris' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(useAppStore.getState().selectedZones.map((z) => z.city)).toContain(
      'Paris',
    )
  })

  it('removes a timezone from the selected list via the remove button', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /remove london/i }))

    expect(useAppStore.getState().selectedZones).toHaveLength(2)
    expect(screen.queryByText('Europe/London')).not.toBeInTheDocument()
  })

  it('updates business hours when a time input changes', () => {
    render(<App />)

    const startInput = screen.getByLabelText(/new york business hours start/i)

    fireEvent.change(startInput, { target: { value: '08:00' } })

    expect(
      useAppStore.getState().selectedZones.find((z) => z.id === 'new-york')
        ?.businessHours.start,
    ).toBe('08:00')

    expect(screen.getAllByText('08:00-17:00')[0]).toBeInTheDocument()
  })

  it('does not render a separate shared overlap panel when zones overlap', () => {
    const customZones = cloneSeededTimeZones()

    customZones[0].businessHours = {
      start: '14:00',
      end: '18:00',
      weekdaysOnly: true,
    }
    customZones[1].businessHours = {
      start: '19:00',
      end: '23:00',
      weekdaysOnly: true,
    }
    customZones[2].businessHours = {
      start: '03:00',
      end: '07:00',
      weekdaysOnly: true,
    }

    useAppStore.setState({ selectedZones: customZones })
    render(<App />)

    expect(screen.queryByText(/shared overlap window/i)).not.toBeInTheDocument()
    expect(
      screen.getByText(/shared overlap across all zones/i),
    ).toBeInTheDocument()
  })

  it('renders explicit timeline meaning cues beyond color alone', () => {
    render(<App />)

    expect(screen.getByText(/reading the timeline/i)).toBeInTheDocument()
    expect(screen.getByText(/business hours/i)).toBeInTheDocument()
    expect(screen.getByText(/current local hour/i)).toBeInTheDocument()
    expect(
      screen.queryByText(/shared overlap across all zones/i),
    ).not.toBeInTheDocument()
    expect(screen.getByText(/target zone card/i)).toBeInTheDocument()
  })

  it('adds overlap meaning to the timeline legend only when all-zone overlap exists', () => {
    const customZones = cloneSeededTimeZones()

    customZones[0].businessHours = {
      start: '14:00',
      end: '18:00',
      weekdaysOnly: true,
    }
    customZones[1].businessHours = {
      start: '19:00',
      end: '23:00',
      weekdaysOnly: true,
    }
    customZones[2].businessHours = {
      start: '03:00',
      end: '07:00',
      weekdaysOnly: true,
    }

    useAppStore.setState({ selectedZones: customZones })
    render(<App />)

    expect(
      screen.getByText(/shared overlap across all zones/i),
    ).toBeInTheDocument()
  })

  it('renders pairwise overlap matrix for all zone pairs', () => {
    render(<App />)

    // Matrix heading should appear when 2+ zones present
    expect(
      screen.getByRole('heading', { name: /pairwise overlap summary/i }),
    ).toBeInTheDocument()

    // Table should have accessible label
    expect(
      screen.getByRole('table', { name: /pairwise overlap matrix/i }),
    ).toBeInTheDocument()

    // All city names appear as both row and column headers
    const colHeaders = screen.getAllByRole('columnheader')
    const rowHeaders = screen.getAllByRole('rowheader')

    const cityNames = ['New York', 'London', 'Tokyo']
    for (const city of cityNames) {
      expect(colHeaders.some((h) => h.textContent?.includes(city))).toBe(true)
      expect(rowHeaders.some((h) => h.textContent?.includes(city))).toBe(true)
    }

    // Self-diagonal cells show em-dash
    const cells = screen.getAllByRole('cell')
    const selfCells = cells.filter((c) =>
      c.getAttribute('aria-label')?.match(/same zone/i),
    )
    expect(selfCells.length).toBe(3) // one per zone
  })

  it('shows correct overlap label for two zones with known overlap', () => {
    const customZones = cloneSeededTimeZones().slice(0, 2)
    // New York (UTC-5): 09:00-17:00 = 14:00-22:00 UTC
    // London (UTC+0): 09:00-17:00 = 09:00-17:00 UTC
    // Overlap: 14:00-17:00 UTC = 3h = 180 min
    customZones[0].businessHours = {
      start: '09:00',
      end: '17:00',
      weekdaysOnly: false,
    }
    customZones[1].businessHours = {
      start: '09:00',
      end: '17:00',
      weekdaysOnly: false,
    }

    useAppStore.setState({ selectedZones: customZones })
    render(<App />)

    // Should show "3h" for New York ↔ London (180 minutes = 3h exact)
    const nyLondonCell = screen.getByRole('cell', {
      name: /new york and london/i,
    })
    expect(nyLondonCell).toBeInTheDocument()
    expect(nyLondonCell.textContent).toBe('3h')
  })
})
