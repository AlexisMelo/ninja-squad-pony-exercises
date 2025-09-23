import { signal, WritableSignal } from '@angular/core';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UserModel } from '../models/user.model';
import { UserService } from '../user-service';
import { Home } from './home';

describe('Home', () => {
  let currentUser: WritableSignal<UserModel | undefined>;

  beforeEach(() => {
    currentUser = signal(undefined);
    const userService = jasmine.createSpyObj<UserService>('UserService', [], { currentUser });
    TestBed.configureTestingModule({
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        provideRouter([]),
        { provide: UserService, useValue: userService }
      ]
    });
  });

  it('should display the title and quote', () => {
    const fixture = TestBed.createComponent(Home);
    const element = fixture.nativeElement as HTMLElement;

    const title = element.querySelector('h1')!;
    expect(title).withContext('You should have an `h1` element to display the title').not.toBeNull();
    expect(title.textContent).toContain('Ponyracer');
    expect(title.textContent)
      .withContext('You should have the `small` element inside the `h1` element')
      .toContain('Always a pleasure to bet on ponies');

    const subtitle = element.querySelector('small')!;
    expect(subtitle).withContext('You should have a `small` element to display the subtitle').not.toBeNull();
    expect(subtitle.textContent).toContain('Always a pleasure to bet on ponies');
  });

  it('should display a link to go the login and another to register', async () => {
    const fixture = TestBed.createComponent(Home);
    const element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();

    const button = element.querySelector('a[href="/login"]')!;
    expect(button)
      .withContext('You should have an `a` element to display the link to the login. Maybe you forgot to use `routerLink`?')
      .not.toBeNull();
    expect(button.textContent).withContext('The link should have a text').toContain('Login');

    const buttonRegister = element.querySelector('a[href="/register"]')!;
    expect(buttonRegister)
      .withContext('You should have an `a` element to display the link to the register page. Maybe you forgot to use `routerLink`?')
      .not.toBeNull();
    expect(buttonRegister.textContent).withContext('The link should have a text').toContain('Register');
  });

  it('should display only a link to go the races page if logged in', async () => {
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();

    currentUser.set({ login: 'cedric' } as UserModel);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const button = element.querySelector('a[href="/races"]')!;
    expect(button).withContext('The link should lead to the races if the user is logged').not.toBeNull();
    expect(button.textContent).withContext('The first link should lead to the races if the user is logged').toContain('Races');
  });
});
