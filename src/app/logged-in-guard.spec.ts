import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { loggedInGuard } from './logged-in-guard';
import { UserService } from './user-service';
import { UserModel } from './models/user.model';

describe('loggedInGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => TestBed.runInInjectionContext(() => loggedInGuard(...guardParameters));
  let currentUser: WritableSignal<UserModel | undefined>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    currentUser = signal(undefined);
    userService = jasmine.createSpyObj<UserService>('UserService', [], { currentUser });
    TestBed.configureTestingModule({
      providers: [{ provide: UserService, useValue: userService }]
    });
  });

  it('should allow activation if user is logged in', () => {
    currentUser.set({} as UserModel);

    expect(executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)).toBe(true);
  });

  it('should forbid activation if user is not logged in, and navigate to home', () => {
    const router = TestBed.inject(Router);
    const urlTree: UrlTree = router.parseUrl('/');

    expect(executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)).toEqual(urlTree);
  });
});
