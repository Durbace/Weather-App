import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Cesium from 'cesium';

import { WeatherService } from '../services/weather.service';
import { GlobeService } from '../services/globe.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { SidebarService } from '../services/sidebar.service';

@Component({
  selector: 'app-globe',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './globe.component.html',
  styleUrls: ['./globe.component.scss'],
})
export class GlobeComponent implements AfterViewInit {
  @ViewChild('cesiumContainer', { static: true }) containerRef!: ElementRef;

  private weatherService = inject(WeatherService);
  private globeService = inject(GlobeService);
  public sidebarService = inject(SidebarService);

  showModal = signal(false);
  lat = signal(0);
  lon = signal(0);
  weather = signal<any>(null);
  icon = signal('');
  label = signal('');
  sunrise = signal('');
  sunset = signal('');

  ngAfterViewInit(): void {
    const viewer = this.globeService.initializeViewer(
      this.containerRef.nativeElement
    );

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((movement: any) => {
      const cartesian = viewer.camera.pickEllipsoid(movement.position);
      if (!cartesian) return;

      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const lat = Cesium.Math.toDegrees(cartographic.latitude);
      const lon = Cesium.Math.toDegrees(cartographic.longitude);

      this.lat.set(lat);
      this.lon.set(lon);
      this.weather.set(null);
      this.icon.set('');
      this.label.set('');
      this.showModal.set(true);

      this.weatherService.getCurrentWeather(lat, lon).subscribe({
        next: (data) => {
          const w = data.current_weather;
          this.weather.set(w);
          const { icon, label } = this.weatherService.getWeatherIcon(
            w.weathercode
          );
          this.icon.set(icon);
          this.label.set(label);
          this.sunrise.set(data.daily?.sunrise?.[0] ?? '');
          this.sunset.set(data.daily?.sunset?.[0] ?? '');
        },
        error: () => {
          this.label.set('Failed to load weather');
        },
      });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
}
