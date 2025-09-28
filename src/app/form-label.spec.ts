import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormLabel } from './form-label';

@Component({
  selector: 'pr-form',
  template: `<label prFormLabel for="lastName" class="form-label">Name</label>`,
  imports: [FormLabel],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class Form {}

describe('FormLabel', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }]
    })
  );

  it('should add the text-danger CSS class to the label if invalid', async () => {
    const fixture = TestBed.createComponent(Form);
    await fixture.whenStable();

    const directive = fixture.debugElement.query(By.directive(FormLabel));
    expect(directive).withContext('The directive should be applied to a label with an attribute prFormLabel').not.toBeNull();

    const directiveInstance = directive.injector.get(FormLabel);
    directiveInstance.isInvalid.set(true);

    await fixture.whenStable();

    const label = (fixture.nativeElement as HTMLElement).querySelector('label')!;

    expect(label.classList).withContext('The directive should add the CSS class if isInvalid is true').toContain('text-danger');

    directiveInstance.isInvalid.set(false);

    await fixture.whenStable();

    expect(label.classList).withContext('The directive should remove the CSS class if isInvalid is false').not.toContain('text-danger');
  });
});
