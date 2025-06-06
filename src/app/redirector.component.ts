import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged } from 'firebase/auth';

@Component({
  selector: 'app-redirector',
  standalone: true,
  template: `<p>Loading...</p>`
})
export class RedirectorComponent {
  private auth = inject(Auth);
  private router = inject(Router);

  constructor() {
    onAuthStateChanged(this.auth, user => {
      if (user) {
        this.router.navigate(['/home']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
