import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoryModalService } from '../services/history-modal.service';
import { GeocodingService, GeoCity } from '../services/geocoding.service';
import { WeatherService } from '../services/weather.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent {
  selectedDate: string = '';
  selectedType: string = 'daily';
  cityQuery = '';
  suggestions: GeoCity[] = [];
  selectedCity?: GeoCity;
  weatherDetails: any = null;
  maxDate: string = new Date().toISOString().split('T')[0];

  constructor(
    private historyModalService: HistoryModalService,
    private geocodingService: GeocodingService,
    private weatherService: WeatherService
  ) {}

  closeModal() {
    this.historyModalService.close();
  }

  onCityInput() {
    if (this.cityQuery.length > 2) {
      this.geocodingService.searchCity(this.cityQuery).subscribe((results) => {
        this.suggestions = results;
      });
    } else {
      this.suggestions = [];
    }
  }

  selectCity(city: GeoCity) {
    this.selectedCity = city;
    this.cityQuery = `${city.name}, ${city.admin1 || ''}, ${city.country}`;
    this.suggestions = [];
  }

  submitForm() {
    if (this.selectedCity && this.selectedDate) {
      const { latitude, longitude } = this.selectedCity;

      this.weatherService
        .getHistoricalWeather(latitude, longitude, this.selectedDate)
        .subscribe((data) => {
          this.weatherDetails = data;
        });
    }
  }
}
