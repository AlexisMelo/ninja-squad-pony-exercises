import { Component, computed, input, output } from '@angular/core';
import { PonyModel } from '../models/pony.model';

@Component({
  selector: 'pr-pony',
  templateUrl: './pony.html',
  styleUrl: './pony.css'
})
export class Pony {
  /**
   * Poney
   */
  readonly ponyModel = input.required<PonyModel>();

  /**
   * Est-ce que le poney est sélectionné
   */
  readonly ponySelected = output<PonyModel>();

  /**
   * Indique si le poney court ou pas
   */
  public readonly isRunning = input<boolean>(false);

  /**
   * Indique si le poney est boosté
   */
  public readonly isBoosted = input<boolean>(false);

  /**
   * URL de l'image du poney
   */
  protected readonly ponyImageUrl = computed(() => {
    const baseUrl = `images/pony-${this.ponyModel().color.toLowerCase()}`;
    if (this.isBoosted()) {
      return `${baseUrl}-rainbow.gif`;
    }
    if (this.isRunning()) {
      return `${baseUrl}-running.gif`;
    }
    return `${baseUrl}.gif`;
  });

  /**
   * Sélectionne le poney
   */
  protected selectPony(): void {
    this.ponySelected.emit(this.ponyModel());
  }
}
