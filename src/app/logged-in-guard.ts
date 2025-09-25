import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from './user-service';

export const loggedInGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);
  const user = inject(UserService).currentUser();

  return user !== undefined || router.parseUrl('/');
};
