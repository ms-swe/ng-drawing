import { NgZone, Renderer2 } from '@angular/core';
import * as EDC from './constants';
import { Point } from './virtual-world/primitives/point';
import { add, scale, subtract } from './virtual-world/math/utils';

type DragInfo = {
  start: Point;
  end: Point;
  offset: Point;
  active: boolean;
};

export class Viewport {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  zoom = 1;
  mousePosRaw = new Point(0, 0);
  offset: Point;
  drag: DragInfo = {
    start: new Point(0, 0),
    end: new Point(0, 0),
    offset: new Point(0, 0),
    active: false,
  };

  eventUnlisteners: (() => void)[] = [];

  constructor(canvas: HTMLCanvasElement, ngZone: NgZone, renderer2: Renderer2) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.offset = new Point(0, 0);

    this.addEventListeners(ngZone, renderer2);
  }

  reset() {
    this.ctx.restore();
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    this.ctx.scale(1 / this.zoom, 1 / this.zoom);
    const offset = this.getOffset();
    this.ctx.translate(offset.x, offset.y);
  }

  getMouse(ev: MouseEvent, subtractDragOffset: boolean = false): Point {
    const p = new Point(
      ev.offsetX * this.zoom - this.offset.x,
      ev.offsetY * this.zoom - this.offset.y,
    );
    return subtractDragOffset ? subtract(p, this.drag.offset) : p;
  }

  getOffset(): Point {
    return add(this.offset, this.drag.offset);
  }

  private addEventListeners(ngZone: NgZone, renderer2: Renderer2) {
    ngZone.runOutsideAngular(() => {
      this.eventUnlisteners.push(
        renderer2.listen(this.canvas, 'mousewheel', (ev) => {
          this.onMouseWheel(ev);
        }),
      );
      this.eventUnlisteners.push(
        renderer2.listen(this.canvas, 'mousedown', (ev) => {
          this.onMouseDown(ev);
        }),
      );
      this.eventUnlisteners.push(
        renderer2.listen(this.canvas, 'mousemove', (ev) => {
          this.onMouseMove(ev);
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

  onMouseWheel(ev: WheelEvent) {
    const dir = Math.sign(ev.deltaY);
    let newZoom = this.zoom + dir * EDC.zoomStep;
    newZoom = Math.max(EDC.zoomMin, Math.min(EDC.zoomMax, newZoom));

    // adjust offset so that the mouse pointer remains on the same part of the canvas' content as before scrolling
    this.offset = add(
      this.offset,
      scale(this.mousePosRaw, newZoom - this.zoom),
    );

    this.zoom = newZoom;
  }

  onMouseDown(ev: MouseEvent) {
    if (ev.button == EDC.MouseButtonAux) {
      this.drag.start = this.getMouse(ev);
      this.drag.active = true;
    }
  }

  onMouseMove(ev: MouseEvent) {
    this.mousePosRaw = new Point(ev.offsetX, ev.offsetY);

    if (this.drag.active) {
      this.drag.end = this.getMouse(ev);
      this.drag.offset = subtract(this.drag.end, this.drag.start);
    }
  }

  onMouseUp() {
    if (this.drag.active) {
      this.offset = add(this.offset, this.drag.offset);
      this.drag = {
        start: new Point(0, 0),
        end: new Point(0, 0),
        offset: new Point(0, 0),
        active: false,
      };
    }
  }
}
