import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../environments/environment';
import { UserService } from './user-service';
import { UserModel } from './models/user.model';

describe('UserService', () => {
  let http: HttpTestingController;
  let localStorageGetItem: jasmine.Spy<(key: string) => string | null>;

  const user = {
    id: 1,
    login: 'cedric',
    money: 1000,
    registrationInstant: '2015-12-01T11:00:00Z',
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.5cAW816GUAg3OWKWlsYyXI4w3fDrS5BpnmbyBjVM7lo'
  };

  beforeEach(() => {
    localStorageGetItem = spyOn(Storage.prototype, 'getItem');
    localStorageGetItem.and.returnValue(null);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterAll(() => http.verify());

  it('should authenticate and store a user', () => {
    spyOn(Storage.prototype, 'setItem');

    let actualUser: UserModel | undefined;
    const userService = TestBed.inject(UserService);
    userService.authenticate('cedric', 'hello').subscribe(fetchedUser => (actualUser = fetchedUser));

    const req = http.expectOne({ method: 'POST', url: `${environment.baseUrl}/api/users/authentication` });
    expect(req.request.body).toEqual({ login: 'cedric', password: 'hello' });
    req.flush(user);

    expect(actualUser).withContext('The observable should return the user').toBe(user);
    expect(userService.currentUser()).toEqual(user);

    TestBed.tick();
    expect(Storage.prototype.setItem).toHaveBeenCalledWith('rememberMe', JSON.stringify(user));
  });

  it('should register a user', () => {
    let actualUser: UserModel | undefined;
    const userService = TestBed.inject(UserService);
    userService.register(user.login, 'password', 1986).subscribe(fetchedUser => (actualUser = fetchedUser));

    const req = http.expectOne({ method: 'POST', url: `${environment.baseUrl}/api/users` });
    expect(req.request.body).toEqual({ login: user.login, password: 'password', birthYear: 1986 });
    req.flush(user);

    expect(actualUser).withContext('You should emit the user.').toBe(user);
  });

  it('should retrieve a user if one is stored', () => {
    localStorageGetItem.and.returnValue(JSON.stringify(user));
    const userService = TestBed.inject(UserService);
    expect(userService.currentUser()).toEqual(user);
    expect(localStorageGetItem).toHaveBeenCalledWith('rememberMe');
  });

  it('should retrieve no user if none stored', () => {
    const userService = TestBed.inject(UserService);
    expect(userService.currentUser()).toBeUndefined();
  });

  it('should logout the user', () => {
    spyOn(Storage.prototype, 'removeItem');
    localStorageGetItem.and.returnValue(JSON.stringify(user));
    const userService = TestBed.inject(UserService);
    expect(userService.currentUser()).toEqual(user);

    userService.logout();

    expect(userService.currentUser()).toBeUndefined();

    TestBed.tick();
    expect(Storage.prototype.removeItem).toHaveBeenCalledWith('rememberMe');
  });
});
