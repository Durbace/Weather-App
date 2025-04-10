import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WeatherService } from '../services/weather.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-city-details',
  templateUrl: './city-details.component.html',
  styleUrls: ['./city-details.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class CityDetailsComponent implements OnInit {
  cityName = '';
  latitude = 0;
  longitude = 0;

  temperature?: number;
  windSpeed?: number;
  humidity?: number;
  weatherCode?: number;
  uvIndex?: number;
  precipitation?: number;
  sunrise?: string;
  sunset?: string;

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

  getWeatherIcon(code: number): { icon: string; label: string } {
    const codes: { [key: number]: { icon: string; label: string } } = {
      0: { icon: '☀️', label: 'Clear sky' },
      1: { icon: '🌤️', label: 'Mainly clear' },
      2: { icon: '⛅', label: 'Partly cloudy' },
      3: { icon: '☁️', label: 'Overcast' },
      45: { icon: '🌫️', label: 'Fog' },
      51: { icon: '🌦️', label: 'Drizzle' },
      61: { icon: '🌧️', label: 'Rain' },
      71: { icon: '🌨️', label: 'Snow' },
      95: { icon: '⛈️', label: 'Thunderstorm' },
    };
    return codes[code] || { icon: '❓', label: 'Unknown' };
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
  
}
