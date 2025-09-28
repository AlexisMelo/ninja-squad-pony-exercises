import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { FormLabelValidation } from './form-label-validation';
import { FormLabel } from './form-label';

@Component({
  selector: 'pr-form',
  template: `
    <form [formGroup]="userForm">
      <div class="mb-3" prFormLabelValidation>
        <label prFormLabel for="lastName" class="form-label">Name</label>
        <div>
          <input class="form-control" id="lastName" placeholder="Name" formControlName="lastName" />
        </div>
      </div>
    </form>
  `,
  imports: [FormLabelValidation, FormLabel, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class Form {
  fb = inject(NonNullableFormBuilder);
  userForm = this.fb.group({
    lastName: ['', Validators.required]
  });
}

describe('FormLabelValidation', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }]
    })
  );

  it('should set the isInvalid signal from the FormLabel on status change', async () => {
    const fixture = TestBed.createComponent(Form);
    await fixture.whenStable();

    const directiveInstance = fixture.debugElement.query(By.directive(FormLabel)).injector.get(FormLabel);
    spyOn(directiveInstance.isInvalid, 'set').and.callThrough();
    expect(directiveInstance.isInvalid.set).not.toHaveBeenCalled();

    const lastName = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#lastName')!;
    lastName.value = '';
    lastName.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(directiveInstance.isInvalid.set).toHaveBeenCalledTimes(1);
    expect(directiveInstance.isInvalid.set)
      .withContext('The directive should set isInvalid with true if the field is invalid')
      .toHaveBeenCalledWith(true);

    lastName.value = 'Raindow';
    lastName.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(directiveInstance.isInvalid.set).toHaveBeenCalledTimes(2);
    expect(directiveInstance.isInvalid.set)
      .withContext('The directive should set isInvalid with false if the field is valid')
      .toHaveBeenCalledWith(false);
  });
});
