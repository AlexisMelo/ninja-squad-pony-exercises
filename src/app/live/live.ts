import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RaceModel } from '../models/race.model';
import { RaceService } from '../race-service';
import { PonyWithPositionModel } from '../models/pony.model';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { Pony } from '../pony/pony';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FromNowPipe } from '../from-now-pipe';

interface RaceModelWithPositions extends RaceModel {
  poniesWithPosition: Array<PonyWithPositionModel>;
  liveError?: boolean;
}

@Component({
  selector: 'pr-live',
  imports: [Pony, FromNowPipe],
  templateUrl: './live.html',
  styleUrl: './live.css'
})
export class Live {
  /**
   * Route active
   */
  private activatedRoute = inject(ActivatedRoute);

  /**
   * Course
   */
  protected readonly raceModel = signal<RaceModelWithPositions | undefined>(undefined);

  /**
   * Gestion des courses
   */
  private raceService = inject(RaceService);

  /**
   * Poney vainqueurs
   */
  protected readonly winners = computed(() => this.raceModel()?.poniesWithPosition.filter(p => p.position >= 100));

  /**
   * Est-ce que le pari est gagné ?
   */
  protected readonly betWon = computed(() => {
    const winners = this.winners();
    const raceModel = this.raceModel();
    if (!winners || !raceModel) return false;
    return winners.some(p => p.id === raceModel.betPonyId);
  });

  /**
   * Constructeur
   */
  constructor() {
    const raceId = parseInt(this.activatedRoute.snapshot.paramMap.get('raceId')!);
    this.raceService
      .get(raceId)
      .pipe(
        switchMap(race => {
          if (race.status === 'FINISHED') return of({ ...race, poniesWithPosition: [] });

          return this.raceService.live(raceId).pipe(
            map(live => ({ ...race, status: live.status, poniesWithPosition: live.ponies })),
            startWith({ ...race, poniesWithPosition: [] }),
            catchError(() => of({ ...race, poniesWithPosition: [], liveError: true }))
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe({
        next: race => this.raceModel.set(race)
      });
  }
}
