
import { Point, GRID_SIZE } from './definitions';

export function snapToGrid(x: number, y: number): Point {
  return {
    x: Math.floor(x / GRID_SIZE) * GRID_SIZE,
    y: Math.floor(y / GRID_SIZE) * GRID_SIZE,
  };
}

export function dist(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function lerp(start: number, end: number, t: number): number {
  return start * (1 - t) + end * t;
}

export function pointInRect(p: Point, r: { x: number, y: number, w: number, h: number }): boolean {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

// Random ID generator
export function uuid(): string {
  return Math.random().toString(36).substr(2, 9);
}
