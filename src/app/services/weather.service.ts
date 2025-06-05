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
      0: { icon: 'pi pi-sun', label: 'Clear sky' },
      1: { icon: 'pi pi-sun', label: 'Mainly clear' },
      2: { icon: 'pi pi-cloud', label: 'Partly cloudy' },
      3: { icon: 'pi pi-cloud', label: 'Overcast' },
      45: { icon: 'pi pi-cloud', label: 'Fog' },
      51: { icon: 'pi pi-cloud', label: 'Drizzle' },
      61: { icon: 'pi pi-cloud', label: 'Rain' },
      71: { icon: 'pi pi-cloud', label: 'Snow' },
      95: { icon: 'pi pi-bolt', label: 'Thunderstorm' },
    };

    return codes[code] || { icon: 'pi-question-circle', label: 'Unknown' };
  }

 getHistoricalWeather(lat: number, lon: number, start: string, end: string) {
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${start}&end_date=${end}&daily=temperature_2m_max,temperature_2m_min,windspeed_10m_max,sunrise,sunset&timezone=auto`;
  return this.http.get<any>(url);
}

}
