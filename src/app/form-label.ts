import { Directive, signal } from '@angular/core';

@Directive({
  selector: 'label[prFormLabel]',
  host: {
    '[class.text-danger]': 'isInvalid()'
  }
})
export class FormLabel {
  /**
   * Est-ce que l'input est invalide
   */
  public readonly isInvalid = signal<boolean | null>(false);
}
