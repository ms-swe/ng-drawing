import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'editor', pathMatch: 'full' },
  {
    path: 'editor',
    loadChildren: () =>
      import('./editor/editor.routes').then((m) => m.EDITOR_ROUTES),
  },
  {
    path: 'misc',
    loadChildren: () => import('./misc/misc.routes').then((m) => m.MISC_ROUTES),
  },
];
