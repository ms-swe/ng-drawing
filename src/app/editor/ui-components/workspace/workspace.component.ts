import { Component } from '@angular/core';
import { DrawingAreaComponent } from '../drawing-area/drawing-area.component';
import { SettingsComponent } from '../settings/settings.component';
import { AngularSplitModule } from 'angular-split';

@Component({
  selector: 'ngdr-workspace',
  standalone: true,
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
  imports: [DrawingAreaComponent, SettingsComponent, AngularSplitModule],
})
export class WorkspaceComponent {}
