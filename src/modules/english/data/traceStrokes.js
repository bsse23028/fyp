// TRACE STROKES - how every letter is written, stroke by stroke, for the tracing screen.
//
// THE GRID: every letter lives in a box 100 wide and 115 tall (x: 0 = left, 100 = right; y: 0 = top).
//   capitals:  top line y 12, bottom line (baseline) y 88
//   small:     tall letters start at y 12, the middle line is y 45, baseline y 88, tails go down to y 110
// A stroke is a list of points the finger follows, in order. Curves are made with arc():
//   arc(centreX, centreY, widthRadius, heightRadius, startAngle, endAngle)
//   angles in degrees: 0 = right, 90 = down, 180 = left, 270 (or -90) = up.
//   Going from a bigger to a smaller angle turns the other way round (like writing a "c").
// `dot: true` = a dot (the child only has to touch it).
// To fix a letter, change its numbers here; the screen redraws itself from this file.

function arc(cx, cy, rx, ry, from, to, step = 8) {
  const points = [];
  const count = Math.max(2, Math.ceil(Math.abs(to - from) / step));
  for (let i = 0; i <= count; i++) {
    const deg = from + ((to - from) * i) / count;
    const rad = (deg * Math.PI) / 180;
    points.push([cx + rx * Math.cos(rad), cy + ry * Math.sin(rad)]);
  }
  return points;
}

const line = (...points) => points; // a straight stroke through these points
const join = (...parts) => parts.flat(); // several pieces drawn as ONE stroke
const dot = (x, y) => ({ points: [[x, y], [x, y + 0.5]], dot: true });

// ---------- capitals ----------
const UPPER = {
  A: [line([50, 12], [18, 88]), line([50, 12], [82, 88]), line([31, 62], [69, 62])],
  B: [
    line([26, 12], [26, 88]),
    join(line([26, 12], [52, 12]), arc(52, 31, 20, 19, -90, 90), line([52, 50], [26, 50])),
    join(line([26, 50], [56, 50]), arc(56, 69, 22, 19, -90, 90), line([56, 88], [26, 88])),
  ],
  C: [arc(52, 50, 32, 38, -40, -320)],
  D: [line([26, 12], [26, 88]), join(line([26, 12], [44, 12]), arc(44, 50, 34, 38, -90, 90), line([44, 88], [26, 88]))],
  E: [line([28, 12], [28, 88]), line([28, 12], [72, 12]), line([28, 50], [64, 50]), line([28, 88], [72, 88])],
  F: [line([30, 12], [30, 88]), line([30, 12], [72, 12]), line([30, 50], [64, 50])],
  G: [arc(52, 50, 32, 38, -40, -335), line([58, 56], [83, 56], [83, 86])],
  H: [line([25, 12], [25, 88]), line([75, 12], [75, 88]), line([25, 50], [75, 50])],
  I: [line([50, 12], [50, 88]), line([32, 12], [68, 12]), line([32, 88], [68, 88])],
  J: [join(line([64, 12], [64, 66]), arc(44, 66, 20, 22, 0, 170)), line([42, 12], [84, 12])],
  K: [line([28, 12], [28, 88]), line([74, 12], [28, 56]), line([42, 44], [76, 88])],
  L: [line([30, 12], [30, 88], [72, 88])],
  M: [line([20, 12], [20, 88]), line([20, 12], [50, 62], [80, 12]), line([80, 12], [80, 88])],
  N: [line([25, 12], [25, 88]), line([25, 12], [75, 88]), line([75, 88], [75, 12])],
  O: [arc(50, 50, 33, 38, -90, -450)],
  P: [line([28, 12], [28, 88]), join(line([28, 12], [52, 12]), arc(52, 32, 22, 20, -90, 90), line([52, 52], [28, 52]))],
  Q: [arc(50, 50, 33, 38, -90, -450), line([58, 68], [84, 94])],
  R: [
    line([28, 12], [28, 88]),
    join(line([28, 12], [52, 12]), arc(52, 32, 22, 20, -90, 90), line([52, 52], [28, 52])),
    line([48, 52], [76, 88]),
  ],
  S: [join(arc(50, 31, 22, 19, -25, -270), arc(50, 69, 24, 19, -90, 155))],
  T: [line([20, 12], [80, 12]), line([50, 12], [50, 88])],
  U: [join(line([25, 12], [25, 62]), arc(50, 62, 25, 26, 180, 0), line([75, 62], [75, 12]))],
  V: [line([20, 12], [50, 88], [80, 12])],
  W: [line([14, 12], [32, 88], [50, 40], [68, 88], [86, 12])],
  X: [line([22, 12], [78, 88]), line([78, 12], [22, 88])],
  Y: [line([22, 12], [50, 50]), line([78, 12], [50, 50], [50, 88])],
  Z: [line([22, 12], [78, 12], [22, 88], [78, 88])],
};

// ---------- small letters ----------
const LOWER = {
  a: [arc(48, 66, 20, 21, -10, -370), line([68, 45], [68, 88])],
  b: [line([30, 12], [30, 88]), arc(50, 66, 20, 21, 180, 540)],
  c: [arc(52, 66, 20, 21, -40, -320)],
  d: [arc(48, 66, 20, 21, -10, -370), line([68, 12], [68, 88])],
  e: [join(line([30, 66], [70, 66]), arc(50, 66, 20, 21, 0, -320))],
  f: [join(arc(56, 26, 13, 13, -30, -180), line([43, 26], [43, 88])), line([28, 47], [60, 47])],
  g: [arc(48, 64, 20, 19, -10, -370), join(line([68, 45], [68, 98]), arc(50, 98, 18, 12, 0, 165))],
  h: [line([30, 12], [30, 88]), join(arc(50, 62, 20, 17, 180, 360), line([70, 62], [70, 88]))],
  i: [line([50, 45], [50, 88]), dot(50, 30)],
  j: [join(line([56, 45], [56, 98]), arc(42, 98, 14, 12, 0, 165)), dot(56, 30)],
  k: [line([30, 12], [30, 88]), line([66, 45], [30, 70]), line([42, 62], [68, 88])],
  l: [line([50, 12], [50, 88])],
  m: [
    line([20, 45], [20, 88]),
    join(arc(35, 61, 15, 15, 180, 360), line([50, 61], [50, 88])),
    join(arc(65, 61, 15, 15, 180, 360), line([80, 61], [80, 88])),
  ],
  n: [line([30, 45], [30, 88]), join(arc(50, 62, 20, 17, 180, 360), line([70, 62], [70, 88]))],
  o: [arc(50, 66, 21, 21, -90, -450)],
  p: [line([30, 45], [30, 110]), arc(50, 66, 20, 21, 180, 540)],
  q: [arc(48, 66, 20, 21, -10, -370), line([68, 45], [68, 110])],
  r: [line([34, 45], [34, 88]), arc(52, 62, 18, 15, 180, 300)],
  s: [join(arc(50, 56, 16, 11, -25, -270), arc(50, 77, 18, 11, -90, 155))],
  t: [line([48, 18], [48, 88]), line([32, 45], [64, 45])],
  u: [join(line([30, 45], [30, 68]), arc(50, 68, 20, 20, 180, 0), line([70, 68], [70, 45])), line([70, 45], [70, 88])],
  v: [line([28, 45], [50, 88], [72, 45])],
  w: [line([16, 45], [32, 88], [50, 58], [68, 88], [84, 45])],
  x: [line([30, 45], [70, 88]), line([70, 45], [30, 88])],
  y: [line([28, 45], [50, 88]), line([72, 45], [38, 110])],
  z: [line([30, 45], [70, 45], [30, 88], [70, 88])],
};

export const TRACE_BOX = { width: 100, height: 115 };

// The strokes of one letter ('A' or 'a'), always as [{ points: [[x, y] ...], dot }].
export function strokesFor(char) {
  const list = UPPER[char] || LOWER[char] || [];
  return list.map((stroke) => (Array.isArray(stroke) ? { points: stroke, dot: false } : stroke));
}
