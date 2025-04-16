import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { CardModule } from 'primeng/card';
import { GeocodingService, GeoCity } from '../services/geocoding.service';
import { CityDetailsComponent } from "../city-details/city-details.component";

@Component({
  selector: 'app-search-city',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoCompleteModule, RouterModule, CardModule, CityDetailsComponent],
  templateUrl: './search-city.component.html',
  styleUrls: ['./search-city.component.css']
})
export class SearchCityComponent {
  query: string = '';
  suggestions: GeoCity[] = [];

  constructor(private geocodingService: GeocodingService, private router: Router) {}

  search(term: string) {
    if (term.length >= 2) {
      this.geocodingService.searchCity(term).subscribe(data => {
        this.suggestions = data;
      });
    } else {
      this.suggestions = [];
    }
  }

  selectCity(city: GeoCity): void {
    this.query = city.name;
    this.suggestions = [];
    this.router.navigate(['/home', city.name], {
      queryParams: {
        country: city.country,
        admin1: city.admin1,
        lat: city.latitude,
        lon: city.longitude
      }
    });
  }

  onEnter() {
    if (this.suggestions.length > 0) {
      this.selectCity(this.suggestions[0]);
    }
  }

  onInputFocus() {
    const input = document.getElementById('city') as HTMLInputElement;
    if (input) {
      input.placeholder = '';
    }
  }

  onInputBlur() {
    const input = document.getElementById('city') as HTMLInputElement;
    setTimeout(() => {
      if (input && !input.value) {
        input.placeholder = 'Search here...';
      }
    }, 100); 
  }

  navigateToFavorites() {
    this.router.navigate(['/favorites']);
  }
}

