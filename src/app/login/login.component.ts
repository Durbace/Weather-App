import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { onAuthStateChanged, Auth } from '@angular/fire/auth';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';

import { CardModule } from 'primeng/card';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, InputTextModule, PasswordModule, ButtonModule, MessagesModule, MessageModule, CardModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  registeredMessage = false;

  constructor(private auth: AuthService, private router: Router, private afAuth: Auth) {
    const navigation = this.router.getCurrentNavigation();
    this.registeredMessage = !!navigation?.extras?.state?.['registered'];

    onAuthStateChanged(this.afAuth, (user) => {
      if (user) {
        this.router.navigate(['/']);
      }
    });
  }

  onLogin() {
    this.auth.login(this.email, this.password)
      .then(() => this.router.navigate(['/']))
      .catch(err => {
        if (err.code) {
          this.error = 'Wrong email or password, Please try again.';
        }

        setTimeout(() => this.error = '', 15000);
      });
  }
}
