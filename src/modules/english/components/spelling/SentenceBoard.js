// SENTENCE BOARD - the second part of a spelling word: a short sentence with two missing words.
//   top     the sentence written with the letter pictures (it wraps onto more rows when needed);
//           the missing words are pale grey silhouettes
//   below   the missing words lying loose on the page
// The child drags each loose WORD to its place. A word feels and behaves exactly like a loose letter
// (jelly, magnet, flash + ring + sparkles, boing + wiggle on a wrong place, help after 2 and 3 wrong tries);
// picking it up and landing it says the word.
// When both words are in: the sentence is read, it bounces, and onCelebrate() + onFinished() are called.
// It works out its positions again whenever its size changes (turning the phone).
// Props: { item, sentence: { text, drag, sayAs }, active, onCelebrate, onFinished }

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import LooseLetter from './LooseLetter';
import LetterSlot from './LetterSlot';
import SlotBurst from './SlotBurst';
import PieceSpot from './PieceSpot';
import WordArt from './WordArt';
import { layoutSentence, scatterPieces, touchBox } from './wordLayout';
import { SPELLING } from './spellingConfig';
import { LETTER_ART } from '../../data/letterImages';
import { hop, motion } from '../../../../shared/utils/motion';
import { speak, speakAsync, speakUi } from '../../../../shared/utils/speech';
import { playSound } from '../../../../shared/utils/sounds';

export default function SentenceBoard({ item, sentence, active = true, onCelebrate, onFinished }) {
  // words = every word of the sentence, in order. `drag` = true for the ones the child has to put in.
  const words = useMemo(() => {
    const caps = (text) => (SPELLING.ALL_CAPS ? text.toUpperCase() : text);
    const missing = sentence.drag.map(caps);
    return sentence.text
      .replace('.', '')
      .split(' ')
      .map((text, index) => {
        const shown = caps(text);
        const drag = missing.includes(shown);
        if (drag) missing.splice(missing.indexOf(shown), 1);
        // The spelled word is said the way the word list says it (important for names).
        const say = text.toLowerCase() === item.word.toLowerCase() ? item.sayAs : text;
        return { index, text: shown, drag, say, art: LETTER_ART[shown[0]] };
      });
  }, [sentence.text]);
  const pieces = words.filter((w) => w.drag);

  const [plan, setPlan] = useState(null); // { key, width, height, scale, places, dot, spots, boxes }
  const [dragging, setDragging] = useState(null);
  const [placed, setPlaced] = useState({}); // word index -> true
  const [near, setNear] = useState(null);
  const [hints, setHints] = useState({});
  const [bursts, setBursts] = useState({});
  const [busy, setBusy] = useState(false);

  const pieceRefs = useRef({});
  const placedRef = useRef({});
  const misses = useRef({});
  const timers = useRef([]);
  const alive = useRef(true);
  const jump = useRef(new Animated.Value(0)).current; // the whole sentence hops at the end
  const squash = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    alive.current = true;
    speakUi('Now finish the sentence!');
    return () => {
      alive.current = false;
      timers.current.forEach(clearTimeout);
    };
  }, []);

  function later(fn, ms) {
    timers.current.push(setTimeout(() => alive.current && fn(), ms));
  }

  // Work out every position. It runs again when the size changes (the phone was turned); words that are
  // already in the sentence stay there, the loose ones get new spots.
  function onLayout(e) {
    const { width, height } = e.nativeEvent.layout;
    if (!width || !height) return;
    if (plan && Math.abs(plan.width - width) < 2 && Math.abs(plan.height - height) < 2) return;
    const layout = layoutSentence(words.map((w) => w.text), width, height);
    const boxes = words.map((w, i) => touchBox(layout.words[i].width, layout.words[i].height));
    const dragBoxes = pieces.map((w) => boxes[w.index]);
    const keepOut = { left: 0, right: width, top: layout.top, bottom: layout.bottom };
    const dragSpots = scatterPieces(dragBoxes, width, height, keepOut, 'below');
    const spots = [];
    pieces.forEach((w, n) => {
      spots[w.index] = dragSpots[n];
    });
    setDragging(null);
    setNear(null);
    setPlan({ key: (plan ? plan.key : 0) + 1, width, height, scale: layout.scale, places: layout.words, dot: layout.dot, spots, boxes });
  }

  function homeOf(word) {
    const spot = plan.spots[word.index];
    const box = plan.boxes[word.index];
    return { cx: spot.x + box.width / 2, cy: spot.y + box.height / 2 };
  }

  // MAGNET: the word's own free place, as a distance from its home, with how close counts as "near".
  // The word checks it itself while it is dragged.
  function magnetTargets(word) {
    const home = homeOf(word);
    const list = [];
    pieces.forEach((other) => {
      if (other.text !== word.text || placed[other.index]) return;
      const r = plan.places[other.index];
      const reach = Math.max(r.height * SPELLING.MAGNET_DISTANCE, r.width / 2, SPELLING.MAGNET_MIN);
      list.push({ slot: other.index, dx: r.cx - home.cx, dy: r.cy - home.cy, reach });
    });
    return list;
  }

  // Was the word let go on the free place of ANOTHER word? (a wrong try)
  function onWrongPlace(word, dx, dy) {
    const home = homeOf(word);
    const px = home.cx + dx;
    const py = home.cy + dy;
    const slack = SPELLING.DROP_SLACK;
    return pieces.some((other) => {
      const r = plan.places[other.index];
      return (
        other.text !== word.text &&
        !placedRef.current[other.index] &&
        px > r.x - slack &&
        px < r.x + r.width + slack &&
        py > r.y - slack &&
        py < r.y + r.height + slack
      );
    });
  }

  function handleGrab(word) {
    setDragging(word.index);
    speak(word.say);
  }

  function handleDrop(word, dx, dy, magnetSlot) {
    setDragging(null);
    setNear(null);
    if (magnetSlot !== null) place(word);
    else if (onWrongPlace(word, dx, dy)) missed(word);
    else pieceRefs.current[word.index].goHome();
  }

  function place(word) {
    placedRef.current = { ...placedRef.current, [word.index]: true };
    setPlaced(placedRef.current);
    setHints((h) => ({ ...h, [word.index]: false }));
    const home = homeOf(word);
    const target = plan.places[word.index];
    const landed = () => {
      if (!alive.current) return;
      if (pieceRefs.current[word.index]) pieceRefs.current[word.index].hop(null, SPELLING.LAND_HOP);
      setBursts((b) => ({ ...b, [word.index]: (b[word.index] || 0) + 1 }));
      speak(word.say);
      if (Object.keys(placedRef.current).length === pieces.length) later(finish, SPELLING.SENTENCE_READ_DELAY);
    };
    playSound('sparkle');
    pieceRefs.current[word.index].landOn(target.cx - home.cx, target.cy - home.cy, landed);
  }

  function missed(word) {
    misses.current[word.index] = (misses.current[word.index] || 0) + 1;
    const tries = misses.current[word.index];
    pieceRefs.current[word.index].goHome({ wiggle: true });

    if (tries >= SPELLING.HINT_AFTER_MISSES) setHints((h) => ({ ...h, [word.index]: true }));
    if (tries >= SPELLING.HELP_AFTER_MISSES) {
      setBusy(true);
      speakUi('Here, let me help.');
      later(() => {
        setBusy(false);
        place(word);
      }, SPELLING.HELP_DELAY);
    }
  }

  // Both words are in: read the sentence, then it bounces with poppers, a bell and "Yaaay!".
  async function finish() {
    setBusy(true);
    await speakAsync(sentence.sayAs || sentence.text, { rate: 0.7 });
    if (!alive.current) return;
    const bounce = () => hop(jump, squash, 18).start();
    for (let n = 0; n < SPELLING.WORD_BOUNCES; n++) later(bounce, n * SPELLING.WORD_BOUNCE_GAP);
    playSound('cheerBell');
    if (onCelebrate) onCelebrate();
    speakUi('Yaaay!', null, { pitch: 1.5, rate: 0.92 });
    later(() => onFinished && onFinished(), SPELLING.BUTTONS_DELAY);
  }

  return (
    <View style={styles.area} onLayout={onLayout}>
      {plan ? (
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateY: jump }, { scale: squash }] }]} pointerEvents="box-none">
          {/* the words that are already written */}
          {words
            .filter((w) => !w.drag)
            .map((w) => (
              <View key={w.index} pointerEvents="none" style={[styles.fixed, { left: plan.places[w.index].x, top: plan.places[w.index].y }]}>
                <WordArt text={w.text} scale={plan.scale} />
              </View>
            ))}
          <View
            pointerEvents="none"
            style={[
              styles.fixed,
              styles.dot,
              { left: plan.dot.x, top: plan.dot.y, width: plan.dot.size, height: plan.dot.size, borderRadius: plan.dot.size / 2 },
            ]}
          />

          {/* the grey places of the missing words */}
          {pieces.map((w) => (
            <LetterSlot
              key={w.index}
              renderArt={(tint) => <WordArt text={w.text} scale={plan.scale} tint={tint} />}
              glowColor={w.art.light}
              spot={plan.places[w.index]}
              near={near === w.index}
              hint={active && Boolean(hints[w.index])}
              filled={Boolean(placed[w.index])}
            />
          ))}

          {/* the loose words */}
          {pieces.map((w, n) => {
            const isPlaced = Boolean(placed[w.index]);
            const home = homeOf(w);
            const target = plan.places[w.index];
            return (
              <PieceSpot key={`${w.index}-${plan.key}`} index={n} x={plan.spots[w.index].x} y={plan.spots[w.index].y} lifted={dragging === w.index}>
                <LooseLetter
                  ref={(view) => {
                    pieceRefs.current[w.index] = view;
                  }}
                  shape={{ width: target.width, height: target.height }}
                  renderArt={(tint) => <WordArt text={w.text} scale={plan.scale} tint={tint} />}
                  box={plan.boxes[w.index]}
                  tilt={plan.spots[w.index].tilt * 0.5}
                  start={isPlaced ? { dx: target.cx - home.cx, dy: target.cy - home.cy } : null}
                  disabled={isPlaced || busy || (dragging !== null && dragging !== w.index)}
                  active={active}
                  targets={isPlaced ? [] : magnetTargets(w)}
                  onGrab={() => handleGrab(w)}
                  onHoldLong={() => speak(w.say)}
                  onMagnet={setNear}
                  onDrop={(dx, dy, magnetSlot) => handleDrop(w, dx, dy, magnetSlot)}
                />
              </PieceSpot>
            );
          })}

          {pieces.map((w) => (
            <SlotBurst
              key={w.index}
              renderArt={(tint) => <WordArt text={w.text} scale={plan.scale} tint={tint} />}
              color={w.art.color}
              light={w.art.light}
              spot={plan.places[w.index]}
              burstKey={bursts[w.index] || 0}
            />
          ))}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
  },
  fixed: {
    position: 'absolute',
  },
  dot: {
    backgroundColor: SPELLING.SENTENCE_DOT_COLOR,
  },
});
