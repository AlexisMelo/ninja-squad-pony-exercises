import { expect, test } from '@playwright/test';

test.describe('Races page', () => {
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
    startInstant: '2020-02-18T08:02:00Z'
  };

  const user = {
    id: 1,
    login: 'cedric',
    money: 1000,
    registrationInstant: '2015-12-01T11:00:00Z',
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.5cAW816GUAg3OWKWlsYyXI4w3fDrS5BpnmbyBjVM7lo'
  };

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/races?status=PENDING', async route => {
      await route.fulfill({
        status: 200,
        json: [
          race,
          {
            id: 13,
            name: 'Tokyo',
            ponies: [
              { id: 6, name: 'Fast Rainbow', color: 'BLUE' },
              { id: 7, name: 'Gentle Castle', color: 'GREEN' },
              { id: 8, name: 'Awesome Rock', color: 'PURPLE' },
              { id: 9, name: 'Little Rainbow', color: 'YELLOW' },
              { id: 10, name: 'Great Soda', color: 'ORANGE' }
            ],
            startInstant: '2020-02-18T08:03:00Z'
          }
        ]
      });
    });
    await page.goto('/races');
  });

  test('should display a race list', async ({ page }) => {
    // not logged, so redirected
    await expect(page).toHaveURL('/');

    // store the user in localStorage
    await page.evaluate(user => localStorage.setItem('rememberMe', JSON.stringify(user)), user);
    const racePromise = page.waitForResponse('**/api/races?status=PENDING');
    await page.goto('/races');
    await racePromise;

    // now we can see the list
    await expect(page.locator('h2')).toHaveCount(2);
    const paragraphs = page.locator('p');
    await expect(paragraphs).toHaveCount(2);
    await expect(paragraphs.first()).toContainText('ago');
    await expect(page.locator('figure')).toHaveCount(10);
    await expect(page.locator('img')).toHaveCount(10);
    await expect(page.locator('figcaption')).toHaveCount(10);
  });
});
