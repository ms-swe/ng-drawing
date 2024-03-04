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
  @ViewChild('canvas', { static: true })
  canvasElemRef!: ElementRef<HTMLCanvasElement>;

  elementRef = inject(ElementRef);
  ngZone = inject(NgZone);
  renderer2 = inject(Renderer2);
  router = inject(Router);

  ctx!: CanvasRenderingContext2D;

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
    this.onResize();

    const canvas = this.canvasElemRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    this.viewport = new Viewport(canvas, this.ngZone, this.renderer2);

    this.graph = new Graph();
    this.graphEditor = new GraphEditor(
      this.graph,
      this.viewport,
      this.ngZone,
      this.renderer2,
    );

    this.load();

    this.ngZone.runOutsideAngular(() => {
      this.animate();
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.canvasWidth.set(window.innerWidth - 30);
    this.canvasHeight.set(window.innerHeight - 160);
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

  dispose() {
    this.graphEditor?.dispose();
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
