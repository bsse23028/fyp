// TRACE MATH - small helpers for the tracing canvas:
//   resample(points)        the road as many evenly spaced points (so the finger can be checked anywhere)
//   pathData(points)        an SVG path ("M x y L x y ...") through the points
//   strokeCue(stroke)       the short word the voice says for a stroke ("Down!", "Round!" ...)
//   arrowsAlong(points)     where the little guide arrows go, and which way they point

import { TRACE } from './traceConfig';

export function resample(points, step = TRACE.STEP) {
  const out = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i - 1];
    const [x2, y2] = points[i];
    const length = Math.hypot(x2 - x1, y2 - y1);
    const count = Math.max(1, Math.round(length / step));
    for (let k = 1; k <= count; k++) out.push([x1 + ((x2 - x1) * k) / count, y1 + ((y2 - y1) * k) / count]);
  }
  return out;
}

export function pathData(points) {
  if (!points || points.length === 0) return '';
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
}

export function strokeCue(stroke) {
  if (stroke.dot) return 'Tap the dot!';
  if (stroke.points.length > 5) return 'Round and round!';
  const [x1, y1] = stroke.points[0];
  const [x2, y2] = stroke.points[1];
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (Math.abs(dy) > Math.abs(dx) * 2) return dy > 0 ? 'Down!' : 'Up!';
  if (Math.abs(dx) > Math.abs(dy) * 2) return 'Across!';
  return dy > 0 ? 'Slide down!' : 'Slide up!';
}

// [{ x, y, angle }] every ARROW_EVERY grid units (skipping the very start and end).
export function arrowsAlong(dense) {
  const arrows = [];
  let travelled = 0;
  for (let i = 1; i < dense.length - 2; i++) {
    const [x1, y1] = dense[i - 1];
    const [x2, y2] = dense[i];
    travelled += Math.hypot(x2 - x1, y2 - y1);
    if (travelled >= TRACE.ARROW_EVERY) {
      travelled = 0;
      arrows.push({ x: x2, y: y2, angle: Math.atan2(y2 - y1, x2 - x1) });
    }
  }
  return arrows;
}

// The two short lines of an arrow head pointing along `angle`.
export function arrowPath({ x, y, angle }, size = TRACE.ARROW_SIZE) {
  const back = angle + Math.PI;
  const a1 = back - 0.6;
  const a2 = back + 0.6;
  return `M${(x + Math.cos(a1) * size).toFixed(2)} ${(y + Math.sin(a1) * size).toFixed(2)} L${x.toFixed(2)} ${y.toFixed(2)} L${(
    x + Math.cos(a2) * size
  ).toFixed(2)} ${(y + Math.sin(a2) * size).toFixed(2)}`;
}
