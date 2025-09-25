import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Races } from './races/races';
import { Login } from './login/login';
import { Register } from './register/register';
import { Bet } from './bet/bet';
import { Live } from './live/live';
import { loggedInGuard } from './logged-in-guard';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'races',
    canActivate: [loggedInGuard],
    children: [
      { path: '', component: Races },
      { path: ':raceId', component: Bet },
      { path: ':raceId/live', component: Live }
    ]
  },
  { path: 'login', component: Login },
  { path: 'register', component: Register }
];
