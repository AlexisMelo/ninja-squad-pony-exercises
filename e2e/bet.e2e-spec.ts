import { expect, test } from '@playwright/test';

test.describe('Bet page', () => {
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

  test('should bet on ponies', async ({ page }) => {
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

    await page.route('**/api/races/12', async route => {
      await route.fulfill({
        status: 200,
        json: race
      });
    });

    await page.route('**/api/races/12/bets', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          json: {}
        });
      }
    });

    await page.goto('/races');
    await page.evaluate(user => localStorage.setItem('rememberMe', JSON.stringify(user)), user);

    const racesResponsePromise = page.waitForResponse('**/api/races?status=PENDING');
    await page.goto('/races');
    await racesResponsePromise;

    // Go to bet page for the first race
    const raceResponsePromise = page.waitForResponse('**/api/races/12');
    await page.locator('.btn-primary').first().click();
    const raceResponse = await raceResponsePromise;
    const headers = raceResponse.request().headers();
    expect(headers.authorization).toBe(`Bearer ${user.token}`);

    await expect(page).toHaveURL('/races/12');

    // Race detail should be displayed
    await expect(page.locator('h1')).toContainText('Paris');
    await expect(page.locator('p').first()).toContainText('ago');
    await expect(page.locator('img')).toHaveCount(5);

    // No pony is selected
    await expect(page.locator('.selected')).toHaveCount(0);

    // Bet on first pony
    await page.route('**/api/races/12', async route => {
      await route.fulfill({
        status: 200,
        json: { ...race, betPonyId: 1 }
      });
    });

    const betResponsePromise = page.waitForResponse('**/api/races/12/bets');
    await page.locator('img').first().click();
    const betResponse = await betResponsePromise;
    expect(betResponse.request().method()).toBe('POST');

    // Check that the request body contains the correct ponyId
    const betPostData = await betResponse.request().postData()!;
    const body = JSON.parse(betPostData);
    expect(body).toHaveProperty('ponyId', 1);

    await page.waitForResponse('**/api/races/12');

    // A pony is now selected
    await expect(page.locator('.selected')).toHaveCount(1);

    // Bet on the second one
    await page.route('**/api/races/12', async route => {
      await route.fulfill({
        status: 200,
        json: { ...race, betPonyId: 2 }
      });
    });

    const secondBetResponsePromise = page.waitForResponse('**/api/races/12/bets');
    await page.locator('img').nth(1).click();
    const secondBetResponse = await secondBetResponsePromise;
    expect(secondBetResponse.request().method()).toBe('POST');

    // Check that the request body contains the correct ponyId
    const secondBetPostData = await secondBetResponse.request().postData()!;
    const secondBody = JSON.parse(secondBetPostData);
    expect(secondBody).toHaveProperty('ponyId', 2);

    await page.waitForResponse('**/api/races/12');

    // A pony is still selected
    await expect(page.locator('.selected')).toHaveCount(1);

    // Cancel fails
    await page.route('**/api/races/12/bets', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 404
        });
      }
    });

    // Cancel bet on second pony
    await page.locator('img').nth(1).click();

    // Alert should be displayed
    await expect(page.locator('.alert')).toContainText('The race is already started or finished');

    // Close alert
    await page.locator('.alert button').click();
    await expect(page.locator('.alert')).not.toBeVisible();

    // Bet fails
    await page.route('**/api/races/12/bets', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 404
        });
      }
    });

    // Bet on first pony
    await page.locator('img').first().click();

    // Alert should be displayed
    await expect(page.locator('.alert')).toContainText('The race is already started or finished');

    // Close alert
    await page.locator('.alert button').click();
    await expect(page.locator('.alert')).not.toBeVisible();

    // Set up for cancel bet
    await page.route('**/api/races/12/bets', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          json: {}
        });
      }
    });

    await page.route('**/api/races/12', async route => {
      await route.fulfill({
        status: 200,
        json: race
      });
    });

    // Cancel bet
    const cancelBetResponsePromise = page.waitForResponse('**/api/races/12/bets');
    await page.locator('img').nth(1).click();
    const cancelBetResponse = await cancelBetResponsePromise;
    expect(cancelBetResponse.request().method()).toBe('DELETE');
    await page.waitForResponse('**/api/races/12');

    // No pony is selected anymore
    await expect(page.locator('.selected')).toHaveCount(0);
  });
});
