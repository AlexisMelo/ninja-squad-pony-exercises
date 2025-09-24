import { inputBinding, outputBinding, signal } from '@angular/core';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { PonyModel } from '../models/pony.model';
import { Pony } from './pony';

describe('Pony', () => {
  const ponyModel = signal<PonyModel>({ id: 1, name: 'Fast Rainbow', color: 'PURPLE' });

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }]
    })
  );

  it('should display an image and a legend', async () => {
    const fixture = TestBed.createComponent(Pony, {
      bindings: [inputBinding('ponyModel', ponyModel)]
    });
    await fixture.whenStable();

    // then we should have an image and a legend
    const element = fixture.nativeElement as HTMLElement;
    const image = element.querySelector('img')!;
    expect(image).withContext('You should have an image for the pony').not.toBeNull();
    expect(image.getAttribute('src')).withContext('The `src` attribute of the image is not correct').toBe('images/pony-purple.gif');
    expect(image.getAttribute('alt')).withContext('The `alt` attribute for the image is not correct').toBe('Fast Rainbow');
    const legend = element.querySelector('figcaption')!;
    expect(legend).withContext('You should have a `figcaption` element for the pony').not.toBeNull();
    expect(legend.textContent).withContext('The `figcaption` element should display the name of the pony').toContain('Fast Rainbow');
  });

  it('should emit an event on click', async () => {
    const isPonySelected = signal(false);
    const fixture = TestBed.createComponent(Pony, {
      bindings: [inputBinding('ponyModel', ponyModel), outputBinding('ponySelected', () => isPonySelected.set(true))]
    });
    await fixture.whenStable();

    // when we click on the element
    const element = fixture.nativeElement as HTMLElement;
    const figure = element.querySelector('figure')!;
    expect(figure).withContext('You should have a `figure` element for the pony').not.toBeNull();
    expect(window.getComputedStyle(figure).getPropertyValue('padding-top'))
      .withContext('You must apply some styles to the `figure` element')
      .toBe('3px');
    figure.click();

    expect(isPonySelected()).withContext('You may have forgot the click handler on the `figure` element').toBeTruthy();
  });

  it('should display a running pony', async () => {
    const isRunning = signal(true);
    const fixture = TestBed.createComponent(Pony, {
      bindings: [inputBinding('ponyModel', ponyModel), inputBinding('isRunning', isRunning)]
    });
    await fixture.whenStable();

    // then we should have an image with a running pony
    const element = fixture.nativeElement as HTMLElement;
    const image = element.querySelector('img')!;
    expect(image).withContext('You should have an image for the pony').not.toBeNull();
    expect(image.getAttribute('src')).withContext('The `src` attribute of the image is not correct').toBe('images/pony-purple-running.gif');
  });

  it('should display a boosted pony', async () => {
    const isBoosted = signal(true);
    const fixture = TestBed.createComponent(Pony, {
      bindings: [inputBinding('ponyModel', ponyModel), inputBinding('isBoosted', isBoosted)]
    });
    await fixture.whenStable();

    // then we should have an image with a boosted pony
    const element = fixture.nativeElement as HTMLElement;
    const image = element.querySelector('img')!;
    expect(image).withContext('You should have an image for the pony').not.toBeNull();
    expect(image.getAttribute('src')).withContext('The `src` attribute of the image is not correct').toBe('images/pony-purple-rainbow.gif');
  });
});
