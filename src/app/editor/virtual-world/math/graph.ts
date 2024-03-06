import { Point } from '../primitives/point';
import { Segment } from '../primitives/segment';

export class Graph {
  points: Point[] = [];
  segments: Segment[] = [];

  addPoint(p: Point) {
    this.points.push(p);
  }

  containsPoint(point: Point): boolean {
    return this.points.find((p) => p.equals(point)) != undefined;
  }

  tryAddPoint(point: Point): boolean {
    if (!this.containsPoint(point)) {
      this.addPoint(point);
      return true;
    }
    return false;
  }

  removePoint(point: Point) {
    const segmentsWithPoint = this.getSegmentsWithPoint(point);
    segmentsWithPoint.forEach((seg) => this.removeSegment(seg));

    this.points.splice(this.points.indexOf(point), 1);
  }

  addSegment(seg: Segment) {
    this.segments.push(seg);
  }

  containsSegment(seg: Segment): boolean {
    return this.segments.find((s) => s.equals(seg)) != undefined;
  }

  tryAddSegment(seg: Segment) {
    if (!this.containsSegment(seg) && !seg.p1.equals(seg.p2)) {
      this.addSegment(seg);
      return true;
    }
    return false;
  }

  removeSegment(seg: Segment) {
    this.segments.splice(this.segments.indexOf(seg), 1);
  }

  getSegmentsWithPoint(point: Point): Segment[] {
    return this.segments.filter((seg) => seg.includes(point));
  }

  dispose() {
    this.points.length = 0;
    this.segments.length = 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.segments.forEach((s) => s.draw(ctx, false));
    this.points.forEach((p) => p.draw(ctx, false, false));
  }
}
