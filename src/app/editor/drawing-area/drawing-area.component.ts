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
import { Graph } from '../../virtual-world/math/graph';
import * as VWC from '../../virtual-world/constants';
import { GraphEditor } from '../../virtual-world/graphEditor';
import { Router } from '@angular/router';

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

  canvasWidth = signal(400);
  canvasHeight = signal(300);

  canvasBackgroundColor = VWC.canvasBackgroundColor;
  graph: Graph | undefined;
  graphEditor: GraphEditor | undefined;

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

    this.graph = new Graph();
    this.graphEditor = new GraphEditor(this.graph, mainCanvas, uiCanvas);

    this.onResize();

    this.draw();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.canvasWidth.set(window.innerWidth - 30);
    this.canvasHeight.set(window.innerHeight - 160);
  }

  draw() {
    [this.mainCtx, this.uiCtx].forEach((ctx) =>
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
    );
    this.graphEditor?.draw();

    this.ngZone.runOutsideAngular(() => {
      window.requestAnimationFrame(() => this.draw());
    });
  }

  private addEventListeners() {
    this.ngZone.runOutsideAngular(() => {
      this.eventUnlisteners.push(
        this.renderer2.listen(
          this.uiCanvasElemRef.nativeElement,
          'mousemove',
          (ev) => {
            this.onUiMouseMove(ev);
          },
        ),
      );

      this.eventUnlisteners.push(
        this.renderer2.listen(
          this.uiCanvasElemRef.nativeElement,
          'mousedown',
          (ev) => {
            this.onUiMouseDown(ev);
          },
        ),
      );

      this.eventUnlisteners.push(
        this.renderer2.listen(
          this.uiCanvasElemRef.nativeElement,
          'mouseup',
          () => {
            this.onUiMouseUp();
          },
        ),
      );

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
  }

  onUiMouseMove(ev: MouseEvent) {
    this.graphEditor?.onMouseMove(ev);
  }

  onUiMouseDown(ev: MouseEvent) {
    this.graphEditor?.onMouseDown(ev);
  }

  onUiMouseUp() {
    this.graphEditor?.onMouseUp();
  }

  test() {}

  now(): Date {
    return new Date();
  }
}
