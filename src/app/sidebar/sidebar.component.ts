import { Component, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Router, RouterModule } from '@angular/router';
import { SidebarService } from '../services/sidebar.service';
import { HistoryModalService } from '../services/history-modal.service';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  userName = 'User';
  showHistoryForm = false;

  constructor(
    private auth: Auth,
    private router: Router,
    private sidebarService: SidebarService,
    private historyModalService: HistoryModalService
  ) {}

  ngOnInit(): void {
    onAuthStateChanged(this.auth, (user: User | null) => {
      if (user?.email) {
        this.userName = user.email.split('@')[0];
      }
    });
  }

  get visible$() {
    return this.sidebarService.visible$;
  }

  logout() {
    this.auth.signOut().then(() => {
      this.router.navigate(['/login']);
    });
    this.closeSidebar();
  }

  closeSidebar() {
    this.sidebarService.hide();
  }

  openHistoryForm() {
    this.historyModalService.open();
    this.closeSidebar();
  }

  closeHistoryForm() {
    this.showHistoryForm = false;
  }
}
