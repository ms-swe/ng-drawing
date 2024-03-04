import * as EDC from '../../constants';
import * as VWC from '../constants';

export class Point {
  x = 0;
  y = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  equals(point: Point): boolean {
    return this.x == point.x && this.y == point.y;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    {
      radius = VWC.pointRadius,
      color = VWC.pointColor,
      selected = false,
      hovered = false,
      zoom = 1,
    } = {},
  ): void {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fill();

    if (selected) {
      ctx.beginPath();
      ctx.lineWidth = EDC.selectionWidth * zoom;
      ctx.strokeStyle = EDC.selectionStrokeStyle;
      ctx.arc(this.x, this.y, radius + EDC.selectionDistance, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (hovered) {
      ctx.beginPath();
      ctx.lineWidth = EDC.hoverWidth * zoom;
      ctx.strokeStyle = EDC.hoverStrokeStyle;
      ctx.setLineDash(EDC.hoverDash);
      ctx.arc(this.x, this.y, radius + EDC.hoverDistance, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  toString(): string {
    return `(${this.x},${this.y})`;
  }
}
