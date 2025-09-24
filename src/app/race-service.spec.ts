import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Subject } from 'rxjs';
import { environment } from '../environments/environment';
import { RaceService } from './race-service';
import { WsService } from './ws-service';
import { LiveRaceModel, RaceModel } from './models/race.model';

describe('RaceService', () => {
  let raceService: RaceService;
  let http: HttpTestingController;
  const wsService = jasmine.createSpyObj<WsService>('WsService', ['connect']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: WsService, useValue: wsService }]
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

  it('should return a live race from websockets', () => {
    const raceId = 1;
    const messages = new Subject<LiveRaceModel>();
    let race: LiveRaceModel | undefined;

    wsService.connect.and.returnValue(messages);

    raceService.live(raceId).subscribe(liveRace => {
      race = liveRace;
    });

    expect(wsService.connect).toHaveBeenCalledWith(`/race/${raceId}`);

    messages.next({
      status: 'RUNNING',
      ponies: [
        {
          id: 1,
          name: 'Superb Runner',
          color: 'BLUE',
          position: 1
        }
      ]
    });
    expect(race).toBeDefined();
    expect(race!.status).toBe('RUNNING');
    expect(race!.ponies.length).toBe(1);
    expect(race!.ponies[0].position).toBe(1);

    messages.next({
      status: 'RUNNING',
      ponies: [
        {
          id: 1,
          name: 'Superb Runner',
          color: 'BLUE',
          position: 99
        }
      ]
    });
    expect(race!.status).toBe('RUNNING');
    expect(race!.ponies.length).toBe(1);
    expect(race!.ponies[0].position).toBe(99);

    messages.next({
      status: 'FINISHED',
      ponies: [
        {
          id: 1,
          name: 'Superb Runner',
          color: 'BLUE',
          position: 100
        }
      ]
    });
    expect(race!.status).toBe('FINISHED');
    expect(race!.ponies[0].position).toBe(100);

    // we should not receive any more messages
    messages.next({
      status: 'FINISHED',
      ponies: [
        {
          id: 1,
          name: 'Superb Runner',
          color: 'BLUE',
          position: 101
        }
      ]
    });
    expect(race!.status).toBe('FINISHED');
    expect(race!.ponies[0].position).toBe(100);
  });
});
