import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.describe('first visit', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('a new visitor lands on the welcome page once, then on the dashboard', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/welcome$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('built by a team of agents')

    await page.getByRole('main').getByRole('link', { name: 'Open dashboard' }).first().click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText('Patient statuses')).toBeVisible()

    await page.goto('/')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText('Patient statuses')).toBeVisible()
  })
})

test.describe('welcome landing', () => {
  test('the call to action opens the dashboard', async ({ page }) => {
    await page.goto('/welcome')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'A patient dashboard, built by a team of agents.',
    )

    await page.getByRole('main').getByRole('link', { name: 'Open dashboard' }).first().click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText('Patient statuses')).toBeVisible()
  })

  test('has no WCAG violations', async ({ page }) => {
    await page.goto('/welcome')
    // The hero fades in; contrast must be measured on the settled page, not mid-transition.
    const heroCallToAction = page
      .getByRole('main')
      .getByRole('link', { name: 'Open dashboard' })
      .first()
    await expect(heroCallToAction.locator('..')).toHaveCSS('opacity', '1')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()

    expect(results.violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([])
  })

  test('reduced motion shows all content without scroll-linked animation', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto('/welcome')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(
      page.getByRole('main').getByRole('link', { name: 'Open dashboard' }).first(),
    ).toBeVisible()
    for (const title of [
      'How it was built',
      'The agent team',
      'Backend versus frontend',
      'Built to scale to a million users',
    ]) {
      await expect(page.getByRole('heading', { name: title })).toBeVisible()
    }

    // With reduced motion the stack is static: scrolling must not change its transform.
    const stack = page.locator('[style*="perspective"] > div').first()
    const before = await stack.evaluate((element) => getComputedStyle(element).transform)
    await page.mouse.wheel(0, 400)
    await page.waitForTimeout(300)
    const after = await stack.evaluate((element) => getComputedStyle(element).transform)
    expect(after).toBe(before)

    await context.close()
  })

  test('is usable at a narrow viewport without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await page.goto('/welcome')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(overflows).toBe(false)
  })
})
