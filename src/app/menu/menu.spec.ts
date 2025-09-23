import { signal, WritableSignal } from '@angular/core';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterLink } from '@angular/router';
import { By } from '@angular/platform-browser';
import { UserService } from '../user-service';
import { UserModel } from '../models/user.model';
import { Menu } from './menu';

describe('Menu', () => {
  let currentUser: WritableSignal<UserModel | undefined>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    currentUser = signal(undefined);
    userService = jasmine.createSpyObj<UserService>('UserService', ['logout'], { currentUser });
    TestBed.configureTestingModule({
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        provideRouter([]),
        { provide: UserService, useValue: userService }
      ]
    });
  });

  it('should toggle the class on click', async () => {
    const fixture = TestBed.createComponent(Menu);
    const element = fixture.nativeElement as HTMLElement;

    await fixture.whenStable();

    const navbarCollapsed = element.querySelector('#navbar')!;
    expect(navbarCollapsed).withContext('No element with the id `#navbar`').not.toBeNull();
    expect(navbarCollapsed.classList)
      .withContext('The element with the id `#navbar` should have the class `collapse`')
      .toContain('collapse');

    const button = element.querySelector('button')!;
    expect(button).withContext('No `button` element to collapse the menu').not.toBeNull();
    button.click();

    await fixture.whenStable();

    const navbar = element.querySelector('#navbar')!;
    expect(navbar.classList)
      .withContext('The element with the id `#navbar` should have not the class `collapse` after a click')
      .not.toContain('collapse');

    button.click();
    await fixture.whenStable();

    expect(navbar.classList)
      .withContext('The element with the id `#navbar` should have the class `collapse` after a second click')
      .toContain('collapse');
  });

  it('should use routerLink to navigate', async () => {
    const fixture = TestBed.createComponent(Menu);

    await fixture.whenStable();

    const links = fixture.debugElement.queryAll(By.directive(RouterLink));
    expect(links.length).withContext('You should have only one routerLink to the home when the user is not logged').toBe(1);

    currentUser.set({ login: 'cedric', money: 2000 } as UserModel);
    await fixture.whenStable();

    const linksAfterLogin = fixture.debugElement.queryAll(By.directive(RouterLink));
    expect(linksAfterLogin.length).withContext('You should have two routerLink: one to the races, one to the home').toBe(2);
  });

  it('should display the user if logged in', async () => {
    const fixture = TestBed.createComponent(Menu);
    await fixture.whenStable();

    currentUser.set({ login: 'cedric', money: 2000 } as UserModel);

    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const info = element.querySelector('#current-user')!;
    expect(info).withContext('You should have a `span` element with the ID `current-user` to display the user info').not.toBeNull();
    expect(info.textContent).withContext('You should display the name of the user in a `span` element').toContain('cedric');
    expect(info.textContent).withContext('You should display the score of the user in a `span` element').toContain('2,000');
  });

  it('should display a logout button', async () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
    const fixture = TestBed.createComponent(Menu);
    await fixture.whenStable();

    currentUser.set({ login: 'cedric', money: 2000 } as UserModel);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const logout = element.querySelector<HTMLSpanElement>('span.fa-power-off')!;
    expect(logout).withContext('You should have a span element with a class `fa-power-off` to log out').not.toBeNull();
    logout.click();

    await fixture.whenStable();
    expect(userService.logout).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });
});
