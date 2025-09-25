import { booleanAttribute, ChangeDetectionStrategy, Component, input, output, signal, Type } from '@angular/core';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { Alert } from './alert';

@Component({
  selector: 'pr-alert',
  template: '<div><ng-content /></div>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertStub {
  readonly type = input<'success' | 'danger' | 'warning'>('warning');
  readonly dismissible = input(true, { transform: booleanAttribute });
  readonly closed = output<void>();
}

export function useAlertStub(testComponent: Type<unknown>) {
  TestBed.overrideComponent(testComponent, {
    remove: {
      imports: [Alert]
    },
    add: {
      imports: [AlertStub]
    }
  });
}

@Component({
  imports: [Alert],
  template: `<pr-alert [type]="type()" [dismissible]="dismissible()" (closed)="closed.set(true)">Hello</pr-alert>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class AlertTest {
  readonly type = signal<'success' | 'danger' | 'warning'>('warning');
  readonly dismissible = signal(true);
  readonly closed = signal(false);
}

describe('Alert', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }]
    })
  );

  it('should display a div with correct classes', async () => {
    const fixture = TestBed.createComponent(AlertTest);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const rootDiv = element.querySelector('div')!;
    expect(rootDiv).withContext('The Alert should display a `div`').not.toBeNull();
    expect(rootDiv.className).withContext('The div should have the `alert` class').toContain('alert');
    expect(rootDiv.className)
      .withContext('The div should have the `alert-warning` class if no type is specified')
      .toContain('alert-warning');
    expect(rootDiv.className).withContext('The div should have the `alert-dismissible` class').toContain('alert-dismissible');

    fixture.componentInstance.dismissible.set(false);
    await fixture.whenStable();
    expect(rootDiv.className)
      .withContext('The div should not have the `alert-dismissible` class if dismissible is false')
      .not.toContain('alert-dismissible');

    fixture.componentInstance.dismissible.set(true);
    fixture.componentInstance.type.set('danger');
    await fixture.whenStable();
    expect(rootDiv.className).withContext('The div should have the `alert-danger` class if type is danger').toContain('alert-danger');
    expect(rootDiv.className)
      .withContext('The div should not have the `alert-warning` class if type is danger')
      .not.toContain('alert-warning');
    expect(rootDiv.className).withContext('The div should have the `alert-dismissible` class').toContain('alert-dismissible');

    fixture.componentInstance.type.set('success');
    await fixture.whenStable();
    expect(rootDiv.className).withContext('The div should have the `alert-success` class if type is success').toContain('alert-success');
    expect(rootDiv.className)
      .withContext('The div should not have the `alert-danger` class if type is success')
      .not.toContain('alert-danger');
    expect(rootDiv.className).withContext('The div should have the `alert-dismissible` class').toContain('alert-dismissible');
  });

  it('should display the content', async () => {
    const fixture = TestBed.createComponent(AlertTest);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).withContext('The Alert should use `ng-content`').toContain('Hello');
  });

  it('should display a button depending on dismissible input', async () => {
    const fixture = TestBed.createComponent(AlertTest);
    fixture.componentInstance.dismissible.set(false);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('button')).withContext('The Alert should not display a `button` if not dismissible').toBeNull();

    fixture.componentInstance.dismissible.set(true);
    await fixture.whenStable();
    expect(element.querySelector('button')).withContext('The Alert should display a `button` if dismissible').not.toBeNull();
  });

  it('should emit a close event', async () => {
    const fixture = TestBed.createComponent(AlertTest);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    element.querySelector('button')!.click();
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(component.closed()).withContext('You should emit an event on close').toBe(true);
  });
});
