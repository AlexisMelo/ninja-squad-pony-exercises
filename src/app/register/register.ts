import { Component, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../user-service';
import { BirthYearInput } from '../birth-year-input/birth-year-input';

function passwordMatch(control: AbstractControl<{ password: string; confirmPassword: string }>): ValidationErrors | null {
  return control.value.password === control.value.confirmPassword ? null : { matchingError: true };
}

@Component({
  selector: 'pr-register',
  imports: [ReactiveFormsModule, BirthYearInput],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  /**
   * Gestionnaire de formulaire
   */
  private formBuilder = inject(NonNullableFormBuilder);

  /**
   * Gestion des utilisateurs
   */
  private userService = inject(UserService);

  /**
   * Gestion du routing
   */
  private router = inject(Router);

  /**
   * Gestion de l'échec de l'inscription
   */
  protected readonly registrationFailed = signal(false);

  /**
   * Gestion du formulaire d'inscription
   */
  protected userForm = this.formBuilder.group({
    login: ['', [Validators.required, Validators.minLength(3)]],
    passwordGroup: this.formBuilder.group(
      {
        password: ['', [Validators.required]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: [passwordMatch] }
    ),
    birthYear: [null as number | null, [Validators.required]]
  });

  /**
   * Fonction d'inscription
   */
  register() {
    if (this.userForm.controls.birthYear.value === null) return;

    this.userService
      .register(
        this.userForm.controls.login.value,
        this.userForm.controls.passwordGroup.controls.password.value,
        this.userForm.controls.birthYear.value
      )
      .subscribe({
        next: () => this.router.navigateByUrl('/'),
        error: () => this.registrationFailed.set(true)
      });
  }
}
