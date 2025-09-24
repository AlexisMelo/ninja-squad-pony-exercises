import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RaceModel } from './models/race.model';
import { environment } from '../environments/environment';

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
}
