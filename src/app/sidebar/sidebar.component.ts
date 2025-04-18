import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  constructor(private auth: Auth, private router: Router) {}

  logout() {
    this.auth.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
