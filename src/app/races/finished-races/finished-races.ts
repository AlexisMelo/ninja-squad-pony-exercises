import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RaceService } from '../../race-service';
import { Race } from '../../race/race';

@Component({
  imports: [Race],
  templateUrl: './finished-races.html',
  styleUrl: './finished-races.css'
})
export class FinishedRaces {
  protected readonly races = toSignal(inject(RaceService).list('FINISHED'));
}
