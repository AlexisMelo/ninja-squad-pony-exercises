import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../environments/environment';
import { RaceService } from './race-service';
import { RaceModel } from './models/race.model';

describe('RaceService', () => {
  let raceService: RaceService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    raceService = TestBed.inject(RaceService);
    http = TestBed.inject(HttpTestingController);
  });

  afterAll(() => http.verify());

  it('should list races', () => {
    // fake response
    const hardcodedRaces = [{ name: 'Paris' }, { name: 'Tokyo' }, { name: 'Lyon' }] as Array<RaceModel>;

    let actualRaces: Array<RaceModel> = [];
    raceService.list().subscribe((races: Array<RaceModel>) => (actualRaces = races));

    http.expectOne(`${environment.baseUrl}/api/races?status=PENDING`).flush(hardcodedRaces);

    expect(actualRaces.length).withContext('The `list` method should return an array of RaceModel wrapped in an Observable').not.toBe(0);
    expect(actualRaces).toEqual(hardcodedRaces);
  });

  it('should get a race', () => {
    // fake response
    const race = { name: 'Paris' } as RaceModel;
    const raceId = 1;

    let actualRace: RaceModel | undefined;
    raceService.get(raceId).subscribe(fetchedRace => (actualRace = fetchedRace));

    http.expectOne(`${environment.baseUrl}/api/races/${raceId}`).flush(race);

    expect(actualRace).withContext('The observable must emit the race').toBe(race);
  });

  it('should bet on a race', () => {
    // fake response
    const race = { name: 'Paris' } as RaceModel;
    const raceId = 1;
    const ponyId = 2;

    let called = false;
    raceService.bet(raceId, ponyId).subscribe(() => (called = true));

    const req = http.expectOne({ method: 'POST', url: `${environment.baseUrl}/api/races/${raceId}/bets` });
    expect(req.request.body).toEqual({ ponyId });
    req.flush(race);

    expect(called).toBe(true);
  });

  it('should cancel a bet on a race', () => {
    const raceId = 1;

    let called = false;
    raceService.cancelBet(raceId).subscribe(() => (called = true));

    http.expectOne({ method: 'DELETE', url: `${environment.baseUrl}/api/races/${raceId}/bets` }).flush(null);

    expect(called).toBe(true);
  });
});
