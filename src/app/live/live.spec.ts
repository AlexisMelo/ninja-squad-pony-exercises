import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { of, Subject } from 'rxjs';
import { RaceService } from '../race-service';
import { PonyModel } from '../models/pony.model';
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
    raceService = jasmine.createSpyObj<RaceService>('RaceService', ['get', 'live']);
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

  it('should display the title', async () => {
    raceService.get.and.returnValue(of(race));
    raceService.live.and.returnValue(of({ ponies: [], status: 'RUNNING' }));
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/races/12/live', Live);

    const element = harness.routeNativeElement!;
    const title = element.querySelector('h1')!;
    expect(title).withContext('The template should display an h1 element with the race name inside').not.toBeNull();
    expect(title.textContent).withContext('The template should display an h1 element with the race name inside').toContain('Lyon');
  });

  it('should subscribe to the live observable', async () => {
    raceService.get.and.returnValue(of(race));
    raceService.live.and.returnValue(of({ ponies: [], status: 'RUNNING' }));
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/races/12/live', Live);

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

  it('should display a div with a pony component per pony', async () => {
    raceService.get.and.returnValue(of(race));
    raceService.live.and.returnValue(
      of({
        ponies: [
          { id: 1, name: 'Sunny Sunday', color: 'BLUE', position: 10 },
          { id: 2, name: 'Awesome Fridge', color: 'Green', position: 40 }
        ],
        status: 'RUNNING'
      })
    );
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/races/12/live', Live);

    const element = harness.routeNativeElement!;
    const divWithPonies = element.querySelectorAll('div.pony-wrapper');
    expect(divWithPonies.length).withContext('You should display a `div` with a class `pony-wrapper` for each pony').toBe(2);

    const debugElement = harness.routeDebugElement!;
    const ponyComponents = debugElement.queryAll(By.directive(PonyStub));
    expect(ponyComponents).withContext('You should display a `Pony` for each pony').not.toBeNull();
    expect(ponyComponents.length).withContext('You should display a `Pony` for each pony').toBe(2);

    const sunnySunday = ponyComponents[0].componentInstance as PonyStub;
    expect(sunnySunday.isRunning()).withContext('Each pony should be running (use the `isRunning` input)').toBeTruthy();

    const sunnySundayDiv = divWithPonies[0];
    expect(sunnySundayDiv.getAttribute('style'))
      .withContext('The `margin-left` style should match the position of the pony in percent minus 5')
      .toContain('margin-left: 5%;');
    expect(sunnySundayDiv.getAttribute('style'))
      .withContext('A `transition` style should be applied')
      .toContain('transition: margin-left 1s linear;');
  });
});
