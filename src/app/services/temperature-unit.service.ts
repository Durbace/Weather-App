import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TemperatureUnitService {
  private _unit = new BehaviorSubject<'C' | 'F'>('C');
  unit$ = this._unit.asObservable();

  toggleUnit() {
    this._unit.next(this._unit.value === 'C' ? 'F' : 'C');
  }

  setUnit(unit: 'C' | 'F') {
    this._unit.next(unit);
  }

  get currentUnit() {
    return this._unit.value;
  }
}
