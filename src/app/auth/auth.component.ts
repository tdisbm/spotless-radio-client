import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

function passwordValidator(control: any) {
  const value = control.value || '';
  const hasMinLength = value.length >= 12;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
  if (!hasMinLength && !hasSpecialChar) {
    return { passwordStrength: { notLongEnough: true, missingSpecialChar: true } };
  } else if (!hasMinLength) {
    return { passwordStrength: { notLongEnough: true } };
  } else if (!hasSpecialChar) {
    return { passwordStrength: { missingSpecialChar: true } };
  }
  return null;
}

@Component({
  selector: 'app-auth',
  standalone: true,
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    HttpClientModule,
  ],
})
export class AuthComponent {
  authForm: FormGroup;
  hidePassword = true;
  isSignIn = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  private readonly http: HttpClient = inject(HttpClient);
  private readonly router: Router = inject(Router);

  constructor(private fb: FormBuilder) {
    this.authForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      confirmPassword: [''],
      email: ['', [Validators.required, Validators.email]],
    });

    const token = localStorage.getItem('token');
    if (token) {
      const roles = JSON.parse(localStorage.getItem('roles') || '[]');
      if (roles.includes('ADMIN')) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/radio']);
      }
    }
  }

  onSubmit() {
    this.errorMessage = null;
    this.successMessage = null;

    const { username, password, confirmPassword, email } = this.authForm.value;

    if (!this.isSignIn) {
      if (password !== confirmPassword) {
        this.errorMessage = 'Passwords do not match';
        const passwordErrors = this.authForm.get('password')?.errors;
        if (passwordErrors?.['passwordStrength']) {
          const errors = [];
          if (passwordErrors['passwordStrength']['notLongEnough']) {
            errors.push('Password must be at least 12 characters');
          }
          if (passwordErrors['passwordStrength']['missingSpecialChar']) {
            errors.push('Password must contain a special character (!@#$%^&*(),.?":{}|<>)');
          }
          if (errors.length > 0) {
            this.errorMessage += '. ' + errors.join(' and ');
          }
        }
        return;
      }
      const passwordErrors = this.authForm.get('password')?.errors;
      if (passwordErrors?.['passwordStrength']) {
        const errors = [];
        if (passwordErrors['passwordStrength']['notLongEnough']) {
          errors.push('Password must be at least 12 characters');
        }
        if (passwordErrors['passwordStrength']['missingSpecialChar']) {
          errors.push('Password must contain a special character (!@#$%^&*(),.?":{}|<>)');
        }
        if (errors.length > 0) {
          this.errorMessage = errors.join(' and ');
          return;
        }
      }
    }

    const url = this.isSignIn ? '/auth/sign-in' : '/auth/sign-up';
    const body = this.isSignIn ? { username, password } : { username, password, email };

    console.log('Sending auth request:', { url, body });

    this.http.post(`http://localhost:3000${url}`, body).subscribe({
      next: (response: any) => {
        console.log('Auth response:', response);
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('roles', JSON.stringify(response.roles));
          this.successMessage = 'Authentication successful! Redirecting...';
          setTimeout(() => {
            if (response.roles.includes('ADMIN')) {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/radio']);
            }
          }, 1000);
        } else {
          this.errorMessage = 'Authentication failed: No token received';
        }
      },
      error: (err) => {
        console.error('Authentication error:', err);
        this.errorMessage = err.error?.message || 'Authentication failed';
      },
    });
  }

  toggleAuthMode() {
    this.isSignIn = !this.isSignIn;
    if (this.isSignIn) {
      this.authForm.removeControl('confirmPassword');
      this.authForm.removeControl('email');
      this.authForm.get('password')?.clearValidators();
      this.authForm.get('password')?.setValidators([Validators.required]);
      this.authForm.get('username')?.setValidators([Validators.required]);
    } else {
      this.authForm.addControl('confirmPassword', this.fb.control('', [Validators.required]));
      this.authForm.addControl('email', this.fb.control('', [Validators.required, Validators.email]));
      this.authForm.get('password')?.clearValidators();
      this.authForm.get('password')?.setValidators([Validators.required, passwordValidator]);
    }
    this.authForm.get('password')?.updateValueAndValidity();
    this.authForm.get('username')?.updateValueAndValidity();
  }
}
