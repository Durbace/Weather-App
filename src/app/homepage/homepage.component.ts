import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SearchCityComponent } from "../search-city/search-city.component";
import { SidebarModule } from 'primeng/sidebar';
import { WeatherService } from '../services/weather.service';
import { SidebarService } from '../services/sidebar.service';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { Firestore, collection, addDoc, deleteDoc, doc, getDocs, query, where } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, subscribeOn } from 'rxjs';

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
    SidebarComponent
  ],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent {
  cityName?: string;
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
  cardTitles = [
    'Temperature card',
    'Precipitation (rain + showers + snow)',
    'Precipitation Probability',
    'Visibility',
    'UV index',
    'Apparent Temperature'
  ];

  chartData = {
    labels: ['13 Mar', '14 Mar', '15 Mar', '16 Mar', '17 Mar', '18 Mar', '19 Mar', '20 Mar'],
    datasets: [
      {
        label: 'Temperature',
        data: [12, 24, 18, 27, 20, 10, 5, 15],
        fill: false,
        borderColor: '#42A5F5',
        tension: 0.35
      }
    ]
  };

  constructor(
    public sidebarService: SidebarService,
    private route: ActivatedRoute,
    private weatherService: WeatherService,
    private firestore: Firestore,
    private auth: Auth
  ) { }

  async ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.cityName = params.get('name') || '';
    });

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

          if (this.weatherCode !== undefined) {
            this.setBackgroundForWeather(this.weatherCode);
          }

          this.sunrise = new Date(data.daily.sunrise[0]).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
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
            this.precipitation = Math.round(data.hourly.precipitation[index] * 10) / 10;
          }
        }
        )
    })
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

  async toggleFavorite(): Promise<void> {
    const user = await firstValueFrom(authState(this.auth));
    if (!user) return;

    const favRef = collection(this.firestore, `users/${user.uid}/favorites`);

    if (this.isFavorite) {
      const snapshot = await getDocs(query(favRef, where('name', '==', this.cityName)));
      snapshot.forEach(docSnap => {
        const docRef = doc(this.firestore, `users/${user.uid}/favorites/${docSnap.id}`);
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
    getDocs(query(favRef, where('name', '==', this.cityName))).then(snapshot => {
      this.isFavorite = !snapshot.empty;
    });
  }

  openSidebar() {
    this.sidebarService.show();
  }
}