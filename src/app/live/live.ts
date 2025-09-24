import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RaceModel } from '../models/race.model';
import { RaceService } from '../race-service';
import { PonyWithPositionModel } from '../models/pony.model';
import { map, startWith, switchMap } from 'rxjs';
import { Pony } from '../pony/pony';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface RaceModelWithPositions extends RaceModel {
  poniesWithPosition: Array<PonyWithPositionModel>;
}

@Component({
  selector: 'pr-live',
  imports: [Pony],
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
   * Constructeur
   */
  constructor() {
    const raceId = parseInt(this.activatedRoute.snapshot.paramMap.get('raceId')!);
    this.raceService
      .get(raceId)
      .pipe(
        switchMap(race =>
          this.raceService.live(raceId).pipe(
            map(live => ({ ...race, status: live.status, poniesWithPosition: live.ponies })),
            startWith({ ...race, poniesWithPosition: [] })
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe({
        next: race => this.raceModel.set(race)
      });
  }
}
