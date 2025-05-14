import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SearchCityComponent } from '../search-city/search-city.component';
import { SidebarModule } from 'primeng/sidebar';

import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { WeatherService } from '../services/weather.service';
import { SidebarService } from '../services/sidebar.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TemperatureUnitService } from '../services/temperature-unit.service';
import {
  Firestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, Observable, subscribeOn } from 'rxjs';
import { LocationService } from '../services/current-location.service';

@Component({
  selector: 'app-weather-home',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    ChartModule,
    SearchCityComponent,
    SidebarModule,
    SearchCityComponent,
    SidebarComponent,
    ProgressSpinnerModule,
  ],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent {
  cityName = 'Loading...';
  countryName = 'Loading...';
  latitude = 0;
  longitude = 0;
  temperature?: number;
  windSpeed?: number;
  humidity?: number;
  uvIndex?: number;
  weatherCode?: number;
  precipitation?: number;
  sunrise?: string;
  sunset?: string;
  isFavorite = false;
  sidebarVisible: boolean = false;
  isHeaderHidden = false;
  isLoading = true;
  isLoadingLocation = true;
  unit$!: Observable<'C' | 'F'>;
  private rawMaxTempsCelsius: number[] = [];
  private rawMinTempsCelsius: number[] = [];
  private rawTemperatureCelsius = 0;

  cardTitles = [
    'Temperature card',
    'Precipitation (rain + showers + snow)',
    'Precipitation Probability',
    'Visibility',
    'UV index',
    'Apparent Temperature',
  ];

  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      fill: boolean;
      borderColor: string;
      tension: number;
    }[];
  } = {
    labels: [],
    datasets: [],
  };

  constructor(
    public sidebarService: SidebarService,
    private route: ActivatedRoute,
    private weatherService: WeatherService,
    private firestore: Firestore,
    private auth: Auth,
    private locationService: LocationService,
    private temperatureUnitService: TemperatureUnitService
  ) {}

  async ngOnInit() {
    const location = await this.locationService.getCityName();
    this.cityName = await this.locationService.getCityName();
    this.countryName = await this.locationService.getCountryName();
    this.isLoadingLocation = false;
    const position = await this.locationService.getCurrentLocation();
    this.latitude = position.coords.latitude;
    this.longitude = position.coords.longitude;
    this.isLoading = false;
    this.unit$ = this.temperatureUnitService.unit$;
    this.unit$.subscribe(() => {
      this.updateConvertedTemperature();
      this.updateChartData();
    });

    const pastDates = this.getPastDates(7);
    const tempLabels: string[] = [];
    const tempValues: number[] = [];
    const minTempValues: number[] = [];

    for (const date of pastDates) {
      const readable = new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
      });
      tempLabels.push(readable);

      const data = await firstValueFrom(
        this.weatherService.getHistoricalWeather(
          this.latitude,
          this.longitude,
          date
        )
      );
      const maxTemp = data.daily.temperature_2m_max[0];
      const minTemp = data.daily.temperature_2m_min[0];
      this.rawMaxTempsCelsius.push(maxTemp);
      this.rawMinTempsCelsius.push(minTemp);
    }

    this.chartData.labels = tempLabels;
    this.updateChartData();

    this.route.queryParamMap.subscribe(async (params) => {
      const user = await firstValueFrom(authState(this.auth));
      if (!user) return;

      this.weatherService
        .getCurrentWeather(this.latitude, this.longitude)
        .subscribe((data) => {
          const current = data.current_weather;
          this.temperature = this.convertTemperature(current.temperature);
          this.windSpeed = Math.round(current.windspeed * 10) / 10;
          this.weatherCode = current.weathercode;
          this.isLoading = false;
          this.rawTemperatureCelsius = current.temperature;
          this.updateConvertedTemperature();

          this.sunrise = new Date(data.daily.sunrise[0]).toLocaleTimeString(
            [],
            {
              hour: '2-digit',
              minute: '2-digit',
            }
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

  async toggleFavorite(): Promise<void> {
    const user = await firstValueFrom(authState(this.auth));
    if (!user) return;

    const favRef = collection(this.firestore, `users/${user.uid}/favorites`);

    if (this.isFavorite) {
      const snapshot = await getDocs(
        query(favRef, where('name', '==', this.cityName))
      );
      snapshot.forEach((docSnap) => {
        const docRef = doc(
          this.firestore,
          `users/${user.uid}/favorites/${docSnap.id}`
        );
        deleteDoc(docRef);
      });
    } else {
      await addDoc(favRef, {
        name: this.cityName,
        latitude: this.latitude,
        longitude: this.longitude,
      });
    }

    this.isFavorite = !this.isFavorite;
  }

  checkIfFavorite(uid: string): void {
    const favRef = collection(this.firestore, `users/${uid}/favorites`);
    getDocs(query(favRef, where('name', '==', this.cityName))).then(
      (snapshot) => {
        this.isFavorite = !snapshot.empty;
      }
    );
  }

  openSidebar() {
    this.sidebarService.toggle();
  }

  getPastDates(days: number): string[] {
    const result: string[] = [];
    const now = new Date();
    for (let i = days; i >= 1; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      result.push(d.toISOString().slice(0, 10));
    }

    return result;
  }

  convertTemperature(tempCelsius: number): number {
    if (this.temperatureUnitService.currentUnit === 'F') {
      return Math.round((tempCelsius * 9) / 5 + 32);
    }
    return Math.round(tempCelsius);
  }

  convertChartTemperatures(values: number[]): number[] {
    return values.map((val) => this.convertTemperature(val));
  }

  updateChartData() {
    const convertedMax = this.convertChartTemperatures(this.rawMaxTempsCelsius);
    const convertedMin = this.convertChartTemperatures(this.rawMinTempsCelsius);

    this.chartData = {
      ...this.chartData,
      datasets: [
        {
          label: 'Max Temperature',
          data: convertedMax,
          fill: false,
          borderColor: '#42A5F5',
          tension: 0.35,
        },
        {
          label: 'Min Temperature',
          data: convertedMin,
          fill: false,
          borderColor: '#FFA726',
          tension: 0.35,
        },
      ],
    };
  }

  updateConvertedTemperature() {
    this.temperature = this.convertTemperature(this.rawTemperatureCelsius);
  }
}
