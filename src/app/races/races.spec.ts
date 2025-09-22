import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { Race } from '../race/race';
import { RaceService } from '../race-service';
import { RaceModel } from '../models/race.model';
import { Races } from './races';

describe('Races', () => {
  let raceService: jasmine.SpyObj<RaceService>;

  beforeEach(() => {
    raceService = jasmine.createSpyObj<RaceService>('RaceService', ['list']);
    TestBed.configureTestingModule({
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        { provide: RaceService, useValue: raceService }
      ]
    });
    raceService.list.and.returnValue(
      of([
        { id: 1, name: 'Tokyo', startInstant: '2024-02-18T08:03:00' },
        { id: 2, name: 'Paris', startInstant: '2024-02-18T08:04:00' }
      ] as Array<RaceModel>)
    );
  });

  it('should display every race', async () => {
    const fixture = TestBed.createComponent(Races);
    await fixture.whenStable();
    const debugElement = fixture.debugElement;
    const races = debugElement.queryAll(By.directive(Race));
    expect(races.length).withContext('You should have two `Race` displayed').toBe(2);
  });
});
