import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {
  onAuthStateChanged,
  Auth,
  sendPasswordResetEmail,
} from '@angular/fire/auth';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
  isSignup = false;
  email = '';
  password = '';
  fullName = '';
  passwordConfirm = '';
  error = '';
  errorMessage = '';
  registeredMessage = false;
  showPasswordLogin = false;
  showPasswordSignup = false;
  showPasswordConfirm = false;
  resetMessage: string = '';
  resetSuccess: boolean = false;
  isLoading = true;
  loginEmailError = '';
  loginPasswordError = '';

  signupNameError = '';
  signupEmailError = '';
  signupPasswordError = '';
  signupPasswordConfirmError = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private afAuth: Auth
  ) {
    this.route.url.subscribe((segments) => {
      const path = segments[0]?.path || '';
      this.isSignup = path === 'signup';
    });

    const navigation = this.router.getCurrentNavigation();
    this.registeredMessage = !!navigation?.extras?.state?.['registered'];
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  onLogin() {
    this.loginEmailError = '';
    this.loginPasswordError = '';

    let hasError = false;

    if (!this.email.trim()) {
      this.loginEmailError = 'Email is required.';
      hasError = true;
    }

    if (!this.password.trim()) {
      this.loginPasswordError = 'Password is required.';
      hasError = true;
    }

    if (hasError) return;

    this.auth
      .login(this.email, this.password)
      .then(() => this.router.navigate(['/home']))
      .catch(() => {
        this.loginEmailError = 'Wrong email or password.';
        this.loginPasswordError = ' ';
      });
  }

  onSignup() {
    this.signupNameError = '';
    this.signupEmailError = '';
    this.signupPasswordError = '';
    this.signupPasswordConfirmError = '';

    let hasError = false;

    if (!this.fullName.trim()) {
      this.signupNameError = 'Full name is required.';
      hasError = true;
    }

    if (!this.email.trim()) {
      this.signupEmailError = 'Email is required.';
      hasError = true;
    }

    if (!this.password.trim()) {
      this.signupPasswordError = 'Password is required.';
      hasError = true;
    }

    if (!this.passwordConfirm.trim()) {
      this.signupPasswordConfirmError = 'Please confirm your password.';
      hasError = true;
    } else if (this.password !== this.passwordConfirm) {
      this.signupPasswordConfirmError = 'Passwords do not match.';
      hasError = true;
    }

    if (hasError) return;

    this.auth
      .signup(this.email, this.password)
      .then(() => {
        this.isSignup = false;
        this.registeredMessage = true;
        this.email = '';
        this.password = '';
        this.passwordConfirm = '';
      })
      .catch((err) => {
        switch (err.code) {
          case 'auth/email-already-in-use':
            this.signupEmailError = 'This email is already registered.';
            break;
          case 'auth/invalid-email':
            this.signupEmailError = 'Invalid email address.';
            break;
          case 'auth/weak-password':
            this.signupPasswordError =
              'Password must be at least 6 characters.';
            break;
          default:
            this.signupEmailError = 'Signup failed. Try again.';
        }
      });
  }

  resetPassword() {
    if (!this.email) {
      this.resetMessage = 'Please enter your email address.';
      this.resetSuccess = false;
      return;
    }

    this.auth
      .resetPassword(this.email)
      .then(() => {
        this.resetMessage =
          'Password reset email sent! Please check your inbox.';
        this.resetSuccess = true;
      })
      .catch((err) => {
        this.resetMessage = `Error: ${err.message}`;
        this.resetSuccess = false;
      });
  }
}
