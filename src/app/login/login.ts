import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../user-service';
import { Router } from '@angular/router';

@Component({
  selector: 'pr-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  /**
   * Formbuilder
   */
  private formBuilder = inject(NonNullableFormBuilder);

  /**
   * Gestion des utilisateurs
   */
  private userService = inject(UserService);

  /**
   * Routeur
   */
  private router = inject(Router);

  /**
   * Est-ce que l'authentification a réussi ?
   */
  protected readonly authenticationFailed = signal(false);

  /**
   * Formulaire de connexion
   */
  protected formGroup = this.formBuilder.group({
    login: ['', Validators.required],
    password: ['', Validators.required]
  });

  /**
   * Authentification
   */
  authenticate() {
    this.userService.authenticate(this.formGroup.controls.login.value, this.formGroup.controls.password.value).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.authenticationFailed.set(true)
    });
  }
}
