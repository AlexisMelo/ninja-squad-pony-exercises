import { Directive, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[formControlName],[ngModel],[prFormControlValidation]',
  host: {
    '[class.is-invalid]': 'isInvalid'
  }
})
export class FormControlValidation {
  /**
   * Référence vers le contrôle ?
   */
  private ngControl = inject(NgControl);

  /**
   * Applique une classe invalide à l'élément
   */
  get isInvalid() {
    return this.ngControl.dirty && this.ngControl.invalid;
  }
}
