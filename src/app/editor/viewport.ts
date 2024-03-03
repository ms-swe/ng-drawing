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
  mainCanvas: HTMLCanvasElement;
  uiCanvas: HTMLCanvasElement;

  mainCtx: CanvasRenderingContext2D;
  uiCtx: CanvasRenderingContext2D;

  zoom = 1;
  center: Point;
  offset: Point;
  drag: DragInfo = {
    start: new Point(0, 0),
    end: new Point(0, 0),
    offset: new Point(0, 0),
    active: false,
  };

  eventUnlisteners: (() => void)[] = [];

  constructor(
    mainCanvas: HTMLCanvasElement,
    uiCanvas: HTMLCanvasElement,
    ngZone: NgZone,
    renderer2: Renderer2,
  ) {
    this.mainCanvas = mainCanvas;
    this.uiCanvas = uiCanvas;

    this.mainCtx = mainCanvas.getContext('2d')!;
    this.uiCtx = uiCanvas.getContext('2d')!;

    this.center = new Point(
      this.mainCanvas.width / 2,
      this.mainCanvas.height / 2,
    );
    this.offset = scale(this.center, -1);

    this.addEventListeners(ngZone, renderer2);
  }

  reset() {
    [this.mainCtx, this.uiCtx].forEach((ctx) => {
      ctx.restore();
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.save();
      ctx.translate(this.center.x, this.center.y);
      ctx.scale(1 / this.zoom, 1 / this.zoom);
      const offset = this.getOffset();
      ctx.translate(offset.x, offset.y);
    });
  }

  getMouse(ev: MouseEvent, subtractDragOffset: boolean = false): Point {
    const p = new Point(
      (ev.offsetX - this.center.x) * this.zoom - this.offset.x,
      (ev.offsetY - this.center.y) * this.zoom - this.offset.y,
    );
    return subtractDragOffset ? subtract(p, this.drag.offset) : p;
  }

  getOffset(): Point {
    return add(this.offset, this.drag.offset);
  }

  private addEventListeners(ngZone: NgZone, renderer2: Renderer2) {
    ngZone.runOutsideAngular(() => {
      this.eventUnlisteners.push(
        renderer2.listen(this.uiCanvas, 'mousewheel', (ev) => {
          this.onMouseWheel(ev);
        }),
      );
      this.eventUnlisteners.push(
        renderer2.listen(this.uiCanvas, 'mousedown', (ev) => {
          this.onMouseDown(ev);
        }),
      );
      this.eventUnlisteners.push(
        renderer2.listen(this.uiCanvas, 'mousemove', (ev) => {
          this.onMouseMove(ev);
        }),
      );
      this.eventUnlisteners.push(
        renderer2.listen(this.uiCanvas, 'mouseup', () => {
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
    this.zoom += dir * EDC.zoomStep;
    this.zoom = Math.max(EDC.zoomMin, Math.min(EDC.zoomMax, this.zoom));
  }

  onMouseDown(ev: MouseEvent) {
    if (ev.button == EDC.MouseButtonAux) {
      this.drag.start = this.getMouse(ev);
      this.drag.active = true;
    }
  }

  onMouseMove(ev: MouseEvent) {
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
