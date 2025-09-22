import { expect, test } from '@playwright/test';

test.describe('Register page', () => {
  const user = {
    id: 1,
    login: 'cedric',
    money: 1000,
    registrationInstant: '2015-12-01T11:00:00Z',
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.5cAW816GUAg3OWKWlsYyXI4w3fDrS5BpnmbyBjVM7lo'
  };

  test('should display a register page', async ({ page }) => {
    await page.route('**/api/users', async route => {
      await route.fulfill({
        status: 200,
        json: user
      });
    });

    await page.goto('/register');

    const loginInput = page.locator('input').first();
    const passwordInput = page.locator('input[type=password]').first();
    const confirmInput = page.locator('input[type=password]').nth(1);
    const birthYearInput = page.locator('input[type=number]');
    const submitButton = page.locator('form > button');

    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled();

    await loginInput.fill('c');
    await loginInput.clear();
    const loginRequiredError = page.locator('#login-required-error');
    await expect(loginRequiredError).toBeVisible();
    await expect(loginRequiredError).toContainText('Login is required');

    await loginInput.fill('ced');
    await expect(loginRequiredError).not.toBeVisible();

    await passwordInput.fill('p');
    await passwordInput.clear();
    const passwordRequiredError = page.locator('#password-required-error');
    await expect(passwordRequiredError).toBeVisible();
    await expect(passwordRequiredError).toContainText('Password is required');

    await passwordInput.fill('pa');
    await expect(passwordRequiredError).not.toBeVisible();

    await confirmInput.fill('p');
    await confirmInput.clear();
    const confirmPasswordRequiredError = page.locator('#confirm-password-required-error');
    await expect(confirmPasswordRequiredError).toBeVisible();
    await expect(confirmPasswordRequiredError).toContainText('Password confirmation is required');

    await confirmInput.fill('p');
    const passwordMatchingError = page.locator('#password-matching-error');
    await expect(passwordMatchingError).toBeVisible();
    await expect(passwordMatchingError).toContainText('Your password does not match');

    await confirmInput.fill('pa');
    await expect(passwordMatchingError).not.toBeVisible();

    await birthYearInput.fill('1');
    await birthYearInput.clear();
    const birthYearRequiredError = page.locator('#birth-year-required-error');
    await expect(birthYearRequiredError).toBeVisible();
    await expect(birthYearRequiredError).toContainText('Birth year is required');

    await birthYearInput.fill(`${new Date().getFullYear() + 1}`);
    const birthYearInvalidError = page.locator('#birth-year-invalid-error');
    await expect(birthYearInvalidError).toBeVisible();
    await expect(birthYearInvalidError).toContainText('This is not a valid year');

    await birthYearInput.clear();
    await birthYearInput.fill('1986');
    await expect(birthYearInvalidError).not.toBeVisible();

    const response = page.waitForResponse('**/api/users');
    await submitButton.click();
    await response;

    await expect(page).toHaveURL('/');
  });
});
