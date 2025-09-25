import { Routes } from '@angular/router';
import { Bet } from '../bet/bet';
import { Live } from '../live/live';
import { FinishedRaces } from './finished-races/finished-races';
import { PendingRaces } from './pending-races/pending-races';
import { Races } from './races';

export const racesRoutes: Routes = [
  {
    path: '',
    component: Races,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'pending' },
      { path: 'pending', component: PendingRaces },
      { path: 'finished', component: FinishedRaces }
    ]
  },

  { path: ':raceId', component: Bet },
  { path: ':raceId/live', component: Live }
];
