import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RaceModel } from './models/race.model';

@Injectable({ providedIn: 'root' })
export class RaceService {
  private readonly http = inject(HttpClient);

  list(): Observable<Array<RaceModel>> {
    const params = { status: 'PENDING' };
    return this.http.get<Array<RaceModel>>('https://ponyracer.ninja-squad.com/api/races', { params });
  }
}
