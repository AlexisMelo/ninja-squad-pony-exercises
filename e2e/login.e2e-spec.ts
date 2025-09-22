import { expect, test } from '@playwright/test';

test.describe('Login page', () => {
  const user = {
    id: 1,
    login: 'cedric',
    money: 1000,
    registrationInstant: '2015-12-01T11:00:00Z',
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.5cAW816GUAg3OWKWlsYyXI4w3fDrS5BpnmbyBjVM7lo'
  };

  test('should display a login page', async ({ page }) => {
    await page.route('**/api/users/authentication', async route => {
      await route.fulfill({
        status: 200,
        json: user
      });
    });

    await page.goto('/login');

    const loginInput = page.locator('input').first();
    const passwordInput = page.locator('input[type=password]');
    const errorMessage = page.locator('.invalid-feedback');
    const submitButton = page.locator('form > button');

    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled();

    await loginInput.fill('c');
    await loginInput.clear();
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Login is required');

    await loginInput.fill('ced');
    await expect(errorMessage).not.toBeVisible();

    await passwordInput.fill('p');
    await passwordInput.clear();
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Password is required');

    await passwordInput.fill('pa');
    await expect(errorMessage).not.toBeVisible();

    const response = page.waitForResponse('**/api/users/authentication');
    await submitButton.click();
    await response;

    await expect(page).toHaveURL('/');
  });

  test('should display an alert if login fails', async ({ page }) => {
    await page.route('**/api/users/authentication', async route => {
      await route.fulfill({
        status: 404
      });
    });

    await page.goto('/login');

    const loginInput = page.locator('input').first();
    const passwordInput = page.locator('input[type=password]');
    const submitButton = page.locator('form > button');

    await loginInput.fill('ced');
    await passwordInput.fill('pa');

    const response = page.waitForResponse('**/api/users/authentication');
    await submitButton.click();
    await response;

    await expect(page).toHaveURL('/login');
    await expect(page.locator('.alert-danger')).toContainText('Nope, try again');
  });
});
