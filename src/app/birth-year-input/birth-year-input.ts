import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { FormControlValidation } from '../form-control-validation';

@Component({
  selector: 'pr-birth-year-input',
  imports: [FormControlValidation],
  templateUrl: './birth-year-input.html',
  styleUrl: './birth-year-input.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BirthYearInput),
      multi: true
    },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => BirthYearInput), multi: true }
  ]
})
export class BirthYearInput implements ControlValueAccessor, Validator {
  /**
   * Valeur du champ de saisie
   */
  protected readonly value = signal<number | null>(null);

  /**
   * Année de naissance
   */
  protected readonly year = computed(() => this.computeYear());

  /**
   * Identifiant du champs de saisie
   */
  public readonly inputId = input.required<string>();

  /**
   * Activer/désactiver le champ de saisie
   */
  protected readonly disabled = signal(false);

  /**
   * Calcul de l'année ??
   */
  private computeYear() {
    const value = this.value();

    if (value === null) return null;
    if (value < 0 || value > 100) return this.value();

    const lastTwoDigitsOfTheCurrentYear = new Date().getFullYear() % 100;
    const firstTwoDigitsOfTheCurrentYear = Math.floor(new Date().getFullYear() / 100);

    if (value > lastTwoDigitsOfTheCurrentYear) return (firstTwoDigitsOfTheCurrentYear - 1) * 100 + value;

    return firstTwoDigitsOfTheCurrentYear * 100 + value;
  }

  /**
   * Appelé lors d'un input de date
   */
  protected onBirthYearChange(event: Event) {
    const value = (event.target as HTMLInputElement).valueAsNumber;

    this.value.set(Number.isNaN(value) ? null : value);

    this.onChange(this.computeYear());
  }

  /**
   * Fonction appelée lors du touch
   */
  protected onTouched() {}

  /**
   * Fonction à appeler lors d'un changement de valeur
   * @param _value
   */
  protected onChange(_value: number | null) {}

  /**
   * Change la valeur du signal avec la valeur qu'il reçoit
   * @param value
   */
  writeValue(value: number): void {
    this.value.set(value);
  }

  /**
   * Défini la fonction à appeler lors d'un changement de valeur
   * @param fn
   */
  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  /**
   * Défini la fonction à appeler lors du touch
   * @param fn
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Défini la valeur disabled
   * @param isDisabled
   */
  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  /**
   * Validateur
   * @param control
   */
  validate(control: AbstractControl): ValidationErrors | null {
    if (control.value === null) return null;
    if (control.value < 1900 || control.value > new Date().getFullYear()) return { invalidYear: true };
    return null;
  }
}
