import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Race } from '../race/race';
import { RaceService } from '../race-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'pr-races',
  imports: [Race, RouterLink],
  templateUrl: './races.html',
  styleUrl: './races.css'
})
export class Races {
  protected readonly races = toSignal(inject(RaceService).list());
}
