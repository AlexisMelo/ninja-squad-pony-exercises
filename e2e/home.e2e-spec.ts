import { expect, Page, test } from '@playwright/test';

test.describe('Home page', () => {
  async function login(page: Page) {
    await page.evaluate(() =>
      localStorage.setItem(
        'rememberMe',
        JSON.stringify({
          id: 1,
          login: 'cedric',
          money: 1000,
          registrationInstant: '2015-12-01T11:00:00Z',
          token: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.5cAW816GUAg3OWKWlsYyXI4w3fDrS5BpnmbyBjVM7lo'
        })
      )
    );
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display a title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Ponyracer');
    await expect(page.locator('small')).toContainText('Always a pleasure to bet on ponies');
    await expect(page.locator('.btn-primary').filter({ hasText: 'Login' })).toHaveAttribute('href', '/login');
    await expect(page.locator('.btn-primary').filter({ hasText: 'Register' })).toHaveAttribute('href', '/register');
  });

  test('should display a navbar', async ({ page }) => {
    await expect(page.locator('.navbar-brand').filter({ hasText: 'PonyRacer' })).toHaveAttribute('href', '/');
    await expect(page.locator('.nav-link')).toHaveCount(0);
  });

  test('should display a navbar collapsed on small screen', async ({ page }) => {
    await login(page);
    await page.goto('/');

    await page.setViewportSize({ width: 375, height: 667 });
    const navbarBrand = page.locator('.navbar-brand');
    await expect(navbarBrand).toBeVisible();

    await expect(page.locator('.navbar-brand')).toContainText('PonyRacer');
    const navbarLink = page.locator('.nav-link').filter({ hasText: 'Races' });
    await expect(navbarLink).not.toBeVisible();

    // toggle the navbar
    const navbarToggler = page.locator('.navbar-toggler');
    await navbarToggler.click();
    await expect(navbarLink).toBeVisible();

    // toggle the navbar again
    await navbarToggler.click();
    await expect(navbarLink).not.toBeVisible();
  });

  test('should display the logged in user in navbar and logout', async ({ page }) => {
    await login(page);
    await page.goto('/');

    await expect(page).toHaveURL('/');
    const navbarLink = page.locator('.nav-link');
    await expect(navbarLink.filter({ hasText: 'Races' })).toHaveAttribute('href', '/races');

    // user stored should be displayed
    const currentUser = page.locator('#current-user');
    await expect(currentUser).toContainText('cedric');
    await expect(currentUser).toContainText('1,000');

    await expect(page.locator('.btn-primary').filter({ hasText: 'Races' })).toHaveAttribute('href', '/races');

    // logout
    await page.locator('span.fa.fa-power-off').click();

    // should be redirected to home page
    await expect(page).toHaveURL('/');
    await expect(page.locator('.nav-link')).toHaveCount(0);

    // user is not displayed in navbar
    await expect(currentUser).not.toBeAttached();

    // and localStorage should be empty
    const rememberMe = await page.evaluate(() => window.localStorage.getItem('rememberMe'));
    expect(rememberMe).toBeNull();

    // and home page offers the login link
    await expect(page.locator('.btn-primary').filter({ hasText: 'Login' })).toHaveAttribute('href', '/login');
  });
});
