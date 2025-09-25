import { booleanAttribute, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'pr-alert',
  imports: [],
  templateUrl: './alert.html',
  styleUrl: './alert.css'
})
export class Alert {
  /**
   * Emet lors de la fermeture
   */
  public closed = output();

  /**
   * Type d'alerte
   */
  public readonly type = input<'warning' | 'success' | 'danger'>('warning');

  /**
   * Classes pour l'alerte
   */
  public readonly alertClasses = computed(() => {
    return `alert alert-${this.type()} ${this.dismissible() ? 'alert-dismissible' : ''}`;
  });

  /**
   * Est-ce qu'on peut fermer l'alerte ?
   */
  public readonly dismissible = input(true, { transform: booleanAttribute });

  /**
   * Gère la fermeture de l'alerte
   */
  closeHandler() {
    this.closed.emit();
  }
}
