import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { SidebarService } from '../services/sidebar.service';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  visible = false;
  constructor(
    private auth: Auth,
    private router: Router,
    private sidebarService: SidebarService
    ) {
      this.sidebarService.visible$.subscribe(v => (this.visible = v))
    }

  logout() {
    this.auth.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
