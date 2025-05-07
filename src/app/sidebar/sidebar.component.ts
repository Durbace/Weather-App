import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { SidebarService } from '../services/sidebar.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, AsyncPipe, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  constructor(
    private auth: Auth,
    private router: Router,
    private sidebarService: SidebarService
  ) { }

  get visible$() {
    return this.sidebarService.visible$;
  }

  logout() {
    this.auth.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }

  closeSidebar() {
    this.sidebarService.hide();
  }
}
