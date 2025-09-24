import { inject, Injectable, Type } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.development';
import * as WebstompClient from 'webstomp-client';
import { WEBSOCKET, WEBSTOMP } from './app.tokens';

@Injectable({
  providedIn: 'root'
})
export class WsService {
  private readonly WebSocket: Type<WebSocket> = inject(WEBSOCKET);

  private readonly Webstomp: typeof WebstompClient = inject(WEBSTOMP);

  connect<T>(channel: string): Observable<T> {
    return new Observable(observer => {
      const connection: WebSocket = new this.WebSocket(`${environment.wsBaseUrl}/ws`);
      const stompClient: WebstompClient.Client = this.Webstomp.over(connection);
      let subscription: WebstompClient.Subscription;
      stompClient.connect(
        { login: '', passcode: '' },
        () => {
          subscription = stompClient.subscribe(channel, message => {
            const bodyAsJson = JSON.parse(message.body) as T;
            observer.next(bodyAsJson);
          });
        },
        error => {
          // propagate the error
          observer.error(error);
        }
      );
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
        connection.close();
      };
    });
  }
}
