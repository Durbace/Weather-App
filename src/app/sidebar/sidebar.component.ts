import { Component, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SidebarService } from '../services/sidebar.service';
import { HistoryModalService } from '../services/history-modal.service';
import { TemperatureUnitService } from '../services/temperature-unit.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  userName = 'User';
  showHistoryForm = false;
  unit$!: Observable<'C' | 'F'>;

  constructor(
    private auth: Auth,
    private router: Router,
    private sidebarService: SidebarService,
    private historyModalService: HistoryModalService,
    private temperatureUnitService: TemperatureUnitService
  ) {}

  ngOnInit(): void {
    this.unit$ = this.temperatureUnitService.unit$;

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

  toggleTemperatureUnit() {
    this.temperatureUnitService.toggleUnit();
  }
}
