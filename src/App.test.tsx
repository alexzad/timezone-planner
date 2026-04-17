import { fireEvent, render, screen, within } from '@testing-library/react'
import App from './App'
import { cloneSeededTimeZones, useAppStore } from './state/appStore'

describe('App shell', () => {
  beforeEach(() => {
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
    expect(screen.getAllByText('New York')).toHaveLength(2)
    expect(screen.getAllByText('London')).toHaveLength(2)
    expect(screen.getAllByText('Tokyo')).toHaveLength(2)
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

    expect(timelineHeadings).toEqual(['New York', 'Tokyo', 'London'])
  })

  it('adds a timezone via search and updates the sidebar and timeline', () => {
    render(<App />)

    const input = screen.getByRole('textbox', {
      name: /search and add timezone/i,
    })

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Paris' } })

    const option = screen.getByRole('option', { name: /paris/i })
    fireEvent.mouseDown(option)

    expect(useAppStore.getState().selectedZones).toHaveLength(4)
    expect(useAppStore.getState().selectedZones.map((z) => z.city)).toContain(
      'Paris',
    )
    expect(screen.getAllByText('Paris')).not.toHaveLength(0)
  })

  it('removes a timezone from the selected list via the remove button', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /remove london/i }))

    expect(useAppStore.getState().selectedZones).toHaveLength(2)
    expect(screen.queryByText('Europe/London')).not.toBeInTheDocument()
  })
})
