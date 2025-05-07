import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { forkJoin, interval, Observable, Subject, firstValueFrom } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  collection,
  getDocs,
  Firestore,
  query,
  where,
  deleteDoc,
  doc,
} from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { WeatherService } from '../services/weather.service';
import { SidebarService } from '../services/sidebar.service';
import { SidebarComponent } from '../sidebar/sidebar.component';

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
  styleUrls: ['./favorite-cities.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    ProgressSpinnerModule,
  ],
})
export class FavoriteCitiesComponent implements OnInit, OnDestroy {
  favoriteCities: FavoriteCityWeather[] = [];
  private stopPolling$ = new Subject<void>();

  private weatherService = inject(WeatherService);
  private router = inject(Router);
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private sidebarService = inject(SidebarService);

  isLoading = true;

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

  openSidebar() {
    this.sidebarService.toggle();
  }

  private async loadFavoriteCities(): Promise<void> {
    const user = await firstValueFrom(authState(this.auth));
    if (!user) {
      this.favoriteCities = [];
      this.isLoading = false;
      return;
    }

    const uid = user.uid;
    const favRef = collection(this.firestore, `users/${uid}/favorites`);
    const snapshot = await getDocs(favRef);

    const cities: any[] = [];
    snapshot.forEach((doc) => cities.push(doc.data()));

    if (cities.length === 0) {
      this.favoriteCities = [];
      this.isLoading = false;
      return;
    }

    const observables = cities.map((city: any) =>
      this.weatherService.getCurrentWeather(city.latitude, city.longitude).pipe(
        map((data) => {
          const current = data.current_weather;
          const weather = this.weatherService.getWeatherIcon(
            current.weathercode || 0
          );

          return {
            name: city.name,
            temperature: Math.round(current.temperature),
            weatherLabel: weather.label,
            icon: weather.icon,
            latitude: city.latitude,
            longitude: city.longitude,
          };
        })
      )
    );

    forkJoin<FavoriteCityWeather[]>(observables).subscribe((results) => {
      this.favoriteCities = results;
      this.isLoading = false;
    });
  }

  private updateWeatherData(): Observable<void> {
    const weatherObservables = this.favoriteCities.map((city) =>
      this.weatherService.getCurrentWeather(city.latitude, city.longitude).pipe(
        map((data) => {
          const current = data.current_weather;
          const weather = this.weatherService.getWeatherIcon(
            current.weathercode || 0
          );
          city.temperature = Math.round(current.temperature);
          city.weatherLabel = weather.label;
          city.icon = weather.icon;
        })
      )
    );

    return forkJoin(weatherObservables).pipe(map(() => {}));
  }

  async removeCity(cityName: string): Promise<void> {
    const user = await firstValueFrom(authState(this.auth));
    if (!user) return;

    const uid = user.uid;
    const favRef = collection(this.firestore, `users/${uid}/favorites`);
    const snapshot = await getDocs(
      query(favRef, where('name', '==', cityName))
    );

    snapshot.forEach((docSnap) => {
      const docRef = doc(
        this.firestore,
        `users/${uid}/favorites/${docSnap.id}`
      );
      deleteDoc(docRef);
    });

    this.favoriteCities = this.favoriteCities.filter(
      (c) => c.name !== cityName
    );
  }

  goToCity(cityName: string): void {
    this.router.navigate(['/city', cityName]);
  }

  get visible$() {
    return this.sidebarService.visible$;
  }
}
