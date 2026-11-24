// PROGRESS RING - the big "% completed" ring of the Progress page (the app's ProgressRing):
// an SVG arc that is open at the bottom (270°), purple on a pale track.

import { translate } from '../i18n/translate';

export default function ProgressRing({ value = 0, label = 'Completed', detail, size = 190, stroke = 16, sweep = 270 }) {
  const safe = Math.max(0, Math.min(1, value));
  const r = (size - stroke) / 2;
  const c = size / 2;
  const start = 90 + (360 - sweep) / 2; // degrees, 0 = right, going clockwise
  const point = (deg) => {
    const rad = (deg * Math.PI) / 180;
    return [c + r * Math.cos(rad), c + r * Math.sin(rad)];
  };
  const arc = (from, to) => {
    const [x1, y1] = point(from);
    const [x2, y2] = point(to);
    const large = to - from > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };
  const end = start + sweep * Math.max(safe, 0.0001);
  const percent = Math.round(safe * 100);

  return (
    <div className="ring-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${percent}% ${translate(label)}`}>
        <path d={arc(start, start + sweep)} fill="none" stroke="var(--pastel-lilac)" strokeWidth={stroke} strokeLinecap="round" />
        {safe > 0 && <path d={arc(start, end)} fill="none" stroke="var(--purple)" strokeWidth={stroke} strokeLinecap="round" />}
        <text x={c} y={c} textAnchor="middle" dominantBaseline="middle" style={{ font: '900 38px Nunito, sans-serif', fill: 'var(--deep-plum)' }}>
          {percent}%
        </text>
        <text x={c} y={c + 30} textAnchor="middle" style={{ font: '700 13px Inter, sans-serif', fill: 'var(--muted-plum)' }}>
          {translate(label)}
        </text>
      </svg>
      {detail && <p className="ring-text" style={{ fontWeight: 800, fontSize: 18 }}>{detail}</p>}
    </div>
  );
}
