import { contentChild, Directive, AfterContentInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { FormLabel } from './form-label';
import { startWith } from 'rxjs';

@Directive({
  selector: '[prFormLabelValidation]'
})
export class FormLabelValidation implements AfterContentInit {
  private readonly ngControl = contentChild(NgControl);

  private readonly label = contentChild(FormLabel);

  ngAfterContentInit() {
    const ngControl = this.ngControl();

    if (!ngControl || !this.label) return;

    ngControl.statusChanges?.pipe(startWith(undefined)).subscribe({
      next: () => {
        const ngControlUpdated = this.ngControl();
        if (!ngControlUpdated) return;
        this.label()?.isInvalid.set(ngControlUpdated.dirty && ngControlUpdated.invalid);
      }
    });
  }
}
