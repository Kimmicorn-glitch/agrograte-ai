import { test, expect } from '@playwright/test'

test.describe('Login flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('renders login page', async ({ page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: /sign in|login/i }).first()).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('shows error on invalid credentials', async ({ page }) => {
    await page.locator('input[type="email"]').fill('wrong@example.com')
    await page.locator('input[type="password"]').fill('invalid')
    await page.locator('button[type="submit"]').click()
    await expect(page.locator('text=/invalid|error|failed/i')).toBeVisible({ timeout: 10000 })
  })

  test('navigates to dashboard on successful login', async ({ page }) => {
    await page.locator('input[type="email"]').fill('admin@agrograte.ai')
    await page.locator('input[type="password"]').fill('correct-password')
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
    await expect(page.locator('text=Command Center')).toBeVisible()
  })
})
