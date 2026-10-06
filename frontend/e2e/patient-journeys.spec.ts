import { expect, test } from '@playwright/test'

import { createPatientThroughUi, deletePatientThroughUi, uniqueLastName } from './helpers'

test.describe('coordinator journeys', () => {
  test('dashboard shows practice totals and links to the patient list', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText('Total patients')).toBeVisible()
    await expect(page.getByRole('img', { name: /Active: \d+ of \d+/ })).toBeVisible()

    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'Patients' })
      .click()
    await expect(page).toHaveURL(/\/patients$/)
  })

  test('search narrows the list without blocking typing and lands in the URL', async ({ page }) => {
    await page.goto('/patients')
    await expect(page.getByRole('table', { name: 'Patients' })).toBeVisible()

    const search = page.getByLabel('Search')
    await search.pressSequentially('alvar', { delay: 20 })
    await expect(search).toHaveValue('alvar')

    await expect(page).toHaveURL(/search=alvar/)
    await expect(page.getByRole('link', { name: 'Alvarez, Maria' })).toBeVisible()
    await expect(page.getByText('1 patient', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Clear filters' }).click()
    await expect(search).toHaveValue('')
    await expect(page).not.toHaveURL(/search=/)
  })

  test('status filter and sort are reflected in the URL and results', async ({ page }) => {
    await page.goto('/patients')

    await page.getByLabel('Status').click()
    await page.getByRole('option', { name: 'Pending intake' }).click()
    await expect(page).toHaveURL(/status=pending/)
    const statusBadges = page.getByRole('table', { name: 'Patients' }).getByText('Pending intake')
    await expect(statusBadges.first()).toBeVisible()
    await expect(
      page.getByRole('table', { name: 'Patients' }).getByText('Active', { exact: true }),
    ).toHaveCount(0)

    await page.getByLabel('Sort by').click()
    await page.getByRole('option', { name: 'Age' }).click()
    await expect(page).toHaveURL(/sort=age/)
  })

  test('404 page appears for an unknown route', async ({ page }) => {
    await page.goto('/this/does/not/exist')

    await expect(page.getByRole('heading', { name: 'This page does not exist' })).toBeVisible()
    await page.getByRole('link', { name: 'Go to dashboard' }).click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('create, edit, add a note, read the summary, delete', async ({ page }) => {
    const lastName = uniqueLastName()
    await createPatientThroughUi(page, lastName)

    const clinicalCard = page.getByRole('region', { name: 'Clinical' })
    await expect(clinicalCard.getByText('Latex')).toBeVisible()
    await expect(clinicalCard.getByText('Asthma')).toBeVisible()

    await page.getByRole('link', { name: 'Edit' }).click()
    await expect(page.getByRole('heading', { name: `Edit Playwright ${lastName}` })).toBeVisible()
    await page.getByLabel('Status').click()
    await page.getByRole('option', { name: 'Pending intake' }).click()
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toContainText(lastName)
    await expect(page.getByText('Pending intake')).toBeVisible()

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

    const summary = page.locator('#summary')
    await expect(summary).toContainText('Intake call completed')
    await expect(summary).toContainText('Latex')

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
    const { fillPatientForm } = await import('./helpers')
    await fillPatientForm(page, uniqueLastName())

    await page.getByRole('button', { name: 'Create patient' }).click()

    await expect(page.getByText('Date of birth does not match our records.')).toBeVisible()
    await expect(page.getByLabel('Date of birth')).toHaveAttribute('aria-invalid', 'true')
  })

  test('a lost connection shows a retry instead of a silent failure', async ({ page }) => {
    await page.route('**/api/patients?*', (route) => route.abort('connectionrefused'))
    await page.goto('/patients')

    const alert = page.getByRole('alert')
    await expect(alert).toContainText('Connection problem')
    await page.unroute('**/api/patients?*')

    await alert.getByRole('button', { name: 'Try again' }).click()
    await expect(page.getByRole('table', { name: 'Patients' })).toBeVisible()
  })
})
