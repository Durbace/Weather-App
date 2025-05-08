import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SearchCityComponent } from '../search-city/search-city.component';
import { SidebarModule } from 'primeng/sidebar';
import { WeatherService } from '../services/weather.service';
import { SidebarService } from '../services/sidebar.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
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
import { firstValueFrom, subscribeOn } from 'rxjs';
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
  cardTitles = [
    'Temperature card',
    'Precipitation (rain + showers + snow)',
    'Precipitation Probability',
    'Visibility',
    'UV index',
    'Apparent Temperature',
  ];

  chartData = {
    labels: [
      '13 Mar',
      '14 Mar',
      '15 Mar',
      '16 Mar',
      '17 Mar',
      '18 Mar',
      '19 Mar',
      '20 Mar',
    ],
    datasets: [
      {
        label: 'Temperature',
        data: [12, 24, 18, 27, 20, 10, 5, 15],
        fill: false,
        borderColor: '#42A5F5',
        tension: 0.35,
      },
    ],
  };

  constructor(
    public sidebarService: SidebarService,
    private route: ActivatedRoute,
    private weatherService: WeatherService,
    private firestore: Firestore,
    private auth: Auth,
    private locationService: LocationService
  ) {}

  async ngOnInit() {
    const location =  await this.locationService.getCityName();
    this.cityName = await this.locationService.getCityName();
    this.countryName = await this.locationService.getCountryName();
    this.route.queryParamMap.subscribe(async (params) => {
      this.latitude = parseFloat(params.get('lat') || '0');
      this.longitude = parseFloat(params.get('lon') || '0');

      const user = await firstValueFrom(authState(this.auth));
      if (!user) return;

      this.weatherService
        .getCurrentWeather(this.latitude, this.longitude)
        .subscribe((data) => {
          const current = data.current_weather;
          this.temperature = Math.round(current.temperature * 10) / 10;
          this.windSpeed = Math.round(current.windspeed * 10) / 10;
          this.weatherCode = current.weathercode;

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
}
