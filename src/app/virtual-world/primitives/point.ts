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
    } = {},
  ): void {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fill();

    if (selected) {
      ctx.beginPath();
      ctx.lineWidth = VWC.selectionWidth;
      ctx.strokeStyle = VWC.selectionStrokeStyle;
      ctx.arc(this.x, this.y, radius + VWC.selectionDistance, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (hovered) {
      ctx.beginPath();
      ctx.lineWidth = VWC.hoverWidth;
      ctx.strokeStyle = VWC.hoverStrokeStyle;
      ctx.setLineDash(VWC.hoverDash);
      ctx.arc(this.x, this.y, radius + VWC.hoverDistance, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}
