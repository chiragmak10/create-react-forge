import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/test-2/);
  });

  test('displays welcome message', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /welcome/i })
    ).toBeVisible();
  });

  test('has get started link', async ({ page }) => {
    const getStartedLink = page.getByRole('link', { name: /get started/i });
    await expect(getStartedLink).toBeVisible();
  });

  test('navigates to dashboard on get started click', async ({ page }) => {
    await page.getByRole('link', { name: /get started/i }).click();
    await expect(page).toHaveURL(/.*dashboard/);
  });
});

test.describe('404 Page', () => {
  test('shows not found for invalid routes', async ({ page }) => {
    await page.goto('/invalid-route-that-does-not-exist');
    await expect(page.getByText(/page not found/i)).toBeVisible();
  });

  test('has link back to home', async ({ page }) => {
    await page.goto('/invalid-route');
    await page.getByRole('link', { name: /go back home/i }).click();
    await expect(page).toHaveURL('/');
  });
});

