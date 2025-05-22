import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ChartModule } from 'primeng/chart';

import { GeocodingService, GeoCity } from '../services/geocoding.service';
import { WeatherService } from '../services/weather.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, ChartModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent {
  @ViewChild('resultsSection') resultsSection!: ElementRef;

  cityQuery = '';
  suggestions: GeoCity[] = [];
  selectedCity?: GeoCity;

  startDate: string = '';
  endDate: string = '';
  maxDate: string = new Date().toISOString().split('T')[0];

  weatherResults: {
    date: string;
    tempMin: number;
    tempMax: number;
    wind: number;
    sunrise: string;
    sunset: string;
  }[] = [];

  chartData: any = null;

  constructor(
    private geocodingService: GeocodingService,
    private weatherService: WeatherService
  ) {}

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

  async submitForm() {
    this.weatherResults = [];

    if (!this.selectedCity || !this.startDate || !this.endDate) return;

    const current = new Date(this.startDate);
    const end = new Date(this.endDate);
    let scrolled = false;

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      const data = await this.weatherService
        .getHistoricalWeather(
          this.selectedCity.latitude,
          this.selectedCity.longitude,
          dateStr
        )
        .toPromise();

      this.weatherResults.push({
        date: dateStr,
        tempMin: data.daily.temperature_2m_min[0],
        tempMax: data.daily.temperature_2m_max[0],
        wind: data.daily.windspeed_10m_max[0],
        sunrise: data.daily.sunrise[0],
        sunset: data.daily.sunset[0],
      });

      this.chartData = {
        labels: this.weatherResults.map((entry) => entry.date),
        datasets: [
          {
            label: 'Temp Min (°C)',
            data: this.weatherResults.map((entry) => entry.tempMin),
            borderColor: '#00bcd4',
            fill: false,
          },
          {
            label: 'Temp Max (°C)',
            data: this.weatherResults.map((entry) => entry.tempMax),
            borderColor: '#ff5722',
            fill: false,
          },
          {
            label: 'Wind Speed (km/h)',
            data: this.weatherResults.map((entry) => entry.wind),
            borderColor: '#4caf50',
            fill: false,
          },
        ],
      };

      if (!scrolled) {
        scrolled = true;
        setTimeout(() => {
          this.resultsSection?.nativeElement.scrollIntoView({
            behavior: 'smooth',
          });
        }, 50);
      }

      current.setDate(current.getDate() + 1);
    }
  }

  clearForm() {
    this.cityQuery = '';
    this.suggestions = [];
    this.selectedCity = undefined;
    this.startDate = '';
    this.endDate = '';
    this.weatherResults = [];
  }

  formIsValid(): boolean {
    return (
      this.cityQuery.trim().length > 0 &&
      this.selectedCity !== undefined &&
      this.startDate.trim().length > 0 &&
      this.endDate.trim().length > 0 &&
      new Date(this.endDate) >= new Date(this.startDate)
    );
  }

  formIsDirty(): boolean {
    return (
      this.cityQuery.trim().length > 0 ||
      this.startDate.trim().length > 0 ||
      this.endDate.trim().length > 0 ||
      this.selectedCity !== undefined
    );
  }
}
