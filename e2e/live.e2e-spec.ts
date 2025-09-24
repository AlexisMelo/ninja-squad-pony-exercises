import { expect, test, WebSocketRoute } from '@playwright/test';
import * as WebstompClient from 'webstomp-client';

test.describe('Live page', () => {
  let mockWebSocket: WebSocketRoute | undefined;
  let subscriptionId: string | undefined;

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
    status: 'PENDING',
    betPonyId: 2
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

    await page.routeWebSocket('**/ws', ws => {
      mockWebSocket = ws;
      ws.onMessage(message => {
        const unmarshalled = WebstompClient.Frame.unmarshallSingle(message as string);
        if (unmarshalled.command === 'CONNECT') {
          // we return a fake connection
          ws.send(WebstompClient.Frame.marshall('CONNECTED'));
        } else if (unmarshalled.command === 'SUBSCRIBE' && unmarshalled.headers.destination === '/race/12') {
          // store the subscription ID
          subscriptionId = unmarshalled.headers.id;
        }
      });
    });

    await page.goto('/races');
    await page.evaluate(user => localStorage.setItem('rememberMe', JSON.stringify(user)), user);
  });

  test('should display a pending race', async ({ page }) => {
    const raceResponse = page.waitForResponse('**/api/races/12');
    await page.goto('/races/12/live');
    await raceResponse;

    await expect(page.locator('h1')).toContainText('Paris');

    const ponies = page.locator('figure');
    await expect(ponies).toHaveCount(5);
    await expect(page.locator('.selected')).toHaveCount(1);
  });

  test('should display a running race', async ({ page }) => {
    const raceResponse = page.waitForResponse('**/api/races/12');
    await page.goto('/races/12/live');
    await raceResponse;

    await expect(page.locator('h1')).toContainText('Paris');
    await page.waitForTimeout(1000);

    const headers = {
      destination: '/race/12',
      subscription: subscriptionId
    };
    // we send a fake message
    mockWebSocket?.send(
      WebstompClient.Frame.marshall(
        'MESSAGE',
        headers,
        JSON.stringify({
          ponies: [
            { id: 1, name: 'Gentle Pie', color: 'YELLOW', position: 30 },
            { id: 2, name: 'Big Soda', color: 'ORANGE', position: 80 },
            { id: 3, name: 'Gentle Bottle', color: 'PURPLE', position: 70 },
            { id: 4, name: 'Superb Whiskey', color: 'GREEN', position: 60 },
            { id: 5, name: 'Fast Rainbow', color: 'BLUE', position: 30 }
          ],
          status: 'RUNNING'
        })
      )
    );

    // every second the position of the ponies should be updated via WebSocket
    const ponies = page.locator('.pony-wrapper');
    await expect(ponies).toHaveCount(5);

    // it should have a left margin set to position - 5%
    const firstPonyLeftMargin = await ponies.first().evaluate(pony => pony.style.marginLeft);
    await expect(firstPonyLeftMargin).toBe('25%');
  });

  test('should display a finished race', async ({ page }) => {
    const raceResponse = page.waitForResponse('**/api/races/12');
    await page.goto('/races/12/live');
    await raceResponse;

    await expect(page.locator('h1')).toContainText('Paris');
    await page.waitForTimeout(1000);

    const headers = {
      destination: '/race/12',
      subscription: subscriptionId
    };
    // we send a fake message
    mockWebSocket?.send(
      WebstompClient.Frame.marshall(
        'MESSAGE',
        headers,
        JSON.stringify({
          ponies: [
            { id: 1, name: 'Gentle Pie', color: 'YELLOW', position: 30 },
            { id: 2, name: 'Big Soda', color: 'ORANGE', position: 100 },
            { id: 3, name: 'Gentle Bottle', color: 'PURPLE', position: 70 },
            { id: 4, name: 'Superb Whiskey', color: 'GREEN', position: 60 },
            { id: 5, name: 'Fast Rainbow', color: 'BLUE', position: 30 }
          ],
          status: 'FINISHED'
        })
      )
    );

    // victorious pony should be displayed
    await expect(page.locator('h1')).toContainText('Paris');
    await expect(page.locator('img')).toHaveCount(1);
    await expect(page.locator('.selected')).toHaveCount(1);
    await expect(page.locator('.alert.alert-success')).toHaveText('You won your bet!');
  });
});
