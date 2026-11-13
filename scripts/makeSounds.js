// MAKE SOUNDS - generates the soft placeholder sound effects into assets/sounds/ (16-bit mono WAV).
// Run once from the project folder:   node scripts/makeSounds.js
// Every sound is short (< 1 s), quiet and rounded (no harsh noise). Replace the files later with real
// recordings of the same name; the list of names lives in src/shared/utils/sounds.js.

const fs = require('fs');
const path = require('path');

const RATE = 22050;
const OUT = path.join(__dirname, '..', 'assets', 'sounds');

const seconds = (s) => Math.round(s * RATE);
const clamp = (v) => Math.max(-1, Math.min(1, v));

// Soft attack + exponential decay, so no clicks.
function envelope(i, length, attack = 0.01, decay = 4) {
  const t = i / RATE;
  const total = length / RATE;
  const rise = Math.min(1, t / attack);
  const fall = Math.exp((-decay * t) / total);
  const tail = Math.min(1, (total - t) / 0.02);
  return rise * fall * Math.max(0, tail);
}

function tone(length, freqAt, { attack, decay, harmonics = [[1, 1]] } = {}) {
  const out = new Float32Array(length);
  let phase = 0;
  for (let i = 0; i < length; i++) {
    phase += (2 * Math.PI * freqAt(i / length)) / RATE;
    let v = 0;
    harmonics.forEach(([mult, amp]) => {
      v += amp * Math.sin(phase * mult);
    });
    out[i] = v * envelope(i, length, attack, decay);
  }
  return out;
}

function mix(length, parts) {
  const out = new Float32Array(length);
  parts.forEach(({ samples, at = 0, gain = 1 }) => {
    const start = seconds(at);
    for (let i = 0; i < samples.length && start + i < length; i++) out[start + i] += samples[i] * gain;
  });
  return out;
}

function normalize(samples, peak) {
  let max = 0;
  samples.forEach((v) => (max = Math.max(max, Math.abs(v))));
  const k = max > 0 ? peak / max : 1;
  return samples.map((v) => v * k);
}

function writeWav(name, samples, peak = 0.35) {
  const data = normalize(samples, peak);
  const buffer = Buffer.alloc(44 + data.length * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + data.length * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(RATE, 24);
  buffer.writeUInt32LE(RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(data.length * 2, 40);
  data.forEach((v, i) => buffer.writeInt16LE(Math.round(clamp(v) * 32767), 44 + i * 2));
  fs.writeFileSync(path.join(OUT, `${name}.wav`), buffer);
  console.log(`  ${name}.wav  ${(samples.length / RATE).toFixed(2)} s`);
}

// Gentle "breath" noise: white noise through a soft low-pass filter.
function softNoise(length, cutoffAt, gainAt) {
  const out = new Float32Array(length);
  let low = 0;
  for (let i = 0; i < length; i++) {
    const a = cutoffAt(i / length);
    low += a * (Math.random() * 2 - 1 - low);
    out[i] = low * gainAt(i / length);
  }
  return out;
}

const bell = [[1, 1], [2.76, 0.25], [5.4, 0.08]];
const note = (freq, len, decay = 5, harmonics = bell) => tone(seconds(len), () => freq, { attack: 0.005, decay, harmonics });

const SOUNDS = {
  // party popper: a quick rounded "pop" (falling pitch) with a tiny puff of air
  pop: () =>
    mix(seconds(0.32), [
      { samples: tone(seconds(0.14), (p) => 900 - 600 * p, { attack: 0.002, decay: 6, harmonics: [[1, 1], [2, 0.2]] }) },
      { samples: softNoise(seconds(0.12), () => 0.08, (p) => 1 - p), gain: 0.25 },
      { samples: note(1568, 0.18, 6), at: 0.06, gain: 0.25 },
    ]),
  // page slide: a soft rising-then-falling air sweep
  whoosh: () => softNoise(seconds(0.42), (p) => 0.02 + 0.12 * Math.sin(Math.PI * p), (p) => Math.sin(Math.PI * p) ** 2),
  // jump landing: a springy wobble that settles
  boing: () =>
    tone(seconds(0.42), (p) => 260 + 140 * Math.exp(-4 * p) * Math.sin(2 * Math.PI * 9 * p) - 60 * p, {
      attack: 0.004,
      decay: 4,
      harmonics: [[1, 1], [2, 0.15]],
    }),
  // a quick rising chime
  sparkle: () =>
    mix(seconds(0.6), [1318, 1568, 2093, 2637].map((f, i) => ({ samples: note(f, 0.3, 6), at: i * 0.07, gain: 0.8 - i * 0.1 }))),
  // a short rising 3-note fanfare (C5 E5 G5, the last one held)
  tada: () =>
    mix(seconds(0.95), [
      { samples: note(523, 0.22, 3, [[1, 1], [2, 0.3], [3, 0.1]]), at: 0 },
      { samples: note(659, 0.22, 3, [[1, 1], [2, 0.3], [3, 0.1]]), at: 0.16 },
      { samples: note(784, 0.6, 2.5, [[1, 1], [2, 0.3], [3, 0.1]]), at: 0.32 },
      { samples: note(1568, 0.5, 4), at: 0.34, gain: 0.2 },
    ]),
  // one warm bell
  'cheer-bell': () => mix(seconds(0.85), [{ samples: note(880, 0.85, 4) }, { samples: note(1320, 0.6, 5), at: 0.02, gain: 0.3 }]),
};

fs.mkdirSync(OUT, { recursive: true });
console.log(`Writing sounds to ${OUT}`);
Object.entries(SOUNDS).forEach(([name, make]) => writeWav(name, make(), name === 'whoosh' ? 0.2 : 0.35));
