import { expect, test } from '@playwright/test';

test.describe('Live page', () => {
  const race = {
    id: 12,
    name: 'Paris',
    ponies: [
      { id: 1, name: 'Gentle Pie', color: 'YELLOW' },
      { id: 2, name: 'Big Soda', color: 'ORANGE' },
      { id: 3, name: 'Gentle Bottle', color: 'PURPLE' },
      { id: 4, name: 'Superb Whiskey', color: 'GREEN' },
      { id: 5, name: 'Fast Rainbow', color: 'BLUE' }
    ],
    startInstant: '2020-02-18T08:02:00Z',
    status: 'PENDING'
  };

  const user = {
    id: 1,
    login: 'cedric',
    money: 1000,
    registrationInstant: '2015-12-01T11:00:00Z',
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.5cAW816GUAg3OWKWlsYyXI4w3fDrS5BpnmbyBjVM7lo'
  };

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/races/12', async route => {
      await route.fulfill({
        status: 200,
        json: race
      });
    });

    await page.goto('/races');
    await page.evaluate(user => localStorage.setItem('rememberMe', JSON.stringify(user)), user);
  });

  test('should display a running race', async ({ page }) => {
    const raceResponse = page.waitForResponse('**/api/races/12');
    await page.goto('/races/12/live');
    await raceResponse;

    await expect(page.locator('h1')).toContainText('Paris');

    // every second the position of the ponies should be updated
    const ponies = page.locator('.pony-wrapper');
    await expect(ponies).toHaveCount(5);
    // it should have a left margin that grows
    const firstPonyLeftMargin = await ponies.first().evaluate(pony => pony.style.marginLeft);
    await expect(firstPonyLeftMargin).toBe('-5%');

    await page.waitForTimeout(2000);
    const firstPonyLeftMarginAfterTwoSeconds = await ponies.first().evaluate(pony => pony.style.marginLeft);
    await expect(firstPonyLeftMarginAfterTwoSeconds).toBe('-3%');
  });
});
