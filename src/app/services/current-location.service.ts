import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})

export class LocationService {
    city: string = '';
    country: string = '';
    constructor(private http: HttpClient) { }

    getCurrentLocation(): Promise<GeolocationPosition> {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    }
    async getCityName(): Promise<string> {
        try {
            const position = await this.getCurrentLocation();
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

            const response: any = await this.http.get(url).toPromise();
            console.log('Reverse geocoding response: ', response);
            const address = response?.address
            if (address) {
                this.city = response.address.city;
            } else {
                this.city = 'Unknown';
            }
            return this.city;
        } catch (err) {
            console.error('Location error: ', err);
            return 'Unknown';
        }
    }

    async getCountryName(): Promise<string> {
        try {
            const position = await this.getCurrentLocation();
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

            const response: any = await this.http.get(url).toPromise();
            console.log('Reverse geocoding response: ', response);
            const address = response?.address
            if (address) {
                this.country = response.address.country;
            } else {
                this.country = 'Unknown';
            }
            return this.country;
        } catch (err) {
            console.error('Location error: ', err);
            return 'Unknown';
        }
    }
}