import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'pr-menu',
  imports: [RouterLink],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu {
  protected readonly navbarCollapsed = signal(true);

  protected toggleNavbar(): void {
    this.navbarCollapsed.update(isCollapsed => !isCollapsed);
  }
}
