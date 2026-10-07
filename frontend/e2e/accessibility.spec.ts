import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
  const summary = results.violations.map(
    (violation) =>
      `${violation.id} (${violation.impact}): ${violation.nodes.length} node(s) - ${violation.help}`,
  )
  expect(summary, summary.join('\n')).toEqual([])
}

test.describe('accessibility', () => {
  test('dashboard has no WCAG violations', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Total patients')).toBeVisible()
    await expectNoAxeViolations(page)
  })

  test('patient list has no WCAG violations', async ({ page }) => {
    await page.goto('/patients')
    await expect(page.getByRole('table', { name: 'Patients' })).toBeVisible()
    await expectNoAxeViolations(page)
  })

  test('patient detail has no WCAG violations', async ({ page }) => {
    await page.goto('/patients?search=alvarez')
    await page.getByRole('link', { name: 'Alvarez, Maria' }).click()
    await expect(page.locator('#summary')).toContainText('Maria Alvarez')
    await expectNoAxeViolations(page)
  })

  test('new patient form has no WCAG violations, including error state', async ({ page }) => {
    await page.goto('/patients/new')
    await page.getByRole('button', { name: 'Create patient' }).click()
    await expect(page.getByText('First name is required.')).toBeVisible()
    await expectNoAxeViolations(page)
  })

  test('no route overflows horizontally at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    const routes = ['/', '/patients', '/patients/new', '/welcome', '/missing-route']
    for (const route of routes) {
      await page.goto(route)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await page.waitForLoadState('networkidle')
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(scrollWidth, `${route} overflows`).toBeLessThanOrEqual(320)
    }

    await page.goto('/patients?search=alvarez')
    await page.getByRole('link', { name: 'Alvarez, Maria' }).click()
    await expect(page.locator('#summary')).toContainText('Maria Alvarez')
    const detailScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(detailScrollWidth, '/patients/:id overflows').toBeLessThanOrEqual(320)
  })

  test('list stays usable at a narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await page.goto('/patients')
    await expect(page.getByRole('table', { name: 'Patients' })).toBeVisible()

    await page.getByRole('button', { name: 'Open navigation' }).click()
    await expect(page.getByRole('dialog', { name: 'Navigation' })).toBeVisible()
    await expectNoAxeViolations(page)
  })

  test('dark theme keeps contrast', async ({ page }) => {
    await page.goto('/patients')
    await page.getByRole('button', { name: 'Switch to dark theme' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expectNoAxeViolations(page)
  })
})
