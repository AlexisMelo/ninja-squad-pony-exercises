import { Routes } from '@angular/router';
import { Home } from './home/home';
import { loggedInGuard } from './logged-in-guard';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'races',
    canActivate: [loggedInGuard],
    loadChildren: () => import('./races/races.routes').then(m => m.racesRoutes)
  },
  { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./register/register').then(m => m.Register) }
];
