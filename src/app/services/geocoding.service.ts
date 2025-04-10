import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface GeoCity {
  name: string;
  admin1?: string; 
  country: string;
  latitude: number;
  longitude: number;
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  constructor(private http: HttpClient) {}

  searchCity(query: string): Observable<GeoCity[]> {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=en&format=json`;
    return this.http.get<{ results: any[] }>(url).pipe(
      map(response => {
        return (response.results || []).map(item => ({
          name: item.name,
          admin1: item.admin1,        
          country: item.country,
          latitude: item.latitude,
          longitude: item.longitude
        }));
      })
    );
  }
}
