import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user-service';
import { UserModel } from './models/user.model';

describe('UserService', () => {
  let http: HttpTestingController;

  const user = {
    id: 1,
    login: 'cedric',
    money: 1000,
    registrationInstant: '2015-12-01T11:00:00Z',
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.5cAW816GUAg3OWKWlsYyXI4w3fDrS5BpnmbyBjVM7lo'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterAll(() => http.verify());

  it('should authenticate a user', () => {
    let actualUser: UserModel | undefined;
    const userService = TestBed.inject(UserService);
    userService.authenticate('cedric', 'hello').subscribe(fetchedUser => (actualUser = fetchedUser));

    const req = http.expectOne({ method: 'POST', url: 'https://ponyracer.ninja-squad.com/api/users/authentication' });
    expect(req.request.body).toEqual({ login: 'cedric', password: 'hello' });
    req.flush(user);

    expect(actualUser).withContext('The observable should return the user').toBe(user);
    expect(userService.currentUser()).toEqual(user);
  });

  it('should register a user', () => {
    let actualUser: UserModel | undefined;
    const userService = TestBed.inject(UserService);
    userService.register(user.login, 'password', 1986).subscribe(fetchedUser => (actualUser = fetchedUser));

    const req = http.expectOne({ method: 'POST', url: 'https://ponyracer.ninja-squad.com/api/users' });
    expect(req.request.body).toEqual({ login: user.login, password: 'password', birthYear: 1986 });
    req.flush(user);

    expect(actualUser).withContext('You should emit the user.').toBe(user);
  });

  it('should logout the user', () => {
    // log in the user
    const userService = TestBed.inject(UserService);
    userService.authenticate('cedric', 'hello').subscribe();
    http.expectOne({ method: 'POST', url: 'https://ponyracer.ninja-squad.com/api/users/authentication' }).flush(user);

    userService.logout();

    expect(userService.currentUser()).toBeUndefined();
  });
});
