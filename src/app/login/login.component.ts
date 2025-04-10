import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; 
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { onAuthStateChanged, Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
      .catch(err => this.error = err.message);
  }
}
