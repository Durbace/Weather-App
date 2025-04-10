import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

import { CityService, City } from '../services/city.service';
import { GeocodingService, GeoCity } from '../services/geocoding.service';



@Component({
  selector: 'app-city-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    AutoCompleteModule
  ],
  templateUrl: './city-manager.component.html',
  styleUrls: ['./city-manager.component.css']
})
export class CityManagerComponent implements OnInit {
  cities: City[] = [];
  filteredCities: City[] = [];
  cityForm: FormGroup;
  editMode = false;
  selectedCity: City | null = null;
  searchTerm: string = '';
  suggestions: GeoCity[] = [];
  selectedGeoCity: GeoCity | null = null;

  constructor(
    private cityService: CityService,
    private fb: FormBuilder,
    private geocodingService: GeocodingService,
  ) {
    this.cityForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cityService.cities$.subscribe(data => {
      this.cities = data;
      this.filterCities();
    });
  }

  addCity(): void {
    if (this.selectedGeoCity) {
      const name = `${this.selectedGeoCity.name}, ${this.selectedGeoCity.country}`;
      const lat = this.selectedGeoCity.latitude;
      const lon = this.selectedGeoCity.longitude;
      this.cityService.addCity(name, lat, lon); 
      this.selectedGeoCity = null;
    }
  }

  deleteCity(city: City): void {
    this.cityService.deleteCity(city.id);
  }

  filterCities(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredCities = this.cities.filter(city =>
      city.name.toLowerCase().includes(term)
    );
  }

  searchCity(event: any): void {
    const query = event.query;
    if (query && query.length >= 2) {
      this.geocodingService.searchCity(query).subscribe(data => {
        this.suggestions = data;
      });
    }
  }
}
