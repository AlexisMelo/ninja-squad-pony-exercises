import { signal } from '@angular/core';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Location } from '@angular/common';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { RaceService } from '../race-service';
import { UserService } from '../user-service';
import { UserModel } from '../models/user.model';
import { routes } from '../app.routes';
import { PendingRaces } from './pending-races/pending-races';
import { FinishedRaces } from './finished-races/finished-races';

describe('Races', () => {
  beforeEach(() => {
    const raceService = jasmine.createSpyObj<RaceService>('RaceService', ['list']);
    const userService = jasmine.createSpyObj<UserService>('UserService', [], { currentUser: signal({} as UserModel) });
    TestBed.configureTestingModule({
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        provideRouter(routes),
        { provide: RaceService, useValue: raceService },
        { provide: UserService, useValue: userService }
      ]
    });
    raceService.list.and.returnValue(of([]));
  });

  it('should redirect from /races to /races/pending', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/races');

    const location = TestBed.inject(Location);
    expect(location.path()).withContext('You should redirect from /races to /races/pending').toBe('/races/pending');
  });

  it('should show two tabs', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/races');

    const tabLinks = harness.routeNativeElement!.querySelectorAll<HTMLAnchorElement>('.nav.nav-tabs .nav-item a.nav-link');
    expect(tabLinks.length).withContext('You should have two tabs, one for pending races, one for the finished races').toBe(2);
    expect(tabLinks[0].href).toContain('/races/pending');
    expect(tabLinks[1].href).toContain('/races/finished');
  });

  it('should have make first tab active when showing pending races', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/races');

    const links = harness.routeNativeElement!.querySelectorAll<HTMLAnchorElement>('a.nav-link');
    expect(links.length).withContext('You must have two links').toBe(2);
    expect(links[0].className).withContext('The first link should be active').toContain('active');
    expect(links[1].className).withContext('The second link should not be active').not.toContain('active');
  });

  it('should have make second tab active when showing finished races', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/races/finished');

    const links = harness.routeNativeElement!.querySelectorAll<HTMLAnchorElement>('a.nav-link');
    expect(links.length).withContext('You must have two links').toBe(2);
    expect(links[0].className).withContext('The first link should not be active').not.toContain('active');
    expect(links[1].className).withContext('The second link should be active').toContain('active');
  });

  it('should display pending races for /races/pending and finished races for /races/finished', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/races/pending');
    const pendingRaces = harness.routeDebugElement!.query(By.directive(PendingRaces));
    expect(pendingRaces).withContext('You should have a PendingRaces for the /races/pending route').not.toBeNull();

    await harness.navigateByUrl('/races/finished');
    const finishedRaces = harness.routeDebugElement!.query(By.directive(FinishedRaces));
    expect(finishedRaces).withContext('You should have a FinishedRaces for the /races/finished route').not.toBeNull();
  });
});
