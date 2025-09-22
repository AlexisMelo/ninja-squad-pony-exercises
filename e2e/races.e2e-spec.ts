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
    await expect(page.locator('h2')).toHaveCount(2);
    const paragraphs = page.locator('p');
    await expect(paragraphs).toHaveCount(2);
    await expect(paragraphs.first()).toContainText('ago');
  });

  test('should display ponies', async ({ page }) => {
    await expect(page.locator('figure')).toHaveCount(10);
    await expect(page.locator('img')).toHaveCount(10);
    await expect(page.locator('figcaption')).toHaveCount(10);
  });
});
