import { Injectable, effect, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private defaultSettings = {
    canvasBackgroundColor: '#20a050',

    zoomStep: 0.1,
    zoomMin: 0.1,
    zoomMax: 10,

    selectionWidth: 2,
    selectionStrokeStyle: '#ffff00',
    selectionDistance: 3,

    hoverThreshold: 10,
    hoverWidth: 2,
    hoverStrokeStyle: '#ffff00',
    hoverDistance: 6,
    hoverDash: [3, 3],

    previewColor: '#ffff00',
    previewDash: [3, 3],
  };

  canvasBackgroundColor = signal(this.defaultSettings.canvasBackgroundColor);

  zoomStep = signal(this.defaultSettings.zoomStep);
  zoomMin = signal(this.defaultSettings.zoomMin);
  zoomMax = signal(this.defaultSettings.zoomMax);

  selectionWidth = signal(this.defaultSettings.selectionWidth);
  selectionStrokeStyle = signal(this.defaultSettings.selectionStrokeStyle);
  selectionDistance = signal(this.defaultSettings.selectionDistance);

  hoverThreshold = signal(this.defaultSettings.hoverThreshold);
  hoverWidth = signal(this.defaultSettings.hoverWidth);
  hoverStrokeStyle = signal(this.defaultSettings.hoverStrokeStyle);
  hoverDistance = signal(this.defaultSettings.hoverDistance);
  hoverDash = signal(this.defaultSettings.hoverDash);

  previewColor = signal(this.defaultSettings.previewColor);
  previewDash = signal(this.defaultSettings.previewDash);

  constructor() {
    effect(() => {
      console.log('sd', this.selectionDistance());
    });
  }
}
