import { render, screen } from '@testing-library/react'
import App from './App'

describe('App shell', () => {
  it('renders the iteration 0 workspace regions', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /time zone overlap workspace/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /timezone selection/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /timeline canvas/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /checkpoint tracker/i }),
    ).toBeInTheDocument()
  })
})
