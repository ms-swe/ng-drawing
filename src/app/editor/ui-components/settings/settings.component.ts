import { Component, inject } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { SettingsStore } from '../../data/settings-store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../ui-shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'ngdr-settings',
  standalone: true,
  imports: [
    MatInputModule,
    MatSliderModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  settingsStore = inject(SettingsStore);

  canvasBackgroundColor = this.settingsStore.canvasBackgroundColor;

  private dialog = inject(MatDialog);

  save() {
    this.settingsStore.save();
  }

  reset() {
    const dialogRef = this.dialog.open<
      ConfirmDialogComponent,
      ConfirmDialogData,
      boolean
    >(ConfirmDialogComponent, {
      width: '80%',
      maxWidth: '600px',
      data: {
        dialogTitle: 'Reset all settings',
        confirmationMessage:
          'Do you really want to reset all settings to their default values?',
        confirmationButtonText: 'Reset',
        confirmationButtonColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.settingsStore.reset();
      }
    });
  }
}
