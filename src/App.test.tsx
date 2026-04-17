import { fireEvent, render, screen, within } from '@testing-library/react'
import App from './App'
import { cloneSeededTimeZones, useAppStore } from './state/appStore'

describe('App shell', () => {
  beforeEach(() => {
    useAppStore.setState({ selectedZones: cloneSeededTimeZones() })
  })

  it('renders the iteration 1 workspace regions and seeded timezone state', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /time zone overlap workspace/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /timezone selection/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /seeded timezone rows/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /checkpoint tracker/i }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('New York')).toHaveLength(2)
    expect(screen.getAllByText('London')).toHaveLength(2)
    expect(screen.getAllByText('Tokyo')).toHaveLength(2)
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

    expect(screen.getByText(/2 targets selected/i)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /targeted/i })).toHaveLength(2)
  })
})
