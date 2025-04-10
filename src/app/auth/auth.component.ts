import {Component, inject} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import {HttpClient, HttpClientModule} from '@angular/common/http';

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
    HttpClientModule
  ]
})
export class AuthComponent {
  authForm: FormGroup;
  hidePassword = true;
  isSignIn = true;

  private readonly http: HttpClient = inject(HttpClient);

  constructor(private fb: FormBuilder) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: [''] // - at sign in
    });
  }

  onSubmit() {
    // if (this.authForm.invalid) return;

    const { email, password, confirmPassword } = this.authForm.value;

    if (!this.isSignIn && password !== confirmPassword) {
      // Sign up!
    } else {
      this.http.post('http://localhost:3000/auth/sign-in', {
        username: email,
        password: password
      }, {
        responseType: 'text'
      }).subscribe({
        next: (authToken) => {
          console.log(authToken);
        },
        error: (b) => {
          console.log(b, 'err');
        }
      });
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
