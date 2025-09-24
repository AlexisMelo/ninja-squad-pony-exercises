import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../environments/environment';
import { RaceService } from './race-service';
import { LiveRaceModel, RaceModel } from './models/race.model';

describe('RaceService', () => {
  let raceService: RaceService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    raceService = TestBed.inject(RaceService);
    http = TestBed.inject(HttpTestingController);
    jasmine.clock().install();
  });

  afterEach(() => jasmine.clock().uninstall());

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

  it('should return a live race every second', () => {
    const raceId = 1;
    let race: LiveRaceModel | undefined;
    let counter = 0;

    raceService.live(raceId).subscribe(liveRace => {
      race = liveRace;
      counter++;
    });

    expect(race).withContext('The observable should only emit after 1 second').toBeUndefined();

    // emulates the 1 second delay
    jasmine.clock().tick(1000);
    expect(race).withContext('The observable should have emitted after a 1 second interval').toBeDefined();
    expect(race!.ponies.length).withContext('The observable should have emitted after a 1 second interval').toBe(5);
    let position = race!.ponies[0];
    expect(position.name).toBe('Superb Runner');
    expect(position.color).toBe('BLUE');
    expect(position.position).toBe(0);
    jasmine.clock().tick(1000);

    expect(race!.ponies.length).toBe(5);
    position = race!.ponies[1];
    expect(position.name).toBe('Awesome Fridge');
    expect(position.color).toBe('GREEN');
    expect(position.position).toBe(1);

    // emulates the 100 seconds of the race
    while (counter < 100) {
      jasmine.clock().tick(1000);
    }

    expect(race!.ponies.length).toBe(5);
    position = race!.ponies[2];
    expect(position.name).toBe('Great Bottle');
    expect(position.color).toBe('ORANGE');
    expect(position.position).toBe(99);

    jasmine.clock().tick(1000);
    expect(race!.ponies.length).toBe(5);
    position = race!.ponies[3];
    expect(position.name).toBe('Little Flower');
    expect(position.color).toBe('YELLOW');
    expect(position.position).toBe(100);

    jasmine.clock().tick(1000);
    expect(race!.ponies.length).toBe(5);
    position = race!.ponies[4];
    expect(position.name).toBe('Nice Rock');
    expect(position.color).toBe('PURPLE');
    expect(position.position).toBe(100);
  });
});
