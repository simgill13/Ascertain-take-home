import { expect, test } from '@playwright/test'

import {
  createPatientThroughUi,
  deleteLeftoverTestPatients,
  deletePatientThroughUi,
  fillPatientForm,
  uniqueLastName,
} from './helpers'

test.afterEach(async ({ request }) => {
  await deleteLeftoverTestPatients(request)
})

test.describe('coordinator journeys', () => {
  test('statuses overview shows totals, grouped patients, and a preview drawer', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(page.getByText('Patient statuses')).toBeVisible()
    await expect(page.getByRole('list', { name: 'Practice totals' })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Active \d+$/ })).toBeVisible()

    await page.getByRole('button', { name: /Maria Alvarez/ }).click()
    const drawer = page.getByRole('dialog', { name: 'Maria Alvarez' })
    await expect(drawer).toBeVisible()
    await expect(drawer.getByText('Penicillin')).toBeVisible()

    await drawer.getByRole('link', { name: 'Open chart' }).click()
    await expect(page).toHaveURL(/\/patients\/[0-9a-f-]{36}$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Maria Alvarez')
  })

  test('sidebar navigation reaches the patient list', async ({ page }) => {
    await page.goto('/')
    await page
      .getByRole('navigation', { name: 'Sidebar' })
      .getByRole('link', { name: 'Patients' })
      .click()
    await expect(page).toHaveURL(/\/patients$/)
    await expect(page.getByRole('table', { name: 'Patients' })).toBeVisible()
  })

  test('search narrows the list without blocking typing and lands in the URL', async ({ page }) => {
    await page.goto('/patients')
    await expect(page.getByRole('table', { name: 'Patients' })).toBeVisible()

    const searchBox = page.getByLabel('Search')
    await searchBox.pressSequentially('alvar', { delay: 20 })
    await expect(searchBox).toHaveValue('alvar')

    await expect(page).toHaveURL(/search=alvar/)
    await expect(page.getByRole('link', { name: 'Maria Alvarez' })).toBeVisible()
    await expect(page.getByText('Showing 1 patient', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Clear filters' }).click()
    await expect(searchBox).toHaveValue('')
    await expect(page).not.toHaveURL(/search=/)
  })

  test('a pause while typing a full name does not eat the space', async ({ page }) => {
    await page.goto('/patients')
    const searchBox = page.getByLabel('Search')

    await searchBox.pressSequentially('Henry ', { delay: 20 })
    await expect(page).toHaveURL(/search=Henry/)
    await searchBox.pressSequentially('Cald', { delay: 20 })

    await expect(searchBox).toHaveValue('Henry Cald')
    await expect(page.getByRole('link', { name: 'Henry Caldwell' })).toBeVisible()
  })

  test('status tabs and sort are reflected in the URL and results', async ({ page }) => {
    await page.goto('/patients')

    await page.getByRole('tab', { name: 'Pending intake' }).click()
    await expect(page).toHaveURL(/status=pending/)
    await expect(page.getByRole('tab', { name: 'Pending intake' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    const table = page.getByRole('table', { name: 'Patients' })
    await expect(table.getByText('Pending intake').first()).toBeVisible()
    await expect(table.getByText('Active', { exact: true })).toHaveCount(0)

    await page.getByRole('combobox', { name: 'Sort by' }).click()
    await page.getByRole('option', { name: 'Age' }).click()
    await expect(page).toHaveURL(/sort=age/)
  })

  test('404 page appears for an unknown route', async ({ page }) => {
    await page.goto('/this/does/not/exist')

    await expect(page.getByRole('heading', { name: 'This page does not exist' })).toBeVisible()
    await page.getByRole('link', { name: 'Go to dashboard' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText('Patient statuses')).toBeVisible()
  })

  test('create, edit, add a note, read the summary, delete', async ({ page }) => {
    const lastName = uniqueLastName()
    await createPatientThroughUi(page, lastName)

    const clinicalCard = page.getByRole('region', { name: 'Clinical' })
    await expect(clinicalCard.getByText('Latex')).toBeVisible()
    await expect(clinicalCard.getByText('Asthma')).toBeVisible()

    await page.getByRole('button', { name: 'More actions' }).click()
    await page.getByRole('menuitem', { name: 'Edit patient' }).click()
    await expect(page.getByRole('heading', { name: `Edit Playwright ${lastName}` })).toBeVisible()
    await page.getByLabel('Status').click()
    await page.getByRole('option', { name: 'Pending intake' }).click()
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(page).toHaveURL(/\/patients\/[0-9a-f-]{36}$/)
    const chartHeading = page.getByRole('heading', { level: 1 })
    await expect(chartHeading).toHaveText(`Playwright ${lastName}`)
    await expect(chartHeading.locator('..').getByText('Pending intake')).toBeVisible()

    const sections = page.getByRole('navigation', { name: 'Patient sections' })
    await sections.getByRole('link', { name: 'Notes' }).click()
    await page
      .getByRole('textbox', { name: 'Note' })
      .fill('Intake call completed. Records requested.')
    await page.getByRole('button', { name: 'Add note' }).click()
    await expect(page.getByText('Note added')).toBeVisible()
    await expect(
      page
        .getByRole('list', { name: 'Clinical notes' })
        .getByText('Intake call completed. Records requested.'),
    ).toBeVisible()

    await sections.getByRole('link', { name: 'Summary' }).click()
    const summaryCard = page.locator('#summary')
    await expect(summaryCard).toContainText('Intake call completed')
    await expect(summaryCard).toContainText('Latex')

    await deletePatientThroughUi(page)
  })

  test('validation errors are shown inline and the form keeps other answers', async ({ page }) => {
    await page.goto('/patients/new')
    await page.getByLabel('First name').fill('Only')

    await page.getByRole('button', { name: 'Create patient' }).click()

    await expect(page.getByText('Last name is required.')).toBeVisible()
    await expect(page.getByLabel('Last name')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByLabel('First name')).toHaveValue('Only')
  })

  test('a server validation error lands on the matching field', async ({ page }) => {
    await page.route('**/api/patients', async (route) => {
      if (route.request().method() !== 'POST') return route.continue()
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: 'The request did not pass validation.',
          errors: [
            { field: 'date_of_birth', message: 'Date of birth does not match our records.' },
          ],
        }),
      })
    })
    await page.goto('/patients/new')
    await fillPatientForm(page, uniqueLastName())

    await page.getByRole('button', { name: 'Create patient' }).click()

    await expect(page.getByText('Date of birth does not match our records.')).toBeVisible()
    await expect(page.getByLabel('Date of birth')).toHaveAttribute('aria-invalid', 'true')
  })

  test('a lost connection shows a retry instead of a silent failure', async ({ page }) => {
    await page.route('**/api/patients?*', (route) => route.abort('connectionrefused'))
    await page.goto('/patients')

    const connectionAlert = page.getByRole('alert')
    await expect(connectionAlert).toContainText('Connection problem')
    await page.unroute('**/api/patients?*')

    await connectionAlert.getByRole('button', { name: 'Try again' }).click()
    await expect(page.getByRole('table', { name: 'Patients' })).toBeVisible()
  })
})
