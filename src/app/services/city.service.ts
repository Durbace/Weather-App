import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CityStorageService } from './city-storage.service';

export interface City {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}


@Injectable({ providedIn: 'root' })
export class CityService {
  private citiesSubject = new BehaviorSubject<City[]>([]);
  cities$ = this.citiesSubject.asObservable();

  constructor(private cityStorage: CityStorageService) {
    this.fetchCitiesFromFirebase();
  }

  private fetchCitiesFromFirebase() {
    this.cityStorage.getCities().then((cities: City[]) => {
      this.citiesSubject.next(cities);
    });
  }  

  addCity(name: string, latitude: number, longitude: number) {
    const newCity = { name, latitude, longitude };
    this.cityStorage.addCity(newCity as City);
  }

  deleteCity(id: string) {
    this.cityStorage.deleteCity(id);
  }

  
}
