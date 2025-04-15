import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { WeatherService } from '../services/weather.service';

@Component({
  selector: 'app-city-details',
  templateUrl: './city-details.component.html',
  styleUrls: ['./city-details.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class CityDetailsComponent implements OnInit, OnDestroy {
  cityName = ''; //input
  latitude = 0; //input
  longitude = 0; //input

  temperature?: number;
  windSpeed?: number;
  humidity?: number;
  weatherCode?: number;
  uvIndex?: number;
  precipitation?: number;
  sunrise?: string;
  sunset?: string;

  isFavorite = false;
  weatherDisplay?: { icon: string; label: string };


  constructor(
    private route: ActivatedRoute,
    private weatherService: WeatherService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.cityName = params.get('name') || '';
    });

    this.route.queryParamMap.subscribe((params) => {
      this.latitude = parseFloat(params.get('lat') || '0');
      this.longitude = parseFloat(params.get('lon') || '0');

      this.checkIfFavorite();

      this.weatherService
        .getCurrentWeather(this.latitude, this.longitude)
        .subscribe((data) => {
          const current = data.current_weather;
          this.temperature = Math.round(current.temperature * 10) / 10;
          this.windSpeed = Math.round(current.windspeed * 10) / 10;
          this.weatherCode = current.weathercode;
          this.weatherDisplay = this.weatherService.getWeatherIcon(this.weatherCode || 0);
          if (this.weatherCode !== undefined) {
            this.setBackgroundForWeather(this.weatherCode);
          }

          this.sunrise = new Date(data.daily.sunrise[0]).toLocaleTimeString(
            [],
            { hour: '2-digit', minute: '2-digit' }
          );
          this.sunset = new Date(data.daily.sunset[0]).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          const currentHour = current.time;
          const hourlyTimes: string[] = data.hourly.time;

          let index = hourlyTimes.findIndex((t) => t === currentHour);

          if (index === -1) {
            index = this.getClosestTimeIndex(currentHour, hourlyTimes);
          }

          if (index !== -1) {
            this.humidity = Math.round(data.hourly.relative_humidity_2m[index]);
            this.uvIndex = Math.round(data.hourly.uv_index[index] * 10) / 10;
            this.precipitation =
              Math.round(data.hourly.precipitation[index] * 10) / 10;
          }
        });
    });
  }

  ngOnDestroy(): void {
    document.body.style.backgroundImage = '';
    document.body.style.backgroundColor = '#eaeaea';
  }

  getClosestTimeIndex(targetTime: string, timeArray: string[]): number {
    const target = new Date(targetTime).getTime();
    let minDiff = Number.MAX_SAFE_INTEGER;
    let closestIndex = -1;

    timeArray.forEach((t, i) => {
      const diff = Math.abs(new Date(t).getTime() - target);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    });

    return closestIndex;
  }

  setBackgroundForWeather(code: number): void {
    let image: string | null = null;
  
    const knownCodes = [0, 1, 2, 3, 45, 51, 61, 71, 95];
    if (!knownCodes.includes(code)) {
      document.body.style.backgroundImage = '';
      return;
    }
  
    if (code === 0) image = 'clear.jpg';
    else if (code === 1 || code === 2) image = 'partly-cloudy.jpg';
    else if (code === 3) image = 'cloudy.jpg';
    else if (code >= 45 && code <= 48) image = 'fog.jpg';
    else if (code >= 51 && code <= 67) image = 'drizzle.jpg';
    else if (code >= 61 && code <= 77) image = 'rain.jpg';
    else if (code >= 71 && code <= 86) image = 'snow.jpg';
    else if (code >= 95) image = 'thunderstorm.jpg';
  
    if (image) {
      document.body.style.backgroundImage = `url('/${image}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundPosition = 'center';
    } else {
      document.body.style.backgroundImage = '';
    }
  }
  
  toggleFavorite(): void {
    const saved = localStorage.getItem('favoriteCities');
    let favorites: any[] = saved ? JSON.parse(saved) : [];
  
    favorites = favorites.filter(fav => typeof fav === 'object' && fav.name);
  
    if (this.isFavorite) {
      favorites = favorites.filter(fav => fav.name !== this.cityName);
    } else {
      const alreadyExists = favorites.some(fav => fav.name === this.cityName);
      if (!alreadyExists && this.latitude && this.longitude) {
        favorites.push({
          name: this.cityName,
          latitude: this.latitude,
          longitude: this.longitude,
        });
      }
    }
  
    localStorage.setItem('favoriteCities', JSON.stringify(favorites));
    this.isFavorite = !this.isFavorite;
  }
  
  
  
  checkIfFavorite(): void {
    const saved = localStorage.getItem('favoriteCities');
    const favorites: any[] = saved ? JSON.parse(saved) : [];
    this.isFavorite = favorites.some(fav => 
      typeof fav === 'object' && fav.name === this.cityName
    );
  }
  
  
}
