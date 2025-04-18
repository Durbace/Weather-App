import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {
  title = 'Weather-App';
  isLoggedIn = false;

  constructor(private router: Router, private auth: Auth) {
    onAuthStateChanged(this.auth, (user) => {
      this.isLoggedIn = !!user;
    });
  }
}
