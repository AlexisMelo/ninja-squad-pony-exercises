import { TestBed } from '@angular/core/testing';
import * as WebstompClient from 'webstomp-client';
import { WEBSOCKET, WEBSTOMP } from './app.tokens';
import { WsService } from './ws-service';

class MockWebSocket {
  close(): void {}
}

describe('WsService', () => {
  let wsService: WsService;
  const mockClient = jasmine.createSpyObj<WebstompClient.Client>('WebstompClient.Client', ['connect', 'subscribe', 'unsubscribe']);
  const mockWebstomp = jasmine.createSpyObj<typeof WebstompClient>('WebstompClient', ['over']);
  const mockSubscription = jasmine.createSpyObj<WebstompClient.Subscription>('WebstompClient.Subscription', ['unsubscribe']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: WEBSOCKET, useValue: MockWebSocket },
        { provide: WEBSTOMP, useValue: mockWebstomp }
      ]
    });
    // given a fake WebSocket connection
    mockWebstomp.over.and.returnValue(mockClient);
  });

  beforeEach(() => (wsService = TestBed.inject(WsService)));

  it('should connect to a websocket channel', () => {
    mockClient.connect.and.callFake((_headers, connectCallback) => (connectCallback as () => void)());
    mockClient.subscribe.and.callFake((channel: string, callback: (body: unknown) => void) => {
      expect(channel).toBe('/channel/2');
      callback({ body: '{"id": "1"}' });
      return mockSubscription;
    });

    // when connecting to a channel
    const messages = wsService.connect<{ id: string }>('/channel/2');

    messages.subscribe(message => {
      expect(message.id).toBe('1');
    });

    // then we should have a WebSocket connection with Stomp protocol
    expect(mockWebstomp.over).toHaveBeenCalled();
  });

  it('should throw an error if the connection fails', () => {
    // with a failed connection
    mockClient.connect.and.callFake((_headers, _connectCallback, errorCallback) => {
      errorCallback!(new Error('Oops!') as unknown as WebstompClient.Frame);
    });
    // when connecting to a channel
    const messages = wsService.connect('/channel/2');

    // then we should have an error in the observable
    messages.subscribe({
      next: () => fail(),
      error: (error: Error) => {
        expect(error.message).toBe('Oops!');
      }
    });
  });

  it('should unsubscribe from the websocket connection on unsubscription', () => {
    // returning a subscription
    mockClient.connect.and.callFake((_headers, connectCallback) => (connectCallback as () => void)());
    mockClient.subscribe.and.returnValue(mockSubscription);

    // when connecting to a channel
    const messages = wsService.connect('/channel/2');

    // and unsubscribing
    const subscription = messages.subscribe();
    subscription.unsubscribe();

    // then we should have unsubscribe from the Webstomp connection
    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
  });
});
