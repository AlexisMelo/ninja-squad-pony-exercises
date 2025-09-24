import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ComponentFixtureAutoDetect, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { EMPTY, of, Subject } from 'rxjs';
import { RaceService } from '../race-service';
import { PonyModel, PonyWithPositionModel } from '../models/pony.model';
import { LiveRaceModel, RaceModel } from '../models/race.model';
import { Pony } from '../pony/pony';
import { Live } from './live';

@Component({
  selector: 'pr-pony',
  template: '<div>{{ ponyModel().name }}</div>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
class PonyStub {
  readonly ponyModel = input.required<PonyModel>();
  readonly isRunning = input(false);
  readonly isBoosted = input(false);
}

describe('Live', () => {
  let raceService: jasmine.SpyObj<RaceService>;
  const race = {
    id: 12,
    name: 'Lyon',
    status: 'PENDING',
    ponies: [],
    startInstant: '2024-02-18T08:02:00'
  } as RaceModel;

  beforeEach(() => {
    raceService = jasmine.createSpyObj<RaceService>('RaceService', ['get', 'live', 'boost']);
    TestBed.configureTestingModule({
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        provideRouter([{ path: 'races/:raceId/live', component: Live }]),
        { provide: RaceService, useValue: raceService }
      ]
    });
    TestBed.overrideComponent(Live, {
      remove: {
        imports: [Pony]
      },
      add: {
        imports: [PonyStub]
      }
    });
  });

  it('should change the race status once the race is RUNNING', async () => {
    raceService.get.and.returnValue(of(race));
    const liveRace = new Subject<LiveRaceModel>();
    raceService.live.and.returnValue(liveRace);

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/races/12/live', Live);

    // there is no flag displayed as the race is PENDING
    expect(harness.routeNativeElement!.querySelector('.fa-flag')).toBeNull();

    liveRace.next({ status: 'RUNNING', ponies: [{ id: 1, name: 'Sunny Sunday', color: 'BLUE', position: 0, boosted: false }] });
    await harness.fixture.whenStable();

    // there is a flag displayed as the race is RUNNING
    expect(harness.routeNativeElement!.querySelector('.fa-flag')).not.toBeNull();

    expect(raceService.get).toHaveBeenCalledWith(12);
    expect(raceService.live).toHaveBeenCalledWith(12);
  });

  it('should unsubscribe on destruction', async () => {
    raceService.get.and.returnValue(of(race));
    const liveRace = new Subject<LiveRaceModel>();
    raceService.live.and.returnValue(liveRace);

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/races/12/live', Live);
    expect(liveRace.observed).withContext('You need to subscribe to raceService.live when the component is created').toBeTrue();

    harness.fixture.destroy();

    expect(liveRace.observed).withContext('You need to unsubscribe from raceService.live when the component is destroyed').toBeFalse();
  });

  it('should display the pending race', async () => {
    raceService.get.and.returnValue(
      of({
        ...race,
        ponies: [
          { id: 1, name: 'Sunny Sunday', color: 'BLUE' },
          { id: 2, name: 'Pinkie Pie', color: 'GREEN' },
          { id: 3, name: 'Awesome Fridge', color: 'YELLOW' }
        ]
      })
    );
    const liveRace = new Subject<LiveRaceModel>();
    raceService.live.and.returnValue(liveRace);

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/races/12/live', Live);

    const element = harness.routeNativeElement!;
    const title = element.querySelector('h1')!;
    expect(title).withContext('The template should display an h1 element with the race name inside').not.toBeNull();
    expect(title.textContent).withContext('The template should display an h1 element with the race name inside').toContain('Lyon');
    const liveRaceElement = element.querySelector('#live-race')!;
    expect(liveRaceElement.textContent).toContain('The race will start');

    const debugElement = harness.routeDebugElement!;
    const ponyComponents = debugElement.queryAll(By.directive(PonyStub));
    expect(ponyComponents).withContext('You should display a `Pony` for each pony').not.toBeNull();
    expect(ponyComponents.length).withContext('You should display a `Pony` for each pony').toBe(3);

    const sunnySunday = ponyComponents[0].componentInstance as PonyStub;
    expect(sunnySunday.isRunning()).withContext('The ponies should not be running').toBeFalsy();
  });

  it('should display the running race', async () => {
    raceService.get.and.returnValue(
      of({
        ...race,
        status: 'RUNNING',
        ponies: [
          { id: 1, name: 'Sunny Sunday', color: 'BLUE' },
          { id: 2, name: 'Pinkie Pie', color: 'GREEN' },
          { id: 3, name: 'Awesome Fridge', color: 'YELLOW' }
        ]
      })
    );
    const liveRace = new Subject<LiveRaceModel>();
    raceService.live.and.returnValue(liveRace);

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/races/12/live', Live);

    const element = harness.routeNativeElement!;
    const title = element.querySelector('h1')!;
    expect(title).withContext('The template should display an h1 element with the race name inside').not.toBeNull();
    expect(title.textContent).withContext('The template should display an h1 element with the race name inside').toContain('Lyon');

    liveRace.next({
      status: 'RUNNING',
      ponies: [
        { id: 1, name: 'Sunny Sunday', color: 'BLUE', position: 10, boosted: false },
        { id: 2, name: 'Pinkie Pie', color: 'GREEN', position: 10, boosted: false },
        { id: 3, name: 'Awesome Fridge', color: 'YELLOW', position: 9, boosted: false }
      ]
    });
    await harness.fixture.whenStable();

    const debugElement = harness.routeDebugElement!;
    const ponyComponents = debugElement.queryAll(By.directive(PonyStub));
    expect(ponyComponents).withContext('You should display a `Pony` for each pony').not.toBeNull();
    expect(ponyComponents.length).withContext('You should display a `Pony` for each pony').toBe(3);

    const sunnySunday = ponyComponents[0].componentInstance as PonyStub;
    expect(sunnySunday.isRunning()).withContext('The ponies should be running').toBeTruthy();
  });

  it('should display the finished race', async () => {
    raceService.get.and.returnValue(
      of({
        ...race,
        ponies: [
          { id: 1, name: 'Sunny Sunday', color: 'BLUE' },
          { id: 2, name: 'Pinkie Pie', color: 'GREEN' },
          { id: 3, name: 'Awesome Fridge', color: 'YELLOW' }
        ],
        betPonyId: 1
      })
    );
    const liveRace = new Subject<LiveRaceModel>();
    raceService.live.and.returnValue(liveRace);

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/races/12/live', Live);

    const element = harness.routeNativeElement!;
    const title = element.querySelector('h1')!;
    expect(title).withContext('The template should display an h1 element with the race name inside').not.toBeNull();
    expect(title.textContent).withContext('The template should display an h1 element with the race name inside').toContain('Lyon');

    liveRace.next({
      status: 'FINISHED',
      ponies: [
        { id: 1, name: 'Sunny Sunday', color: 'BLUE', position: 101, boosted: false },
        { id: 2, name: 'Pinkie Pie', color: 'GREEN', position: 100, boosted: false },
        { id: 3, name: 'Awesome Fridge', color: 'YELLOW', position: 9, boosted: false }
      ]
    });
    liveRace.complete();
    await harness.fixture.whenStable();

    // won the bet!
    const debugElement = harness.routeDebugElement!;
    const ponyComponents = debugElement.queryAll(By.directive(PonyStub));
    expect(ponyComponents).withContext('You should display a `Pony` for each winner').not.toBeNull();
    expect(ponyComponents.length).withContext('You should display a `Pony` for each pony').toBe(2);

    const sunnySunday = ponyComponents[0].componentInstance as PonyStub;
    expect(sunnySunday.isRunning()).withContext('The ponies should be not running').toBeFalsy();

    expect(element.textContent).toContain('You won your bet!');
  });

  it('should display a message when the race is lost', async () => {
    raceService.get.and.returnValue(
      of({
        ...race,
        ponies: [
          { id: 1, name: 'Sunny Sunday', color: 'BLUE' },
          { id: 2, name: 'Pinkie Pie', color: 'GREEN' },
          { id: 3, name: 'Awesome Fridge', color: 'YELLOW' }
        ],
        betPonyId: 3
      })
    );
    const liveRace = new Subject<LiveRaceModel>();
    raceService.live.and.returnValue(liveRace);

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/races/12/live', Live);

    const element = harness.routeNativeElement!;
    liveRace.next({
      status: 'FINISHED',
      ponies: [
        { id: 1, name: 'Sunny Sunday', color: 'BLUE', position: 101, boosted: false },
        { id: 2, name: 'Pinkie Pie', color: 'GREEN', position: 100, boosted: false },
        { id: 3, name: 'Awesome Fridge', color: 'YELLOW', position: 9, boosted: false }
      ]
    });
    liveRace.complete();
    await harness.fixture.whenStable();

    // lost the bet...
    expect(element.textContent).toContain('You lost your bet.');
  });

  it('should display a message when the race is over', async () => {
    raceService.get.and.returnValue(
      of({
        ...race,
        ponies: [
          { id: 1, name: 'Sunny Sunday', color: 'BLUE' },
          { id: 2, name: 'Pinkie Pie', color: 'GREEN' },
          { id: 3, name: 'Awesome Fridge', color: 'YELLOW' }
        ],
        status: 'FINISHED'
      })
    );

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/races/12/live', Live);

    const element = harness.routeNativeElement!;
    await harness.fixture.whenStable();

    // race is over
    expect(element.textContent).toContain('The race is over.');
  });

  it('should display a message when an error occurred', async () => {
    raceService.get.and.returnValue(
      of({
        ...race,
        ponies: [
          { id: 1, name: 'Sunny Sunday', color: 'BLUE' },
          { id: 2, name: 'Pinkie Pie', color: 'GREEN' },
          { id: 3, name: 'Awesome Fridge', color: 'YELLOW' }
        ],
        betPonyId: 1
      })
    );
    const liveRace = new Subject<LiveRaceModel>();
    raceService.live.and.returnValue(liveRace);

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/races/12/live', Live);

    const element = harness.routeNativeElement!;
    const title = element.querySelector('h1')!;
    expect(title).withContext('The template should display an h1 element with the race name inside').not.toBeNull();
    expect(title.textContent).withContext('The template should display an h1 element with the race name inside').toContain('Lyon');

    liveRace.error(new Error('oops'));
    await harness.fixture.whenStable();

    // an error occurred
    const alert = element.querySelector('div.alert.alert-danger')!;
    expect(alert.textContent).toContain('A problem occurred during the live.');
  });

  it('should buffer clicks over a second and call the boost method', fakeAsync(async () => {
    const pony: PonyWithPositionModel = { id: 1, name: 'Sunny Sunday', color: 'BLUE', position: 10, boosted: false };
    raceService.get.and.returnValue(of({ ...race, status: 'RUNNING', ponies: [pony] }));
    raceService.boost.and.returnValue(of(undefined));
    const liveRace = new Subject<LiveRaceModel>();
    raceService.live.and.returnValue(liveRace);

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/races/12/live', Live);

    liveRace.next({ status: 'RUNNING', ponies: [pony] });
    await harness.fixture.whenStable();

    // when 5 clicks are emitted in a second
    const ponyComponent = harness.routeDebugElement!.query(By.directive(PonyStub));
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    tick(1000);

    // then we should call the boost method
    expect(raceService.boost).toHaveBeenCalledWith(race.id, pony.id);
    raceService.boost.calls.reset();

    // when 5 clicks are emitted over 2 seconds
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    tick(1000);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    tick(1000);

    // then we should not call the boost method
    expect(raceService.boost).not.toHaveBeenCalled();
  }));

  it('should filter click buffer that are not at least 5', fakeAsync(async () => {
    const pony: PonyWithPositionModel = { id: 1, name: 'Sunny Sunday', color: 'BLUE', position: 10, boosted: false };
    const pony2: PonyWithPositionModel = { id: 2, name: 'Black Friday', color: 'GREEN', position: 11, boosted: false };
    raceService.get.and.returnValue(of({ ...race, status: 'RUNNING', ponies: [pony, pony2] }));
    raceService.boost.and.returnValue(of(undefined));
    raceService.live.and.returnValue(EMPTY);
    const liveRace = new Subject<LiveRaceModel>();
    raceService.live.and.returnValue(liveRace);

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/races/12/live', Live);

    liveRace.next({ status: 'RUNNING', ponies: [pony, pony2] });
    await harness.fixture.whenStable();

    // when 4 clicks are emitted in a second
    const ponyComponent = harness.routeDebugElement!.query(By.directive(PonyStub));
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    tick(1000);

    // then we should not call the boost method
    expect(raceService.boost).not.toHaveBeenCalled();

    // when 5 clicks are emitted over a second on two ponies
    const pony2Component = harness.routeDebugElement!.queryAll(By.directive(PonyStub)).at(1)!;
    ponyComponent.triggerEventHandler('ponySelected', pony);
    pony2Component.triggerEventHandler('ponySelected', pony2);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    pony2Component.triggerEventHandler('ponySelected', pony2);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    tick(1000);

    // then we should not call the boost method
    expect(raceService.boost).not.toHaveBeenCalled();
  }));

  it('should throttle repeated boosts', fakeAsync(async () => {
    const pony: PonyWithPositionModel = { id: 1, name: 'Sunny Sunday', color: 'BLUE', position: 10, boosted: false };
    raceService.get.and.returnValue(of({ ...race, status: 'RUNNING', ponies: [pony] }));
    raceService.boost.and.returnValue(of(undefined));
    const liveRace = new Subject<LiveRaceModel>();
    raceService.live.and.returnValue(liveRace);

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/races/12/live', Live);

    liveRace.next({ status: 'RUNNING', ponies: [pony] });
    await harness.fixture.whenStable();

    // when 5 clicks are emitted in a second
    const ponyComponent = harness.routeDebugElement!.query(By.directive(PonyStub));
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    tick(800);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    tick(200);

    // then we should call the boost method
    expect(raceService.boost).toHaveBeenCalled();
    raceService.boost.calls.reset();

    // when 2 other clicks are emitted
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    tick(800);

    // then we should not call the boost method with the throttling
    expect(raceService.boost).not.toHaveBeenCalled();

    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    tick(200);

    // we should call it a bit later
    expect(raceService.boost).toHaveBeenCalled();
  }));

  it('should catch a boost error', fakeAsync(async () => {
    const pony: PonyWithPositionModel = { id: 1, name: 'Sunny Sunday', color: 'BLUE', position: 10, boosted: false };
    raceService.get.and.returnValue(of({ ...race, status: 'RUNNING', ponies: [pony] }));
    const boost = new Subject<void>();
    raceService.boost.and.returnValue(boost);
    const liveRace = new Subject<LiveRaceModel>();
    raceService.live.and.returnValue(liveRace);

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/races/12/live', Live);

    liveRace.next({ status: 'RUNNING', ponies: [pony] });
    await harness.fixture.whenStable();

    // when 5 clicks are emitted in a second
    const ponyComponent = harness.routeDebugElement!.query(By.directive(PonyStub));
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    tick(1000);

    // then we should call the boost method
    expect(raceService.boost).toHaveBeenCalled();
    raceService.boost.calls.reset();
    boost.error('You should catch a potential error from the boost method with a `catch` operator');

    // when 5 other clicks are emitted
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    ponyComponent.triggerEventHandler('ponySelected', pony);
    tick(1000);

    // we should call it again if the previous error has been handled
    expect(raceService.boost).toHaveBeenCalled();
  }));
});
