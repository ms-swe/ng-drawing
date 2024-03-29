import { Point } from './point';
import * as VWC from '../constants';

export class Segment {
  p1: Point;
  p2: Point;

  constructor(p1: Point, p2: Point) {
    this.p1 = p1;
    this.p2 = p2;
  }

  equals(seg: Segment): boolean {
    return this.includes(seg.p1) && this.includes(seg.p2);
  }

  includes(point: Point): boolean {
    return this.p1.equals(point) || this.p2.equals(point);
  }

  draw(
    ctx: CanvasRenderingContext2D,
    preview: false | { previewColor: string; previewDash: number[] },
    { lineWidth = VWC.segmentLineWidth, lineColor = VWC.segmentColor } = {},
  ): void {
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    if (preview) {
      ctx.strokeStyle = preview.previewColor;
      ctx.setLineDash(preview.previewDash);
    } else {
      ctx.strokeStyle = lineColor;
    }
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  toString(): string {
    return this.p1 + '->' + this.p2;
  }
}
