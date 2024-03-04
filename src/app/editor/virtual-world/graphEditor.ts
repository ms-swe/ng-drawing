import { Graph } from './math/graph';
import { getNearestPoint } from './math/utils';
import { Point } from './primitives/point';
import * as EDC from '../constants';
import { Segment } from './primitives/segment';
import { NgZone, Renderer2 } from '@angular/core';
import { Viewport } from '../viewport';

export class GraphEditor {
  graph: Graph;

  viewport: Viewport;

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  mousePos?: Point;
  selected?: Point;
  hovered?: Point;
  dragging = false;

  eventUnlisteners: (() => void)[] = [];

  constructor(
    graph: Graph,
    viewport: Viewport,
    ngZone: NgZone,
    renderer2: Renderer2,
  ) {
    this.graph = graph;

    this.viewport = viewport;

    this.canvas = viewport.canvas;
    this.ctx = this.canvas.getContext('2d')!;

    this.addEventListeners(ngZone, renderer2);
  }

  private addEventListeners(ngZone: NgZone, renderer2: Renderer2) {
    ngZone.runOutsideAngular(() => {
      this.eventUnlisteners.push(
        renderer2.listen(this.canvas, 'mousemove', (ev) => {
          this.onMouseMove(ev);
        }),
      );

      this.eventUnlisteners.push(
        renderer2.listen(this.canvas, 'mousedown', (ev) => {
          this.onMouseDown(ev);
        }),
      );

      this.eventUnlisteners.push(
        renderer2.listen(this.canvas, 'mouseup', () => {
          this.onMouseUp();
        }),
      );
    });
  }

  deleteEventListeners() {
    this.eventUnlisteners.forEach((func) => func());
  }

  onMouseMove(ev: MouseEvent) {
    this.mousePos = this.viewport.getMouse(ev, true);
    this.hovered = getNearestPoint(
      this.mousePos,
      this.graph.points,
      EDC.hoverThreshold * this.viewport.zoom,
    );
    if (this.dragging && this.selected) {
      this.selected.x = this.mousePos.x;
      this.selected.y = this.mousePos.y;
    }
  }

  onMouseDown(ev: MouseEvent) {
    if (ev.button == EDC.MouseButtonSecondary) {
      if (this.selected) {
        this.selected = undefined;
      } else if (this.hovered) {
        this.removePoint(this.hovered);
      }
    }
    if (ev.button == EDC.MouseButtonMain) {
      if (this.hovered) {
        this.selectPoint(this.hovered);
        this.dragging = true;
        return;
      }
      this.graph.addPoint(this.mousePos!);
      this.selectPoint(this.mousePos!);
      this.hovered = this.mousePos;
    }
  }

  onMouseUp() {
    this.dragging = false;
  }

  draw() {
    this.graph.draw(this.ctx);

    this.hovered?.draw(this.ctx, { hovered: true, zoom: this.viewport.zoom });

    if (this.selected) {
      new Segment(this.selected, this.hovered ?? this.mousePos!).draw(
        this.ctx,
        { preview: true },
      );
      this.selected?.draw(this.ctx, {
        selected: true,
        zoom: this.viewport.zoom,
      });
    }
  }

  private selectPoint(point: Point) {
    if (this.selected) {
      this.graph.tryAddSegment(new Segment(this.selected, point));
    }
    this.selected = point;
  }

  private removePoint(point: Point) {
    this.graph.removePoint(point);
    this.hovered = undefined;
    if (this.selected == point) {
      this.selected = undefined;
    }
  }
}
