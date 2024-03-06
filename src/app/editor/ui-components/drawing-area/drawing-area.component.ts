import {
  AfterViewInit,
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
import { SettingsService } from '../../data/settings.service';
import { MatInputModule } from '@angular/material/input';

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

  canvasWidth = signal(400);
  canvasHeight = signal(300);

  settingsService = inject(SettingsService);

  canvasBackgroundColor = this.settingsService.canvasBackgroundColor;

  graph?: Graph;
  graphEditor?: GraphEditor;

  eventUnlisteners: (() => void)[] = [];

  ngOnInit(): void {
    this.addEventListeners();
  }

  ngOnDestroy() {
    this.deleteEventListeners();
  }

  ngAfterViewInit(): void {
    // this.onResize();
    this.observeResize();

    const canvas = this.canvasElemRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    this.viewport = new Viewport(
      canvas,
      this.settingsService,
      this.ngZone,
      this.renderer2,
    );

    this.graph = new Graph();
    this.graphEditor = new GraphEditor(
      this.graph,
      this.viewport,
      this.settingsService,
      this.ngZone,
      this.renderer2,
    );

    this.load();

    this.ngZone.runOutsideAngular(() => {
      this.animate();
    });
  }

  // @HostListener('window:resize', ['$event'])
  // onResize(): void {
  //   this.canvasWidth.set(window.innerWidth - 30);
  //   this.canvasHeight.set(window.innerHeight - 160);
  // }

  observeResize() {
    // set initial size
    this.canvasWidth.set(window.innerWidth - 40);
    this.canvasHeight.set(window.innerHeight - 165);

    // react on changes of the horizontal slider
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          console.log(entry.contentRect.width);
          console.log(entry.contentRect.height);
          this.canvasWidth.set(entry.contentRect.width - 10);
          this.canvasHeight.set(window.innerHeight - 165);
        }
      }
    });

    resizeObserver.observe(this.innerComponent.nativeElement);
    //TODO need to call unobserve at the end ?
  }

  animate() {
    this.viewport!.reset();
    this.graphEditor?.draw();
    window.requestAnimationFrame(() => this.animate());
  }

  private addEventListeners() {
    this.ngZone.runOutsideAngular(() => {
      this.eventUnlisteners.push(
        this.renderer2.listen(
          this.canvasElemRef.nativeElement,
          'contextmenu',
          (ev) => {
            ev.preventDefault();
          },
        ),
      );
    });
  }

  private deleteEventListeners() {
    this.eventUnlisteners.forEach((func) => func());
    this.graphEditor?.deleteEventListeners();
    this.viewport?.deleteEventListeners();
  }

  test() {}

  zoomIn() {
    this.viewport?.changeZoom(-1, false);
  }

  zoomOut() {
    this.viewport?.changeZoom(1, false);
  }

  zoom() {
    return this.viewport?.zoom;
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
