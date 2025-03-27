import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

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
    MatIconModule
  ]
})
export class AuthComponent {
  authForm: FormGroup;
  hidePassword = true;
  isSignIn = true;

  constructor(private fb: FormBuilder) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: [''] // - at sign in
    });
  }

  onSubmit() {
    if (this.authForm.invalid) return;

    const { email, password, confirmPassword } = this.authForm.value;

    if (!this.isSignIn && password !== confirmPassword) {
      this.authForm.get('confirmPassword')?.setErrors({ mismatch: true });
      return;
    }

    console.log("Form submitted:", { email, password });
    // backend (API call)
  }

  toggleAuthMode() {
    this.isSignIn = !this.isSignIn;

    if (this.isSignIn) {
      this.authForm.removeControl('confirmPassword');
    } else {
      this.authForm.addControl(
        'confirmPassword',
        this.fb.control('', [Validators.required]) // validare
      );
    }
  }
}
