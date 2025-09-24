import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, takeWhile } from 'rxjs';
import { environment } from '../environments/environment';
import { LiveRaceModel, RaceModel } from './models/race.model';
import { WsService } from './ws-service';

@Injectable({ providedIn: 'root' })
export class RaceService {
  /**
   * Gestion HTTP
   */
  private readonly http = inject(HttpClient);

  /**
   * Websockets
   */
  private wsService = inject(WsService);

  /**
   * Obtenir la liste de toutes les courses
   * @returns
   */
  list(): Observable<Array<RaceModel>> {
    const params = { status: 'PENDING' };
    return this.http.get<Array<RaceModel>>('https://ponyracer.ninja-squad.com/api/races', { params });
  }

  /**
   * Parier sur un poney dans une course
   * @param raceId
   * @param ponyId
   * @returns
   */
  bet(raceId: number, ponyId: number): Observable<void> {
    return this.http.post<void>(`${environment.baseUrl}/api/races/${raceId}/bets`, { ponyId });
  }

  /**
   * Obtient une course par son id
   * @param raceId
   * @returns
   */
  get(raceId: number): Observable<RaceModel> {
    return this.http.get<RaceModel>(`${environment.baseUrl}/api/races/${raceId}`);
  }

  /**
   * Annuler un pari
   * @param raceId
   * @returns
   */
  cancelBet(raceId: number): Observable<void> {
    return this.http.delete<void>(`${environment.baseUrl}/api/races/${raceId}/bets`);
  }

  /**
   * Live d'une course
   * @param raceId
   */

  live(raceId: number): Observable<LiveRaceModel> {
    return this.wsService.connect<LiveRaceModel>('/race/' + raceId).pipe(takeWhile(liveRace => liveRace.status !== 'FINISHED', true));
  }

  /**
   * Booste un poney
   * @param raceId
   * @param ponyId
   * @returns
   */
  boost(raceId: number, ponyId: number) {
    return this.http.post<void>(`${environment.baseUrl}/api/races/${raceId}/boosts`, { ponyId });
  }
}
