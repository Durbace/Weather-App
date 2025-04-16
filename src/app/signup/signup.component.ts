import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    CardModule,
    RouterModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  email = '';
  password = '';
  passwordConfirm = '';
  error = '';
  errorMessage = '';

  constructor(private auth: AuthService, private router: Router) { }

  onSignup() {
    if (this.password !== this.passwordConfirm) {
      this.error = 'true';
      this.errorMessage = `<strong>Passwords do not match</strong> Please make sure both fields are identical.`;
      setTimeout(() => this.error = '', 10000);
      return;
    }

    this.auth
      .signup(this.email, this.password)
      .then(() => this.router.navigate(['/login'], { state: { registered: true } }))
      .catch(err => {
        console.error(err.code);

        this.error = 'true';

        switch (err.code) {
          case 'auth/email-already-in-use':
            this.errorMessage = `<strong>Signup Failed</strong> That email is already registered. Try logging in or using another one.`;
            break;

          case 'auth/invalid-email':
            this.errorMessage = `<strong>Invalid Email</strong> Please enter a valid email address.`;
            break;

          case 'auth/weak-password':
            this.errorMessage = `<strong>Weak Password</strong> Your password should be at least 6 characters long.`;
            break;

          case 'auth/missing-password':
            this.errorMessage = `<strong>Missing Password</strong> Please enter a password to create your account.`;
            break;

          default:
            this.errorMessage = `<strong>Signup Failed</strong> ${err.message}`;
        }

        setTimeout(() => this.error = '', 15000);

      });
  }

}
