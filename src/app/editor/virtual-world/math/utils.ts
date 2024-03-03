import { Point } from '../primitives/point';

export function getNearestPoint(
  location: Point,
  points: Point[],
  threshold: number = Number.MAX_SAFE_INTEGER,
): Point | undefined {
  let minDist = Number.MAX_SAFE_INTEGER;
  let nearestPoint: Point | undefined;
  points.forEach((point) => {
    const dist = distance(location, point);
    if (dist < minDist && dist < threshold) {
      minDist = dist;
      nearestPoint = point;
    }
  });
  return nearestPoint;
}

export function distance(p1: Point, p2: Point) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

export function add(p1: Point, p2: Point) {
  return new Point(p1.x + p2.x, p1.y + p2.y);
}

export function subtract(p1: Point, p2: Point) {
  return new Point(p1.x - p2.x, p1.y - p2.y);
}

export function scale(p: Point, scaler: number) {
  return new Point(p.x * scaler, p.y * scaler);
}
