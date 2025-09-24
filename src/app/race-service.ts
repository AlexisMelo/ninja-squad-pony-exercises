import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { interval, map, Observable, take } from 'rxjs';
import { environment } from '../environments/environment';
import { LiveRaceModel, RaceModel } from './models/race.model';

@Injectable({ providedIn: 'root' })
export class RaceService {
  /**
   * Gestion HTTP
   */
  private readonly http = inject(HttpClient);

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  live(raceId: number): Observable<LiveRaceModel> {
    return interval(1000).pipe(
      take(101),
      map(position => {
        return {
          ponies: [
            {
              id: 1,
              name: 'Superb Runner',
              color: 'BLUE',
              position
            },
            {
              id: 2,
              name: 'Awesome Fridge',
              color: 'GREEN',
              position
            },
            {
              id: 3,
              name: 'Great Bottle',
              color: 'ORANGE',
              position
            },
            {
              id: 4,
              name: 'Little Flower',
              color: 'YELLOW',
              position
            },
            {
              id: 5,
              name: 'Nice Rock',
              color: 'PURPLE',
              position
            }
          ],
          status: 'RUNNING'
        };
      })
    );
  }
}
