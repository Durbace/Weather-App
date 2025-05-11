import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

import { HistoryComponent } from './history/history.component';
import { HistoryModalService } from './services/history-modal.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, HistoryComponent],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Weather-App';
  isLoggedIn = false;
  showHistoryForm = false;

  constructor(
    private router: Router,
    private auth: Auth,
    private historyModalService: HistoryModalService
  ) {
    onAuthStateChanged(this.auth, (user) => {
      this.isLoggedIn = !!user;
    });

    this.historyModalService.visible$.subscribe((value) => {
      this.showHistoryForm = value;
    });
  }

  openHistoryForm() {
    this.showHistoryForm = true;
  }

  closeHistoryForm() {
    this.showHistoryForm = false;
  }
}
