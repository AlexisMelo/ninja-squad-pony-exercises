import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RaceService } from '../../race-service';
import { Race } from '../../race/race';
import { RouterLink } from '@angular/router';

@Component({
  imports: [Race, RouterLink],
  templateUrl: './pending-races.html',
  styleUrl: './pending-races.css'
})
export class PendingRaces {
  protected readonly races = toSignal(inject(RaceService).list('PENDING'));
}
