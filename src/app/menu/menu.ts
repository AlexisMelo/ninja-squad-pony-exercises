import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../user-service';
import { DecimalPipe } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, of, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'pr-menu',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu {
  /**
   * Est-ce que la navbar est réduite
   */
  protected readonly navbarCollapsed = signal(true);

  /**
   * Gestion de l'utilisateur
   */
  private userService = inject(UserService);

  /**
   * Utilisateur courant
   */
  protected readonly user = toSignal(
    toObservable(this.userService.currentUser).pipe(
      switchMap(user => {
        if (!user) return of(null);
        return this.userService.scoreUpdates(user.id).pipe(
          startWith(user),
          catchError(() => EMPTY)
        );
      })
    )
  );

  /**
   * Gestion des routes
   */
  private router = inject(Router);

  /**
   * Réduire la navbar
   */
  protected toggleNavbar(): void {
    this.navbarCollapsed.update(isCollapsed => !isCollapsed);
  }

  /**
   * Déconnexion
   */
  public logout() {
    this.userService.logout();
    this.router.navigateByUrl('/');
  }
}
