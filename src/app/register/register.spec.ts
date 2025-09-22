import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { UserService } from '../user-service';
import { UserModel } from '../models/user.model';
import { Register } from './register';

describe('Register', () => {
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    userService = jasmine.createSpyObj<UserService>('UserService', ['register']);
    TestBed.configureTestingModule({
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        provideRouter([{ path: 'register', component: Register }]),
        { provide: UserService, useValue: userService }
      ]
    });
  });

  it('should display a form to register', async () => {
    const harness = await RouterTestingHarness.create('/register');

    const element = harness.routeNativeElement!;
    const button = element.querySelector('button')!;
    expect(button.getAttribute('disabled')).withContext('Your submit button should be disabled if the form is invalid').not.toBeNull();
    const login = element.querySelector('input')!;
    expect(login).withContext('Your template should have an input for the login').not.toBeNull();
    login.value = 'Cédric';
    login.dispatchEvent(new Event('input'));
    login.value = '';
    login.dispatchEvent(new Event('input'));
    await harness.fixture.whenStable();

    const loginRequiredError = element.querySelector('#login-required-error')!;
    expect(loginRequiredError).withContext('You should have an error message if the login field is required and dirty').not.toBeNull();
    expect(loginRequiredError.textContent).withContext('The error message for the login field is incorrect').toContain('Login is required');

    login.value = 'Cé';
    login.dispatchEvent(new Event('input'));
    await harness.fixture.whenStable();

    const loginLengthError = element.querySelector('#login-length-error')!;
    expect(loginLengthError).withContext('You should have an error message if the login field is too short and dirty').not.toBeNull();
    expect(loginLengthError.textContent)
      .withContext('The error message for the login field is incorrect')
      .toContain('Your login should be at least 3 characters');

    login.value = 'Cédric';
    login.dispatchEvent(new Event('input'));

    const password = element.querySelector<HTMLInputElement>('input[type="password"]')!;
    expect(password).withContext('Your template should have a password input for the password').not.toBeNull();
    password.value = 'password';
    password.dispatchEvent(new Event('input'));
    password.value = '';
    password.dispatchEvent(new Event('input'));
    await harness.fixture.whenStable();

    const passwordError = element.querySelector('#password-required-error')!;
    expect(passwordError).withContext('You should have an error message if the password field is required and dirty').not.toBeNull();
    expect(passwordError.textContent)
      .withContext('The error message for the password field is incorrect')
      .toContain('Password is required');

    password.value = 'password';
    password.dispatchEvent(new Event('input'));

    const confirmPassword = element.querySelectorAll<HTMLInputElement>('input[type="password"]')[1];
    expect(confirmPassword).withContext('Your template should have a password input for the confirm password').not.toBeNull();
    confirmPassword.value = 'password';
    confirmPassword.dispatchEvent(new Event('input'));
    confirmPassword.value = '';
    confirmPassword.dispatchEvent(new Event('input'));
    await harness.fixture.whenStable();

    const confirmPasswordError = element.querySelector('#confirm-password-required-error')!;
    expect(confirmPasswordError)
      .withContext('You should have an error message if the confirm password field is required and dirty')
      .not.toBeNull();
    expect(confirmPasswordError.textContent)
      .withContext('The error message for the confirm password field is incorrect')
      .toContain('Password confirmation is required');

    confirmPassword.value = 'passwor';
    confirmPassword.dispatchEvent(new Event('input'));
    await harness.fixture.whenStable();

    const matchingErrorMessage = element.querySelector('#password-matching-error')!;
    expect(matchingErrorMessage)
      .withContext('You should have a div with the id `password-matching-error` to display the error')
      .not.toBeNull();
    expect(matchingErrorMessage.textContent).withContext('Your error message is not correct').toContain('Your password does not match');

    confirmPassword.value = 'password';
    confirmPassword.dispatchEvent(new Event('input'));
    await harness.fixture.whenStable();

    const birthYear = element.querySelector<HTMLInputElement>('input[type="number"]')!;
    expect(birthYear).withContext('Your template should have a number input for the birthYear').not.toBeNull();
    birthYear.value = '1986';
    birthYear.dispatchEvent(new Event('input'));
    birthYear.value = '';
    birthYear.dispatchEvent(new Event('input'));
    await harness.fixture.whenStable();

    const birthYearError = element.querySelector('#birth-year-required-error')!;
    expect(birthYearError).withContext('You should have an error message if the birthYear field is required and dirty').not.toBeNull();
    expect(birthYearError.textContent)
      .withContext('The error message for the birthYear field is incorrect')
      .toContain('Birth year is required');

    birthYear.value = '1899';
    birthYear.dispatchEvent(new Event('input'));
    await harness.fixture.whenStable();

    let invalidYearError = element.querySelector('#birth-year-invalid-error')!;
    expect(invalidYearError)
      .withContext('A div with the id `birth-year-invalid-error` must be displayed if the year is before 1900')
      .not.toBeNull();
    expect(invalidYearError.textContent).toContain('This is not a valid year');

    // given an invalid value in the future
    birthYear.value = `${new Date().getFullYear() + 1}`;
    birthYear.dispatchEvent(new Event('input'));
    await harness.fixture.whenStable();

    // then we should have an error
    invalidYearError = element.querySelector('#birth-year-invalid-error')!;
    expect(invalidYearError)
      .withContext('A div with the id `birth-year-invalid-error` must be displayed if the year is after next year')
      .not.toBeNull();
    expect(invalidYearError.textContent).toContain('This is not a valid year');

    // given a valid value
    birthYear.value = '1982';
    birthYear.dispatchEvent(new Event('input'));
    await harness.fixture.whenStable();

    // then we should have a valid form, with no error
    expect(button.getAttribute('disabled')).withContext('Your submit button should not be disabled if the form is valid').toBeNull();
  });

  it('should call the user service to register', async () => {
    const harness = await RouterTestingHarness.create('/register');

    userService.register.and.returnValue(of({ id: 1 } as UserModel));

    // fill the form
    const element = harness.routeNativeElement!;
    const login = element.querySelector('input')!;
    login.value = 'Cédric';
    login.dispatchEvent(new Event('input'));
    const password = element.querySelector<HTMLInputElement>('input[type="password"]')!;
    password.value = 'password';
    password.dispatchEvent(new Event('input'));
    const confirmPassword = element.querySelectorAll<HTMLInputElement>('input[type="password"]')[1];
    confirmPassword.value = 'password';
    confirmPassword.dispatchEvent(new Event('input'));
    const birthYear = element.querySelector<HTMLInputElement>('input[type="number"]')!;
    birthYear.value = '1986';
    birthYear.dispatchEvent(new Event('input'));
    await harness.fixture.whenStable();

    const button = element.querySelector('button')!;
    button.click();
    await harness.fixture.whenStable();
    await harness.fixture.whenStable();

    // then we should have called the user service
    expect(userService.register).toHaveBeenCalledWith('Cédric', 'password', 1986);
    // and navigate to the home
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/');
  });

  it('should display an error message if registration fails', async () => {
    const harness = await RouterTestingHarness.create('/register');

    userService.register.and.callFake(() => throwError(() => new Error('Oops')));

    // fill the form
    const element = harness.routeNativeElement!;
    const login = element.querySelector('input')!;
    login.value = 'Cédric';
    login.dispatchEvent(new Event('input'));
    const password = element.querySelector<HTMLInputElement>('input[type="password"]')!;
    password.value = 'password';
    password.dispatchEvent(new Event('input'));
    const confirmPassword = element.querySelectorAll<HTMLInputElement>('input[type="password"]')[1];
    confirmPassword.value = 'password';
    confirmPassword.dispatchEvent(new Event('input'));
    const birthYear = element.querySelector<HTMLInputElement>('input[type="number"]')!;
    birthYear.value = '1986';
    birthYear.dispatchEvent(new Event('input'));
    await harness.fixture.whenStable();

    const button = element.querySelector('button')!;
    button.click();
    await harness.fixture.whenStable();
    await harness.fixture.whenStable();

    // then we should have called the user service
    expect(userService.register).toHaveBeenCalledWith('Cédric', 'password', 1986);
    // and not navigate
    const router = TestBed.inject(Router);
    expect(router.url).not.toBe('/');
    // and display the error message
    const errorMessage = element.querySelector('#registration-error')!;
    expect(errorMessage)
      .withContext('You should display an error message in a div with id `registration-error` if the registration fails')
      .not.toBeNull();
    expect(errorMessage.textContent).toContain('Try again with another login.');
  });
});
