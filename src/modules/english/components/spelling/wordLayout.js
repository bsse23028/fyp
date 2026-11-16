// WORD LAYOUT - the maths of the spelling game (no drawing here). It works for any size of the game area,
// tall (portrait) or wide (landscape); the boards run it again whenever the size changes.
//   measureWord     the size of a word made of letter pictures (in canvas pixels)
//   layoutWord      where each placeholder letter of the big word sits, and how big the letters are
//   layoutSentence  where each word of the sentence sits (it wraps onto more rows when needed)
//   touchBox        the size of a loose piece's touch area (its shape + a little extra)
//   scatterPieces   a random spot for every loose piece, never on top of the word / sentence
// Every letter picture is a 512 x 512 canvas; `art.x / y / width / height` say where the letter sits on it.
// All letters of one word or sentence use ONE scale, so they keep the same font size and stand on one line.

import { LETTER_ART, LETTER_BASELINE } from '../../data/letterImages';
import { shuffle } from '../../data/alphabetData';
import { SPELLING } from './spellingConfig';

const random = (min, max) => min + Math.random() * (max - min);

// A word in canvas pixels: { width, top, bottom, letters: [{ char, x }] } (x = left edge of each letter).
export function measureWord(text) {
  const gap = SPELLING.WORD_LETTER_GAP;
  let cursor = 0;
  let top = Infinity;
  let bottom = 0;
  const letters = text.split('').map((char) => {
    const art = LETTER_ART[char];
    const x = cursor;
    cursor += art.width + gap;
    top = Math.min(top, art.y);
    bottom = Math.max(bottom, art.y + art.height);
    return { char, x };
  });
  return { width: cursor - gap, top, bottom, letters };
}

// The big word. Returns { scale, left, right, top, bottom, slots: [{ x, y, width, height, cx, cy }] } in points.
export function layoutWord(text, areaWidth, areaHeight) {
  const word = measureWord(text);
  // The whole word is scaled to fit the width, and it may not be taller than a part of the area
  // (that keeps room for the loose letters on a wide, low screen).
  const scale = Math.min(
    SPELLING.MAX_LETTER_SCALE,
    (areaWidth - SPELLING.WORD_SIDE_PADDING * 2) / word.width,
    (areaHeight * SPELLING.WORD_MAX_HEIGHT) / (word.bottom - word.top)
  );
  const wordWidth = word.width * scale;
  const wordHeight = (word.bottom - word.top) * scale;
  const left = (areaWidth - wordWidth) / 2;
  const top = (areaHeight - wordHeight) * SPELLING.WORD_CENTER;

  const slots = word.letters.map(({ char, x: canvasX }) => {
    const art = LETTER_ART[char];
    const x = left + canvasX * scale;
    const y = top + (art.y - word.top) * scale;
    const width = art.width * scale;
    const height = art.height * scale;
    return { x, y, width, height, cx: x + width / 2, cy: y + height / 2 };
  });

  return { scale, left, right: left + wordWidth, top, bottom: top + wordHeight, slots };
}

// The sentence: words = ['I', 'like', 'the', 'cake'] (no full stop; the dot is added after the last word).
// It starts at the top of the area, is centred, and wraps onto more rows when a row is full.
// Returns { scale, top, bottom, words: [{ x, y, width, height, cx, cy }], dot: { x, y, size } } in points.
export function layoutSentence(words, areaWidth, areaHeight) {
  const sizes = words.map(measureWord);
  const lineTop = Math.min(...sizes.map((w) => w.top));
  const lineBottom = Math.max(...sizes.map((w) => w.bottom));
  const room = areaWidth - SPELLING.WORD_SIDE_PADDING * 2;
  const widest = Math.max(...sizes.map((w) => w.width)) + SPELLING.SENTENCE_DOT * 2;
  let scale = Math.min(SPELLING.SENTENCE_MAX_SCALE, room / widest);

  let rows = [];
  let lineHeight = 0;
  // Make the letters a little smaller until there are not too many rows and they are not too tall.
  for (let tries = 0; tries < 12; tries++) {
    rows = [[]];
    let rowWidth = 0;
    sizes.forEach((size, index) => {
      const width = size.width * scale;
      const space = rowWidth > 0 ? SPELLING.SENTENCE_SPACE * scale : 0;
      if (rowWidth > 0 && rowWidth + space + width > room) {
        rows.push([]);
        rowWidth = 0;
      }
      rows[rows.length - 1].push(index);
      rowWidth += (rowWidth > 0 ? SPELLING.SENTENCE_SPACE * scale : 0) + width;
    });
    lineHeight = (lineBottom - lineTop) * scale + SPELLING.SENTENCE_ROW_GAP;
    const fitsHeight = rows.length * lineHeight <= areaHeight * SPELLING.SENTENCE_MAX_HEIGHT;
    if (fitsHeight && rows.length <= SPELLING.SENTENCE_MAX_ROWS) break;
    scale *= 0.92;
  }

  const top = SPELLING.SENTENCE_TOP;
  const places = [];
  rows.forEach((row, rowIndex) => {
    const space = SPELLING.SENTENCE_SPACE * scale;
    const rowWidth = row.reduce((sum, index) => sum + sizes[index].width * scale, 0) + space * (row.length - 1);
    let x = (areaWidth - rowWidth) / 2;
    row.forEach((index) => {
      const size = sizes[index];
      const width = size.width * scale;
      const height = (size.bottom - size.top) * scale;
      const y = top + rowIndex * lineHeight + (size.top - lineTop) * scale;
      places[index] = { x, y, width, height, cx: x + width / 2, cy: y + height / 2 };
      x += width + space;
    });
  });

  // The full stop: a small dot standing on the writing line after the last word.
  const last = places[places.length - 1];
  const dotSize = SPELLING.SENTENCE_DOT * scale;
  const baseline = top + (rows.length - 1) * lineHeight + (LETTER_BASELINE - lineTop) * scale;
  const dot = { x: last.x + last.width + dotSize * 0.4, y: baseline - dotSize, size: dotSize };

  return { scale, top, bottom: top + rows.length * lineHeight, words: places, dot };
}

// The touch area of a loose piece: its shape plus TOUCH_EXTRA, and never smaller than MIN_TOUCH.
export function touchBox(shapeWidth, shapeHeight) {
  const width = Math.max(shapeWidth * (1 + SPELLING.TOUCH_EXTRA), SPELLING.MIN_TOUCH);
  const height = Math.max(shapeHeight * (1 + SPELLING.TOUCH_EXTRA), SPELLING.MIN_TOUCH);
  return { width, height, padX: (width - shapeWidth) / 2, padY: (height - shapeHeight) / 2 };
}

// Puts some pieces into one free region { x0, y0, x1, y1 }: the region is cut into cells (as many
// side by side as fit) and each piece gets a random spot inside its own cell.
function fillRegion(region, members, boxes, spots) {
  if (members.length === 0) return;
  const width = Math.max(1, region.x1 - region.x0);
  const height = Math.max(1, region.y1 - region.y0);
  const widestBox = Math.max(...members.map((i) => boxes[i].width));
  const columns = Math.max(1, Math.min(members.length, Math.floor(width / widestBox)));
  const rowCount = Math.ceil(members.length / columns);
  const cellWidth = width / columns;
  const cellHeight = height / rowCount;

  members.forEach((pieceIndex, n) => {
    const box = boxes[pieceIndex];
    const roomX = Math.max(0, cellWidth - box.width);
    const roomY = Math.max(0, cellHeight - box.height);
    spots[pieceIndex] = {
      // no room = the piece sits in the middle of its cell
      x: region.x0 + (n % columns) * cellWidth + (cellWidth - box.width - roomX) / 2 + random(0, roomX),
      y: region.y0 + Math.floor(n / columns) * cellHeight + (cellHeight - box.height - roomY) / 2 + random(0, roomY),
      tilt: random(-SPELLING.REST_TILT, SPELLING.REST_TILT),
    };
  });
}

// A random spot for every loose piece, around `keepOut` = { left, right, top, bottom } (the word or sentence).
//   where = 'around': half above and half below it; on a wide, low screen (no room above / below) half on its
//                     left and half on its right instead
//   where = 'below':  all of them under it (the sentence)
// boxes = touch boxes of the pieces. Returns [{ x, y, tilt }] (top-left corner of each touch box), same order.
export function scatterPieces(boxes, areaWidth, areaHeight, keepOut, where = 'around') {
  const edge = SPELLING.BOARD_PADDING;
  const gap = SPELLING.BAND_GAP;
  const above = { x0: edge, x1: areaWidth - edge, y0: edge, y1: keepOut.top - gap };
  const below = { x0: edge, x1: areaWidth - edge, y0: keepOut.bottom + gap, y1: areaHeight - edge };
  const onLeft = { x0: edge, x1: keepOut.left - gap, y0: edge, y1: areaHeight - edge };
  const onRight = { x0: keepOut.right + gap, x1: areaWidth - edge, y0: edge, y1: areaHeight - edge };

  const order = shuffle(boxes.map((_, i) => i));
  const spots = [];
  if (where === 'below') {
    fillRegion(below, order, boxes, spots);
    return spots;
  }

  const tallest = Math.max(...boxes.map((box) => box.height));
  const fitsAboveAndBelow = above.y1 - above.y0 >= tallest * 0.9 && below.y1 - below.y0 >= tallest * 0.9;
  const half = Math.random() < 0.5 ? Math.ceil(order.length / 2) : Math.floor(order.length / 2);
  fillRegion(fitsAboveAndBelow ? above : onLeft, order.slice(0, half), boxes, spots);
  fillRegion(fitsAboveAndBelow ? below : onRight, order.slice(half), boxes, spots);
  return spots;
}
