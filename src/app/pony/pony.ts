import { Component, computed, input, output } from '@angular/core';
import { PonyModel } from '../models/pony.model';

@Component({
  selector: 'pr-pony',
  templateUrl: './pony.html',
  styleUrl: './pony.css'
})
export class Pony {
  readonly ponyModel = input.required<PonyModel>();
  readonly ponySelected = output<PonyModel>();

  /**
   * Indique si le poney court ou pas
   */
  public readonly isRunning = input<boolean>(false);

  /**
   * URL de l'image du poney
   */
  protected readonly ponyImageUrl = computed(() =>
    this.isRunning()
      ? `images/pony-${this.ponyModel().color.toLowerCase()}-running.gif`
      : `images/pony-${this.ponyModel().color.toLowerCase()}.gif`
  );

  /**
   * Sélectionne le poney
   */
  protected selectPony(): void {
    this.ponySelected.emit(this.ponyModel());
  }
}
