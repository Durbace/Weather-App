import { Injectable } from '@angular/core';
import * as Cesium from 'cesium';

@Injectable({ providedIn: 'root' })
export class GlobeService {
  initializeViewer(container: HTMLElement): Cesium.Viewer {
    (Cesium as any).buildModuleUrl.setBaseUrl('assets/cesium/');
    const viewer = new Cesium.Viewer(container, {
      baseLayerPicker: false,
      timeline: false,
      animation: false,
    } as any);

    viewer.imageryLayers.removeAll();
    viewer.imageryLayers.addImageryProvider(
      new Cesium.OpenStreetMapImageryProvider({
        url: 'https://tile.openstreetmap.de/',
      })
    );

    return viewer;
  }
}
