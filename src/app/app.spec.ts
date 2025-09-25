import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { App } from './app';
import { Menu } from './menu/menu';
import { WsService } from './ws-service';

describe('App', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: WsService,
          useValue: jasmine.createSpyObj<WsService>('WsService', ['connect'])
        }
      ]
    })
  );

  it('should have a router outlet', () => {
    const fixture = TestBed.createComponent(App);
    const element = fixture.nativeElement as HTMLElement;
    const routerOutlet = element.querySelector('router-outlet');
    expect(routerOutlet).withContext('You need a RouterOutlet component in your root component').not.toBeNull();
  });

  it('should use the menu component', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element = fixture.debugElement;
    expect(element.query(By.directive(Menu)))
      .withContext('You probably forgot to add Menu to the App template')
      .not.toBeNull();
  });
});
