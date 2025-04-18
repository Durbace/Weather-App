import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { AutoCompleteModule } from 'primeng/autocomplete';
import { CardModule } from 'primeng/card';
import { GeocodingService, GeoCity } from '../services/geocoding.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-city',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    RouterModule,
    CardModule
  ],
  templateUrl: './search-city.component.html',
  styleUrls: ['./search-city.component.scss']
})
export class SearchCityComponent implements OnInit {
  searchControl = new FormControl('');
  suggestions: GeoCity[] = [];

  constructor(private geocodingService: GeocodingService, private router: Router) {}

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term: string | null) => {
        if (term && term.length >= 2) {
          this.geocodingService.searchCity(term).subscribe(data => {
            this.suggestions = data;
          });
        } else {
          this.suggestions = [];
        }
        
      });
  }

  selectCity(city: GeoCity) {
    this.searchControl.setValue(city.name);
    this.suggestions = [];
    this.router.navigate(['/city', city.name], {
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
