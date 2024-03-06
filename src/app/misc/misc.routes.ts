import { Routes } from '@angular/router';
import { MiscStuffComponent } from './ui-components/misc-stuff/misc-stuff.component';

export const MISC_ROUTES: Routes = [
  { path: '', redirectTo: 'misc-stuff', pathMatch: 'full' },
  {
    path: 'misc-stuff',
    component: MiscStuffComponent,
  },
];
