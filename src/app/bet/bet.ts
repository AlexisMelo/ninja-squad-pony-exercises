import { Component, inject, Signal, signal } from '@angular/core';
import { RaceModel } from '../models/race.model';
import { ActivatedRoute } from '@angular/router';
import { startWith, Subject, switchMap } from 'rxjs';
import { RaceService } from '../race-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { FromNowPipe } from '../from-now-pipe';
import { Pony } from '../pony/pony';
import { PonyModel } from '../models/pony.model';

@Component({
  selector: 'pr-bet',
  imports: [FromNowPipe, Pony],
  templateUrl: './bet.html',
  styleUrl: './bet.css'
})
export class Bet {
  /**
   * Course
   */
  protected readonly raceModel: Signal<RaceModel | undefined>;

  /**
   * Est-ce que le pari a échoué ?
   */
  protected readonly betFailed = signal(false);

  /**
   * Route active
   */
  private activatedRoute = inject(ActivatedRoute);

  /**
   * Utilisé pour rafraichir la course
   */
  private refreshSubject = new Subject<void>();

  /**
   * Gestion des courses
   */
  private raceService = inject(RaceService);

  /**
   * Constructeur
   */
  constructor() {
    const raceId = parseInt(this.activatedRoute.snapshot.paramMap.get('raceId')!);
    this.raceModel = toSignal(
      this.refreshSubject.pipe(
        startWith(undefined),
        switchMap(() => this.raceService.get(raceId))
      )
    );
  }

  /**
   * Parier sur un poney
   * @param pony
   * @returns
   */
  protected betOnPony(pony: PonyModel) {
    const raceModel = this.raceModel();
    if (!raceModel) return;

    const request = this.isPoneySelected(pony) ? this.raceService.cancelBet(raceModel.id) : this.raceService.bet(raceModel.id, pony.id);

    request.subscribe({ next: () => this.refreshSubject.next(), error: () => this.betFailed.set(true) });
  }

  /**
   * Est-ce que le poney est sélectionné
   * @param pony
   * @returns
   */
  isPoneySelected(pony: PonyModel) {
    return this.raceModel()?.betPonyId === pony.id;
  }

  /**
   * Remet à 0 le bet
   */
  protected resetAlert() {
    this.betFailed.set(false);
  }
}
