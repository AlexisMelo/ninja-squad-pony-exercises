import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { FormControlValidation } from './form-control-validation';

@Component({
  selector: 'pr-form',
  template: `
    <form [formGroup]="userForm">
      <div class="mb-3 row">
        <label for="lastName" class="form-label">Name</label>
        <div class="col-sm-10">
          <input class="form-control" id="lastName" placeholder="Name" formControlName="lastName" />
        </div>
      </div>
    </form>
  `,
  imports: [FormControlValidation, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class Form {
  fb = inject(NonNullableFormBuilder);
  userForm = this.fb.group({
    lastName: ['', Validators.required]
  });
}

describe('FormControlValidation', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }]
    })
  );

  it('should add the is-invalid CSS class', async () => {
    const fixture = TestBed.createComponent(Form);
    await fixture.whenStable();

    const directive = fixture.debugElement.query(By.directive(FormControlValidation));
    expect(directive).withContext('The directive should be applied to an element with a class form-control').not.toBeNull();

    const lastName = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#lastName')!;
    expect(lastName.classList).not.toContain('is-invalid');

    lastName.value = 'Rainbow';
    lastName.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(lastName.classList).not.toContain('is-invalid');

    lastName.value = '';
    lastName.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(lastName.classList).toContain('is-invalid');

    lastName.value = 'Rainbow';
    lastName.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(lastName.classList).not.toContain('is-invalid');
  });
});
