import { expect, test } from '@playwright/test'

test.describe('time zone overlap workspace', () => {
  test('loads the seeded scenario', async ({ page }) => {
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: /time zone overlap workspace/i }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /timezone selection/i }),
    ).toBeVisible()
    await expect(page.getByText('New York').first()).toBeVisible()
    await expect(page.getByText('London').first()).toBeVisible()
    await expect(page.getByText('Tokyo').first()).toBeVisible()
  })

  test('adds a timezone with keyboard search', async ({ page }) => {
    await page.goto('/')

    const search = page.getByRole('textbox', {
      name: /search and add timezone/i,
    })

    await search.click()
    await search.fill('Paris')
    await search.press('Enter')

    await expect(page.getByText('Paris').first()).toBeVisible()
  })

  test('shows overlap meaning only in the timeline legend', async ({
    page,
  }) => {
    await page.goto(
      '/?tz=%7B%22version%22%3A1%2C%22selectedZones%22%3A%5B%7B%22id%22%3A%22new-york%22%2C%22city%22%3A%22New%20York%22%2C%22zone%22%3A%22America%2FNew_York%22%2C%22color%22%3A%22%234dd0e1%22%2C%22isTarget%22%3Atrue%2C%22businessHours%22%3A%7B%22start%22%3A%2214%3A00%22%2C%22end%22%3A%2218%3A00%22%2C%22weekdaysOnly%22%3Atrue%7D%7D%2C%7B%22id%22%3A%22london%22%2C%22city%22%3A%22London%22%2C%22zone%22%3A%22Europe%2FLondon%22%2C%22color%22%3A%22%23ffb74d%22%2C%22isTarget%22%3Afalse%2C%22businessHours%22%3A%7B%22start%22%3A%2219%3A00%22%2C%22end%22%3A%2223%3A00%22%2C%22weekdaysOnly%22%3Atrue%7D%7D%2C%7B%22id%22%3A%22tokyo%22%2C%22city%22%3A%22Tokyo%22%2C%22zone%22%3A%22Asia%2FTokyo%22%2C%22color%22%3A%22%2381c784%22%2C%22isTarget%22%3Afalse%2C%22businessHours%22%3A%7B%22start%22%3A%2203%3A00%22%2C%22end%22%3A%2207%3A00%22%2C%22weekdaysOnly%22%3Atrue%7D%7D%5D%7D',
    )

    await expect(page.getByText(/reading the timeline/i)).toBeVisible()
    await expect(
      page.getByText(/shared overlap across all zones/i),
    ).toBeVisible()
    await expect(page.getByText(/shared overlap window/i)).toHaveCount(0)
  })

  test('switches between dark and light themes from the header toggle', async ({
    page,
  }) => {
    await page.goto('/')

    await page.evaluate(() => {
      window.localStorage.setItem('timezone-planner/theme', 'dark')
    })
    await page.reload()

    const lightTheme = page.getByRole('radio', { name: /light/i })
    const darkTheme = page.getByRole('radio', { name: /dark/i })

    await expect(darkTheme).toBeChecked()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    await lightTheme.check({ force: true })

    await expect(lightTheme).toBeChecked()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

    await page.reload()

    await expect(lightTheme).toBeChecked()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

    await darkTheme.check({ force: true })

    await expect(darkTheme).toBeChecked()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })
})
