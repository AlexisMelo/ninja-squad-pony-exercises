import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../user-service';

@Component({
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  /**
   * Gestion de l'utilisateur
   */
  private userService = inject(UserService);

  /**
   * Utilisateur courant
   */
  protected user = this.userService.currentUser;
}
