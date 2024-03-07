import { NgZone, Renderer2, signal } from '@angular/core';
import * as EDC from './data/constants';
import { Point } from './virtual-world/primitives/point';
import { add, scale, subtract } from './virtual-world/math/utils';
import { SettingsService } from './data/settings.service';

type DragInfo = {
  start: Point;
  end: Point;
  offset: Point;
  active: boolean;
};

export class Viewport {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  settingsService: SettingsService;

  zoom = signal(1);
  mousePosRaw = new Point(0, 0);
  offset: Point;
  drag: DragInfo = {
    start: new Point(0, 0),
    end: new Point(0, 0),
    offset: new Point(0, 0),
    active: false,
  };

  eventUnlisteners: (() => void)[] = [];

  constructor(
    canvas: HTMLCanvasElement,
    settingsService: SettingsService,
    ngZone: NgZone,
    renderer2: Renderer2,
  ) {
    this.canvas = canvas;
    this.settingsService = settingsService;
    this.ctx = canvas.getContext('2d')!;
    this.offset = new Point(0, 0);

    this.addEventListeners(ngZone, renderer2);
  }

  reset() {
    this.ctx.restore();
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    this.ctx.scale(1 / this.zoom(), 1 / this.zoom());
    const offset = this.getOffset();
    this.ctx.translate(offset.x, offset.y);
  }

  getMouse(ev: MouseEvent, subtractDragOffset: boolean = false): Point {
    const p = new Point(
      ev.offsetX * this.zoom() - this.offset.x,
      ev.offsetY * this.zoom() - this.offset.y,
    );
    return subtractDragOffset ? subtract(p, this.drag.offset) : p;
  }

  getOffset(): Point {
    return add(this.offset, this.drag.offset);
  }

  private addEventListeners(ngZone: NgZone, renderer2: Renderer2) {
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
  }

  deleteEventListeners() {
    this.eventUnlisteners.forEach((func) => func());
  }

  onMouseWheel(ev: WheelEvent) {
    this.changeZoom(Math.sign(ev.deltaY), true);
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

  changeZoom(direction: number, considerMousePos: boolean) {
    let newZoom = this.zoom() + direction * this.settingsService.zoomStep();
    newZoom = Math.max(
      this.settingsService.zoomMin(),
      Math.min(this.settingsService.zoomMax(), newZoom),
    );

    if (considerMousePos) {
      // adjust offset so that the mouse pointer remains on the same part of the canvas' content as before scrolling
      this.offset = add(
        this.offset,
        scale(this.mousePosRaw, newZoom - this.zoom()),
      );
    } else {
      // use canvas center instead
      this.offset = add(
        this.offset,
        scale(
          new Point(this.canvas.width / 2, this.canvas.height / 2),
          newZoom - this.zoom(),
        ),
      );
    }

    this.zoom.set(newZoom);
  }
}
