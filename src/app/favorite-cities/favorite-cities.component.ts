import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, interval, Observable, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { WeatherService } from '../services/weather.service';

interface FavoriteCityWeather {
  name: string;
  temperature: number;
  weatherLabel: string;
  icon: string;
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-favorite-cities',
  templateUrl: './favorite-cities.component.html',
  styleUrls: ['./favorite-cities.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class FavoriteCitiesComponent implements OnInit, OnDestroy {
  favoriteCities: FavoriteCityWeather[] = [];
  private stopPolling$ = new Subject<void>();

  constructor(private weatherService: WeatherService, private router: Router) {}

  ngOnInit(): void {
    this.loadFavoriteCities();

    interval(300000)
      .pipe(
        switchMap(() => this.updateWeatherData()),
        takeUntil(this.stopPolling$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.stopPolling$.next();
    this.stopPolling$.complete();
  }

  private loadFavoriteCities(): void {
    const saved = localStorage.getItem('favoriteCities');
    const cityData = saved ? JSON.parse(saved) : [];
  
    const observables = cityData.map((city: any) => {
      return this.weatherService.getCurrentWeather(city.latitude, city.longitude).pipe(
        map(data => {
          const current = data.current_weather;
          const weatherCode = current.weathercode;
          const weather = this.weatherService.getWeatherIcon(weatherCode || 0);
  
          return {
            name: city.name,
            temperature: Math.round(current.temperature),
            weatherLabel: weather.label,
            icon: weather.icon,
            latitude: city.latitude,
            longitude: city.longitude
          };
        })
      );
    });
  
    forkJoin<FavoriteCityWeather[]>(observables).subscribe(results => {
      this.favoriteCities = results;
    });
    
  }
  
  private updateWeatherData(): Observable<void> {
    const weatherObservables = this.favoriteCities.map(city =>
      this.weatherService.getCurrentWeather(city.latitude, city.longitude).pipe(
        map(data => {
          const current = data.current_weather;
          const weatherCode = current.weathercode;
          const weather = this.weatherService.getWeatherIcon(weatherCode || 0);
  
          city.temperature = Math.round(current.temperature);
          city.weatherLabel = weather.label;
          city.icon = weather.icon;
        })
      )
    );
  
    return forkJoin(weatherObservables).pipe(map(() => {}));
  }

  removeCity(cityName: string): void {
    this.favoriteCities = this.favoriteCities.filter(c => c.name !== cityName);
    const saved = localStorage.getItem('favoriteCities');
    const favorites = saved ? JSON.parse(saved) : [];
    const updated = favorites.filter((fav: any) => fav.name !== cityName);
    localStorage.setItem('favoriteCities', JSON.stringify(updated));
  }
  
  goToCity(cityName: string): void {
    this.router.navigate(['/city', cityName]);
  }

}
