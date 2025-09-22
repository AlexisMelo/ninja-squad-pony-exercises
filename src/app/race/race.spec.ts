import { inputBinding, signal } from '@angular/core';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { RaceModel } from '../models/race.model';
import { Pony } from '../pony/pony';
import { Race } from './race';

describe('Race', () => {
  const raceModel = signal<RaceModel>({
    id: 12,
    name: 'Paris',
    ponies: [
      { id: 1, name: 'Gentle Pie', color: 'YELLOW' },
      { id: 2, name: 'Big Soda', color: 'ORANGE' },
      { id: 3, name: 'Gentle Bottle', color: 'PURPLE' },
      { id: 4, name: 'Superb Whiskey', color: 'GREEN' },
      { id: 5, name: 'Fast Rainbow', color: 'BLUE' }
    ],
    startInstant: '2024-02-18T08:02:00'
  });

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }]
    })
  );

  it('should display a race name and its ponies', async () => {
    const fixture = TestBed.createComponent(Race, {
      bindings: [inputBinding('raceModel', raceModel)]
    });
    await fixture.whenStable();

    // then we should have the name and ponies displayed in the template
    const element = fixture.nativeElement as HTMLElement;
    const raceName = element.querySelector('h2')!;
    expect(raceName).withContext('You need an h2 element for the race name').not.toBeNull();
    expect(raceName.textContent).withContext('The h2 element should contain the race name').toContain('Paris');
    const startInstant = element.querySelector('p')!;
    expect(startInstant).withContext('You need an p element for the race start instant').not.toBeNull();
    expect(startInstant.textContent)
      .withContext('You should use the `fromNow` pipe you created to format the start instant')
      .toContain(formatDistanceToNowStrict(parseISO('2024-02-18T08:02:00'), { addSuffix: true }));
    const ponies = fixture.debugElement.queryAll(By.directive(Pony));
    expect(ponies).withContext('You should use the Pony in your template to display the ponies').not.toBeNull();
    expect(ponies.length).withContext('You should have five pony components in your template').toBe(5);
  });
});
