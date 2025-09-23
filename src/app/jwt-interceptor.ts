import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserService } from './user-service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const currentUser = inject(UserService).currentUser();

  if (!currentUser || !currentUser.token) return next(req);

  const headers = { Authorization: `Bearer ${currentUser.token}` };

  const clonedReq = req.clone({ setHeaders: headers });

  return next(clonedReq);
};
