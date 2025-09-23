import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { UserModel } from './models/user.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  /**
   * Client HTTP
   */
  private readonly http = inject(HttpClient);

  /**
   * Route de l'API
   */
  private readonly apiRoute = 'https://ponyracer.ninja-squad.com';

  /**
   * Utilisateur courant (privé)
   */
  private readonly user = signal<UserModel | undefined>(undefined);

  /**
   * Utilisateur courant
   */
  public readonly currentUser = this.user.asReadonly();

  /**
   * Authentification de l'utilisateur
   * @param login
   * @param password
   */
  authenticate(login: string, password: string): Observable<UserModel> {
    return this.http
      .post<UserModel>(this.apiRoute + '/api/users/authentication', { login, password })
      .pipe(tap(user => this.user.set(user)));
  }

  /**
   * Inscrire un utilisateur
   * @param login
   * @param password
   * @param birthYear
   * @returns
   */
  register(login: string, password: string, birthYear: number): Observable<UserModel> {
    return this.http.post<UserModel>(this.apiRoute + '/api/users', { login, password, birthYear });
  }

  /**
   * Déconnexion
   */
  logout() {
    this.user.set(undefined);
  }
}
