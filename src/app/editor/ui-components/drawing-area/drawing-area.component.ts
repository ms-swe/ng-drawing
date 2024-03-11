import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { Graph } from '../../virtual-world/math/graph';
import { GraphEditor } from '../../virtual-world/graphEditor';
import { Router } from '@angular/router';
import { Viewport } from '../../viewport';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../../ui-shared/delete-dialog/delete-dialog.component';
import { MatInputModule } from '@angular/material/input';
import { SettingsStore } from '../../data/settings-store';

@Component({
  selector: 'ngdr-drawing-area',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './drawing-area.component.html',
  styleUrl: './drawing-area.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawingAreaComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('innerComponent', { static: true }) innerComponent!: ElementRef;

  @ViewChild('canvas', { static: true })
  canvasElemRef!: ElementRef<HTMLCanvasElement>;

  elementRef = inject(ElementRef);
  ngZone = inject(NgZone);
  renderer2 = inject(Renderer2);
  router = inject(Router);
  private dialog = inject(MatDialog);

  ctx!: CanvasRenderingContext2D;

  viewport?: Viewport;

  zoom = signal(0);

  canvasWidth = signal(400);
  canvasHeight = signal(300);

  settingsStore = inject(SettingsStore);

  graph?: Graph;
  graphEditor?: GraphEditor;

  eventUnlisteners: (() => void)[] = [];
  resizeObserver?: ResizeObserver;

  ngOnInit(): void {
    this.addEventListeners();
  }

  ngOnDestroy() {
    this.cleanUpListenersAndObservers();
  }

  ngAfterViewInit(): void {
    this.observeResize();

    const canvas = this.canvasElemRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    this.viewport = new Viewport(
      canvas,
      this.settingsStore.zoom,
      this.ngZone,
      this.renderer2,
    );

    this.zoom = this.viewport.zoom;

    this.graph = new Graph();
    this.graphEditor = new GraphEditor(
      this.graph,
      this.viewport,
      this.settingsStore.selection,
      this.settingsStore.hover,
      this.settingsStore.preview,
      this.ngZone,
      this.renderer2,
    );

    this.load();

    this.animate();
  }

  observeResize() {
    // set initial size
    this.canvasWidth.set(window.innerWidth - 40);
    this.canvasHeight.set(window.innerHeight - 165);

    // react on changes of the horizontal slider
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          this.canvasWidth.set(entry.contentRect.width - 10);
          this.canvasHeight.set(window.innerHeight - 165);
        }
      }
    });

    this.resizeObserver.observe(this.innerComponent.nativeElement);
  }

  animate() {
    this.viewport!.reset();
    this.graphEditor?.draw();
    window.requestAnimationFrame(() => this.animate());
  }

  private addEventListeners() {
    this.eventUnlisteners.push(
      this.renderer2.listen(
        this.canvasElemRef.nativeElement,
        'contextmenu',
        (ev) => {
          ev.preventDefault();
        },
      ),
    );
  }

  private cleanUpListenersAndObservers() {
    this.eventUnlisteners.forEach((func) => func());
    this.graphEditor?.deleteEventListeners();
    this.viewport?.deleteEventListeners();

    this.resizeObserver?.disconnect();
  }

  test() {}

  zoomIn() {
    this.viewport?.changeZoom(-1, false);
  }

  zoomOut() {
    this.viewport?.changeZoom(1, false);
  }

  dispose() {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '80%',
      maxWidth: '600px',
      data: { itemToDeleteName: 'the complete graph' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.graphEditor?.dispose();
      }
    });
  }

  save() {
    this.graphEditor?.save();
  }

  load() {
    this.graphEditor?.load();
  }

  now(): Date {
    return new Date();
  }
}
