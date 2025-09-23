import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { BirthYearInput } from './birth-year-input';

@Component({
  template: `<form [formGroup]="form">
    <label for="birth-year">Birth year</label>
    <pr-birth-year-input inputId="birth-year" formControlName="birthYear" />
  </form>`,
  imports: [ReactiveFormsModule, BirthYearInput],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class BirthYearInputTest {
  form = inject(NonNullableFormBuilder).group({ birthYear: 1982 as number | null });
}

describe('BirthYearInput', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }]
    });
  });

  it('should display the initial value and update it', async () => {
    const fixture = TestBed.createComponent(BirthYearInputTest);
    await fixture.whenStable();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const input = nativeElement.querySelector('input')!;
    const formattedYear = nativeElement.querySelector<HTMLDivElement>('.formatted-year')!;

    expect(input.value).toBe('1982');
    expect(formattedYear.textContent!.trim()).toBe('1982');

    input.value = '1983';
    input.dispatchEvent(new Event('input'));

    expect(fixture.componentInstance.form.value.birthYear).toBe(1983);
  });

  it('should transform values and validate them', async () => {
    const fixture = TestBed.createComponent(BirthYearInputTest);
    await fixture.whenStable();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const input = nativeElement.querySelector('input')!;
    const formattedYear = nativeElement.querySelector<HTMLDivElement>('.formatted-year')!;

    // negative values are converted to null and should not error
    input.value = '-1982';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(formattedYear.textContent!.trim()).toBe('-1982');
    expect(fixture.componentInstance.form.value.birthYear).toBe(-1982);
    expect(fixture.componentInstance.form.controls.birthYear.errors).toEqual({ invalidYear: true });

    // values less then 1900 are invalid
    input.value = '1882';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(formattedYear.textContent!.trim()).toBe('1882');
    expect(fixture.componentInstance.form.value.birthYear).toBe(1882);
    expect(fixture.componentInstance.form.controls.birthYear.errors).toEqual({ invalidYear: true });

    // values greater than the current year are invalid
    const currentYear = new Date().getFullYear();
    input.value = `${currentYear + 1}`;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(formattedYear.textContent!.trim()).toBe(`${currentYear + 1}`);
    expect(fixture.componentInstance.form.value.birthYear).toBe(currentYear + 1);
    expect(fixture.componentInstance.form.controls.birthYear.errors).toEqual({ invalidYear: true });

    // valid values should not error
    input.value = '1982';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(formattedYear.textContent!.trim()).toBe('1982');
    expect(fixture.componentInstance.form.value.birthYear).toBe(1982);
    expect(fixture.componentInstance.form.controls.birthYear.errors).toBeNull();

    // values greater than 100 are not transformed and errors if less then 1900
    input.value = '101';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(formattedYear.textContent!.trim()).toBe('101');
    expect(fixture.componentInstance.form.value.birthYear).toBe(101);
    expect(fixture.componentInstance.form.controls.birthYear.errors).toEqual({ invalidYear: true });

    // values less than 100 are transformed to the current century
    // if greater than the last two digits of the current year
    const lastTwoDigitsOfTheCurrentYear = new Date().getFullYear() % 100;
    input.value = `${lastTwoDigitsOfTheCurrentYear + 1}`;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    // then it should be a value in the past century
    const computedYearInPastCentury = (Math.floor(new Date().getFullYear() / 100) - 1) * 100 + lastTwoDigitsOfTheCurrentYear + 1;
    expect(formattedYear.textContent!.trim()).toBe(`${computedYearInPastCentury}`);
    expect(fixture.componentInstance.form.value.birthYear).toBe(computedYearInPastCentury);
    expect(fixture.componentInstance.form.controls.birthYear.errors).toBeNull();

    // if less than or equal to the last two digits of the current year
    input.value = `${lastTwoDigitsOfTheCurrentYear}`;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    // then it should be a value in the current century
    const computedYearInCurrentCentury = Math.floor(new Date().getFullYear() / 100) * 100 + lastTwoDigitsOfTheCurrentYear;
    expect(formattedYear.textContent!.trim()).toBe(`${computedYearInCurrentCentury}`);
    expect(fixture.componentInstance.form.value.birthYear).toBe(computedYearInCurrentCentury);
    expect(fixture.componentInstance.form.controls.birthYear.errors).toBeNull();

    // if the value is not a number, it should be null
    input.value = 'invalid';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(formattedYear.textContent!.trim()).toBe('');
    expect(fixture.componentInstance.form.value.birthYear).toBeNull();
    expect(fixture.componentInstance.form.controls.birthYear.errors).toBeNull();
  });

  it('should be disabled if the form control is disabled', async () => {
    const fixture = TestBed.createComponent(BirthYearInputTest);
    await fixture.whenStable();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const input = nativeElement.querySelector('input')!;

    expect(input.disabled).toBe(false);

    fixture.componentInstance.form.controls.birthYear.disable();
    await fixture.whenStable();

    // the input should be disabled if the form control is disabled
    expect(input.disabled).toBe(true);
  });

  it('should call the onTouched callback on blur', async () => {
    const fixture = TestBed.createComponent(BirthYearInputTest);
    await fixture.whenStable();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const input = nativeElement.querySelector('input')!;

    const onTouched = spyOn(fixture.componentInstance.form.controls.birthYear, 'markAsTouched');
    input.dispatchEvent(new Event('blur'));

    // it should have called the onTouched callback on blur
    expect(onTouched).toHaveBeenCalled();
  });
});
