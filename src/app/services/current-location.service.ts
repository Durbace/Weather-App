import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  city: string = '';
  country: string = '';
  constructor(private http: HttpClient) {}

  getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }
  async getCityAndCountry(): Promise<{
    city: string;
    country: string;
    lat: number;
    lon: number;
  }> {
    try {
      const position = await this.getCurrentLocation();
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

      const response: any = await this.http.get(url).toPromise();
      console.log('Reverse geocoding response: ', response);

      const address = response?.address || {};
      const city = address.city || address.town || address.village || 'Unknown';
      const country = address.country || 'Unknown';

      return { city, country, lat, lon };
    } catch (err) {
      console.error('Location error: ', err);
      return { city: 'Unknown', country: 'Unknown', lat: 0, lon: 0 };
    }
  }
}
