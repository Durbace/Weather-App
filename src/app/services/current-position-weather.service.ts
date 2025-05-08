import { Injectable } from "@angular/core";
import { LocationService } from "./current-location.service";
import { WeatherService } from "./weather.service";
@Injectable({
    providedIn: 'root'
})

export class weatherHere {

    temperature?: number;
    windSpeed?: number;
    humidity?: number;
    weatherCode?: number;
    uvIndex?: number;
    precipitation?: number;
    sunrise?: string;
    sunset?: string;

    constructor(
        private locationService: LocationService,
        private weatherService: WeatherService
    ) { }

    async detectPosition(): Promise<{
        lat: number,
        lon: number,
        // temperature: number,
        // windSpeed: number;
        // humidity: number,
        // uvIndex: number,
        // precipitation: number,
        // sunrise: string,
        // sunset: string 
    }> {
        try {
            const position = await this.locationService.getCurrentLocation();
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

            console.log(this.weatherService
                .getCurrentWeather(lat, lon))
                // .subscribe((data) => {
                //     const current = data.current_weather;
                //     this.temperature = Math.round(current.temperature * 10) / 10;
                //     this.windSpeed = Math.round(current.windSpeed * 10) / 10;
                //     this.weatherCode = current.weatherCode;
                //     this.sunrise = new Date(data.daily.sunrise[0]).toLocaleTimeString([], {
                //             hour: '2-digit',
                //             minute: '2-digit'
                //         }
                //     );
                //     this.sunset = new Date(data.daily.sunset[0]).toLocaleTimeString([], {
                //         hour: '2-digit',
                //         minute: '2-digit'
                //     });

                //     const currentHour = current.time;
                //     const hourlyTimes: string[] = data.hourly.time;
                // })
            //const temperature = this.temperature;
            return {
                lat,
                lon
                // temperature,
                // windSpeed,
                // humidity,
                // uvIndex,
                // precipitation,
                // sunrise,
                // sunset
            };

        } catch (err) {
            console.error('Location error (when fetching current location weather): ', err);
            return {
                lat: 0,
                lon: 0
            };
        }
    }


}

/*
unde am in proiect serviciul care bazat pe lat long imi aduce vremea
in niste variable?
*/