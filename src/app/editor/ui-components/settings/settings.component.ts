import { Component, inject } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { SettingsService } from '../../data/settings.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ngdr-settings',
  standalone: true,
  imports: [MatInputModule, MatSliderModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  settingsService = inject(SettingsService);

  canvasBackgroundColor = this.settingsService.canvasBackgroundColor;

  zoomStep = this.settingsService.zoomStep;
  zoomMin = this.settingsService.zoomMin;
  zoomMax = this.settingsService.zoomMax;

  selectionWidth = this.settingsService.selectionWidth;
  selectionStrokeStyle = this.settingsService.selectionStrokeStyle;
  selectionDistance = this.settingsService.selectionDistance;

  hoverThreshold = this.settingsService.hoverThreshold;
  hoverWidth = this.settingsService.hoverWidth;
  hoverStrokeStyle = this.settingsService.hoverStrokeStyle;
  hoverDistance = this.settingsService.hoverDistance;

  previewColor = this.settingsService.previewColor;
}
