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
    selected:
      | false
      | {
          selectionWidth: number;
          selectionDistance: number;
          selectionStrokeStyle: string;
        },
    hovered:
      | false
      | {
          hoverWidth: number;
          hoverDistance: number;
          hoverStrokeStyle: string;
          hoverDash: number[];
        },
    { radius = VWC.pointRadius, color = VWC.pointColor, zoom = 1 } = {},
  ): void {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fill();

    if (selected) {
      ctx.beginPath();
      ctx.lineWidth = selected.selectionWidth * zoom;
      ctx.strokeStyle = selected.selectionStrokeStyle;
      ctx.arc(
        this.x,
        this.y,
        radius + selected.selectionDistance,
        0,
        Math.PI * 2,
      );
      console.log(radius + '/' + selected.selectionDistance); //TODO selectionDistance ist richtig, aber Kreis viel zu groß nach erstmaliger Änderung

      ctx.stroke();
    }

    if (hovered) {
      ctx.beginPath();
      ctx.lineWidth = hovered.hoverWidth * zoom;
      ctx.strokeStyle = hovered.hoverStrokeStyle;
      ctx.setLineDash(hovered.hoverDash);
      ctx.arc(this.x, this.y, radius + hovered.hoverDistance, 0, Math.PI * 2); //TODO wie oben
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  toString(): string {
    return `(${this.x},${this.y})`;
  }
}
