import { Routes } from '@angular/router';
import { DrawingAreaComponent } from './drawing-area/drawing-area.component';

export const EDITOR_ROUTES: Routes = [
  { path: '', redirectTo: 'drawing-area', pathMatch: 'full' },
  {
    path: 'drawing-area',
    component: DrawingAreaComponent,
  },
];
