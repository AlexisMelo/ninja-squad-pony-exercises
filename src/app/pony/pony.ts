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
  protected readonly ponyImageUrl = computed(() => `images/pony-${this.ponyModel().color.toLowerCase()}.gif`);

  protected selectPony(): void {
    this.ponySelected.emit(this.ponyModel());
  }
}
