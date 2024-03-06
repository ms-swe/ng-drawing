import { Routes } from '@angular/router';
import { DrawingAreaComponent } from './ui-components/drawing-area/drawing-area.component';
import { WorkspaceComponent } from './ui-components/workspace/workspace.component';

export const EDITOR_ROUTES: Routes = [
  { path: '', redirectTo: 'workspace', pathMatch: 'full' },
  {
    path: 'workspace',
    component: WorkspaceComponent,
  },
  {
    path: 'drawing-area',
    component: DrawingAreaComponent,
  },
];
