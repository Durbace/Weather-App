import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}


@Injectable({ providedIn: 'root' })
export class CityService {
  private citiesSubject = new BehaviorSubject<City[]>([]);
  cities$ = this.citiesSubject.asObservable();

  private cities: City[] = [];
  private nextId = 1;

  addCity(name: string, latitude: number, longitude: number) {
  if (this.cities.find(c => c.name === name)) return; 
  const newCity = { id: this.nextId++, name, latitude, longitude };
  this.cities.push(newCity);
  this.sync();
}


  updateCity(id: number, newName: string) {
    const city = this.cities.find(c => c.id === id);
    if (city) {
      city.name = newName;
      this.sync();
    }
  }

  deleteCity(id: number) {
    this.cities = this.cities.filter(c => c.id !== id);
    this.sync();
  }

  loadFromStorage(data: City[]) {
    this.cities = data;
    this.nextId = data.length > 0 ? Math.max(...data.map(c => c.id)) + 1 : 1;
    this.citiesSubject.next(this.cities);
  }

  private sync() {
    this.citiesSubject.next(this.cities);
    localStorage.setItem('cities', JSON.stringify(this.cities));
  }
}

