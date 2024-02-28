import { Graph } from './math/graph';
import { getNearestPoint } from './math/utils';
import { Point } from './primitives/point';
import * as VWC from './constants';
import { Segment } from './primitives/segment';

export class GraphEditor {
  graph: Graph;

  mainCanvas: HTMLCanvasElement;
  mainCtx: CanvasRenderingContext2D;
  uiCanvas: HTMLCanvasElement;
  uiCtx: CanvasRenderingContext2D;

  mousePos?: Point;
  selected?: Point;
  hovered?: Point;
  dragging = false;

  constructor(
    graph: Graph,
    mainCanvas: HTMLCanvasElement,
    uiCanvas: HTMLCanvasElement,
  ) {
    this.graph = graph;

    this.mainCanvas = mainCanvas;
    this.mainCtx = mainCanvas.getContext('2d')!;

    this.uiCanvas = uiCanvas;
    this.uiCtx = uiCanvas.getContext('2d')!;
  }

  onMouseMove(ev: MouseEvent) {
    this.mousePos = new Point(ev.offsetX, ev.offsetY);
    this.hovered = getNearestPoint(
      this.mousePos,
      this.graph.points,
      VWC.hoverThreshold,
    );
    if (this.dragging && this.selected) {
      this.selected.x = this.mousePos.x;
      this.selected.y = this.mousePos.y;
    }
  }

  onMouseDown(ev: MouseEvent) {
    if (ev.button == VWC.MouseButtonSecondary) {
      if (this.selected) {
        this.selected = undefined;
      } else if (this.hovered) {
        this.removePoint(this.hovered);
      }
    }
    if (ev.button == VWC.MouseButtonMain) {
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

  draw() {
    this.graph.draw(this.mainCtx);

    this.hovered?.draw(this.uiCtx, { hovered: true });

    if (this.selected) {
      new Segment(this.selected, this.hovered ?? this.mousePos!).draw(
        this.uiCtx,
        { preview: true },
      );
      this.selected?.draw(this.uiCtx, { selected: true });
    }
  }
}
