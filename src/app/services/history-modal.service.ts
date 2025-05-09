import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HistoryModalService {
  private visibleSubject = new BehaviorSubject<boolean>(false);
  visible$ = this.visibleSubject.asObservable();

  open() {
    this.visibleSubject.next(true);
  }

  close() {
    this.visibleSubject.next(false);
  }
}
