import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  constructor(private http: HttpClient) {}

  getCurrentWeather(lat: number, lon: number) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relative_humidity_2m,precipitation,uv_index&daily=sunrise,sunset&timezone=auto`;
    return this.http.get<any>(url);
  }

  searchCity(cityName: string) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      cityName
    )}`;
    return this.http.get<any>(url);
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

  getHistoricalWeather(lat: number, lon: number, date: string) {
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&daily=temperature_2m_max,temperature_2m_min,windspeed_10m_max,sunrise,sunset&timezone=auto`;
    return this.http.get<any>(url);
  }
}
