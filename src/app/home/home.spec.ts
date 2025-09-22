import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';

describe('Home', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }, provideRouter([])]
    })
  );

  it('should display the title and quote', () => {
    const fixture = TestBed.createComponent(Home);
    const element = fixture.nativeElement as HTMLElement;

    const title = element.querySelector('h1')!;
    expect(title).withContext('You should have an `h1` element to display the title').not.toBeNull();
    expect(title.textContent).toContain('Ponyracer');
    expect(title.textContent)
      .withContext('You should have the `small` element inside the `h1` element')
      .toContain('Always a pleasure to bet on ponies');

    const subtitle = element.querySelector('small')!;
    expect(subtitle).withContext('You should have a `small` element to display the subtitle').not.toBeNull();
    expect(subtitle.textContent).toContain('Always a pleasure to bet on ponies');
  });

  it('should display a link to go the login', async () => {
    const fixture = TestBed.createComponent(Home);
    const element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();

    const button = element.querySelector('a[href="/login"]')!;
    expect(button)
      .withContext('You should have an `a` element to display the link to the login. Maybe you forgot to use `routerLink`?')
      .not.toBeNull();
    expect(button.textContent).withContext('The link should have a text').toContain('Login');
  });
});
