import { Routes } from '@angular/router';
import { Bet } from './bet/bet';
import { Home } from './home/home';
import { Live } from './live/live';
import { loggedInGuard } from './logged-in-guard';
import { Login } from './login/login';
import { PendingRaces } from './races/pending-races/pending-races';
import { Register } from './register/register';
import { FinishedRaces } from './races/finished-races/finished-races';
import { Races } from './races/races';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'races',
    canActivate: [loggedInGuard],
    children: [
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
    ]
  },
  { path: 'login', component: Login },
  { path: 'register', component: Register }
];
