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
  this.chartData = null;

  if (!this.selectedCity || !this.startDate || !this.endDate) return;

  const data = await this.weatherService
    .getHistoricalWeather(
      this.selectedCity.latitude,
      this.selectedCity.longitude,
      this.startDate,
      this.endDate
    )
    .toPromise();

  const days = data.daily.time.length;

  for (let i = 0; i < days; i++) {
    this.weatherResults.push({
      date: data.daily.time[i],
      tempMin: data.daily.temperature_2m_min[i],
      tempMax: data.daily.temperature_2m_max[i],
      wind: data.daily.windspeed_10m_max[i],
      sunrise: data.daily.sunrise[i],
      sunset: data.daily.sunset[i],
    });
  }

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

  setTimeout(() => {
    this.resultsSection?.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }, 50);
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
