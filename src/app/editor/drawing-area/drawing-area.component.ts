import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
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
import { Graph } from '../virtual-world/math/graph';
import * as EDC from '../constants';
import { GraphEditor } from '../virtual-world/graphEditor';
import { Router } from '@angular/router';
import { Viewport } from '../viewport';

@Component({
  selector: 'ngdr-drawing-area',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './drawing-area.component.html',
  styleUrl: './drawing-area.component.scss',
})
export class DrawingAreaComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mainCanvas', { static: true })
  mainCanvasElemRef!: ElementRef<HTMLCanvasElement>;

  @ViewChild('uiCanvas', { static: true })
  uiCanvasElemRef!: ElementRef<HTMLCanvasElement>;

  elementRef = inject(ElementRef);
  ngZone = inject(NgZone);
  renderer2 = inject(Renderer2);
  router = inject(Router);

  mainCtx!: CanvasRenderingContext2D;
  uiCtx!: CanvasRenderingContext2D;

  viewport?: Viewport;

  canvasWidth = signal(400);
  canvasHeight = signal(300);

  canvasBackgroundColor = EDC.canvasBackgroundColor;
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
    const mainCanvas = this.mainCanvasElemRef.nativeElement;
    this.mainCtx = mainCanvas.getContext('2d')!;

    const uiCanvas = this.uiCanvasElemRef.nativeElement;
    this.uiCtx = uiCanvas.getContext('2d')!;

    this.viewport = new Viewport(
      mainCanvas,
      uiCanvas,
      this.ngZone,
      this.renderer2,
    );

    this.graph = new Graph();
    this.graphEditor = new GraphEditor(
      this.graph,
      this.viewport,
      this.ngZone,
      this.renderer2,
    );

    this.onResize();

    this.animate();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.canvasWidth.set(window.innerWidth - 30);
    this.canvasHeight.set(window.innerHeight - 160);
  }

  animate() {
    this.viewport!.reset();
    this.graphEditor?.draw();
    this.ngZone.runOutsideAngular(() => {
      window.requestAnimationFrame(() => this.animate());
    });
  }

  private addEventListeners() {
    this.ngZone.runOutsideAngular(() => {
      this.eventUnlisteners.push(
        this.renderer2.listen(
          this.uiCanvasElemRef.nativeElement,
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

  now(): Date {
    return new Date();
  }
}
