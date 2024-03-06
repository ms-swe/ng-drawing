import { Graph } from './math/graph';
import { getNearestPoint } from './math/utils';
import { Point } from './primitives/point';
import * as EDC from '../data/constants';
import { Segment } from './primitives/segment';
import { NgZone, Renderer2 } from '@angular/core';
import { Viewport } from '../viewport';
import { localStorageKeyGraph } from './constants';
import { SettingsService } from '../data/settings.service';

export class GraphEditor {
  graph: Graph;

  viewport: Viewport;

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  mousePos?: Point;
  selected?: Point;
  hovered?: Point;
  dragging = false;

  settingsService: SettingsService;

  eventUnlisteners: (() => void)[] = [];

  constructor(
    graph: Graph,
    viewport: Viewport,
    settingsService: SettingsService,
    ngZone: NgZone,
    renderer2: Renderer2,
  ) {
    this.graph = graph;

    this.viewport = viewport;

    this.settingsService = settingsService;

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
      this.settingsService.hoverThreshold() * this.viewport.zoom,
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

  save() {
    if (this.graph.points.length == 0 && this.graph.segments.length == 0) {
      localStorage.removeItem(localStorageKeyGraph);
      return;
    }
    localStorage.setItem(localStorageKeyGraph, JSON.stringify(this.graph));
  }

  load() {
    try {
      const storedValue = localStorage.getItem(localStorageKeyGraph);
      if (!storedValue) {
        console.log('No graph stored locally');
        return;
      }

      const parsedValue = JSON.parse(storedValue);

      const points: Point[] = parsedValue.points.map(
        (p: Point) => new Point(p.x, p.y),
      );

      const segments: Segment[] = [];
      parsedValue.segments.forEach((s: Segment) => {
        const p1 = points.find((p) => p.equals(s.p1));
        const p2 = points.find((p) => p.equals(s.p2));
        if (p1 && p2) {
          segments.push(new Segment(p1, p2));
        }
      });

      this.graph.points = points;
      this.graph.segments = segments;

      console.log('Locally stored graph loaded');
    } catch (error) {
      console.log('Error loading graph from LocalStorage:', error);
      return;
    }
  }

  dispose() {
    this.graph.dispose();
    this.selected = undefined;
    this.hovered = undefined;
  }

  draw() {
    this.graph.draw(this.ctx);

    this.hovered?.draw(
      this.ctx,
      false,
      {
        hoverWidth: this.settingsService.hoverWidth(),
        hoverDistance: this.settingsService.hoverDistance(),
        hoverStrokeStyle: this.settingsService.hoverStrokeStyle(),
        hoverDash: this.settingsService.hoverDash(),
      },
      {
        zoom: this.viewport.zoom,
      },
    );

    if (this.selected) {
      new Segment(this.selected, this.hovered ?? this.mousePos!).draw(
        this.ctx,
        {
          previewColor: this.settingsService.previewColor(),
          previewDash: this.settingsService.previewDash(),
        },
      );
      this.selected?.draw(
        this.ctx,
        {
          selectionWidth: this.settingsService.selectionWidth(),
          selectionDistance: this.settingsService.selectionDistance(),
          selectionStrokeStyle: this.settingsService.selectionStrokeStyle(),
        },
        false,
        {
          zoom: this.viewport.zoom,
        },
      );
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
