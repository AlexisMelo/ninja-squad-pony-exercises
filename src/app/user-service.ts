import { effect, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { UserModel } from './models/user.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  /**
   * Client HTTP
   */
  private readonly http = inject(HttpClient);

  /**
   * Utilisateur courant (privé)
   */
  private readonly user = signal<UserModel | undefined>(this.retrieveUser());

  /**
   * Utilisateur courant
   */
  public readonly currentUser = this.user.asReadonly();

  /**
   * Constructeur
   */
  constructor() {
    effect(() => {
      const user = this.user();

      if (user) {
        localStorage.setItem('rememberMe', JSON.stringify(this.user()));
      } else {
        localStorage.removeItem('rememberMe');
      }
    });
  }

  /**
   * Authentification de l'utilisateur
   * @param login
   * @param password
   */
  authenticate(login: string, password: string): Observable<UserModel> {
    return this.http
      .post<UserModel>(environment.baseUrl + '/api/users/authentication', { login, password })
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
    return this.http.post<UserModel>(environment.baseUrl + '/api/users', { login, password, birthYear });
  }

  /**
   * Déconnexion
   */
  logout() {
    this.user.set(undefined);
  }

  /**
   * Récupère l'utilisateur connecté dans le local storage, si il existe
   * @returns
   */
  public retrieveUser() {
    const user = localStorage.getItem('rememberMe');

    if (!user) return;

    const userUnserialized = JSON.parse(user) as UserModel;
    return userUnserialized;
  }
}
