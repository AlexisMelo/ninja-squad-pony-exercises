import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Races } from './races/races';
import { Login } from './login/login';
import { Register } from './register/register';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'races', component: Races },
  { path: 'login', component: Login },
  { path: 'register', component: Register }
];
