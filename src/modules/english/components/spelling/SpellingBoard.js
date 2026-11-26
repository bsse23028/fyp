// SPELLING BOARD - one word of the spelling game. Works for ANY word in spellingWords.js.
// PART 1, THE WORD
//   middle   the word as pale grey placeholder letters (the same letter pictures, as silhouettes)
//   around   the word's letters lying loose on the page at random spots (a new layout every game), at the
//            SAME size they have inside the word, never on top of the word: above and below it on a tall
//            screen, left and right of it on a wide one
// The child picks up a loose letter (it turns to jelly, see LooseLetter.js). Its recorded SOUND plays at the
// touch and keeps repeating while the letter is held (letterAudio.js); letting go stops it at once.
//   MAGNET       near its own placeholder the letter calms down and the placeholder glows
//   let go inside the magnet -> it slides exactly onto the placeholder and stays for good, says its NAME,
//                               a colour flash + ring + sparkles (SlotBurst), one small hop and a soft chime
//   let go on a WRONG placeholder -> it glides home with a boing and a wiggle (no sound, no voice).
//                               After 2 wrong tries its own placeholder pulses; after 3 the letter goes there by itself
//   let go anywhere else     -> it just glides home (not counted)
// When every letter is in: the letters hop one by one with their names, the picture pops OUT of the word and
// the word is read; then the word turns ONE solid colour, the picture shrinks and sits on top of it, and the
// whole word bounces with a second burst of poppers, a bell and a happy "Yaaay!".
// PART 2, THE SENTENCE (when the word has one and SENTENCE_ON is true)
//   the finished word glides to the top and gets small; SentenceBoard fills the space under it.
// onCelebrate() = play the poppers, onFinished() = everything is done: show the end buttons.
// Everything is placed with numbers from wordLayout.js. When the game area changes size (the phone was
// turned) the positions are worked out again: placed letters stay in the word, loose ones get new spots.
// Uses motion.js, sounds.js and speech.js. Props: { item, picture, active, onCelebrate, onFinished }
// (picture = what pops out of the finished word: the word's picture, or the child's buddy for a name)

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import LooseLetter from './LooseLetter';
import LetterSlot from './LetterSlot';
import SlotBurst from './SlotBurst';
import PieceSpot from './PieceSpot';
import LetterArt from './LetterArt';
import SentenceBoard from './SentenceBoard';
import { layoutWord, scatterPieces, touchBox } from './wordLayout';
import { SPELLING, SPELLING_DROP_AUDIO } from './spellingConfig';
import { LETTER_ART } from '../../data/letterImages';
import { lettersOf } from '../../data/spellingWords';
import { motion, wiggleRotate } from '../../../../shared/utils/motion';
import { speak, speakAsync, speakUi } from '../../../../shared/utils/speech';
import { playSound } from '../../../../shared/utils/sounds';
import {
  playLetterSound,
  preloadLetterSounds,
  releaseLetterSounds,
  startHoldSound,
  stopHoldSound,
} from '../../../../shared/utils/letterAudio';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function SpellingBoard({ item, picture, active = true, onCelebrate, onFinished }) {
  const letters = useMemo(() => lettersOf(item.word, SPELLING.ALL_CAPS), [item.word]);
  const count = letters.length;
  const hasSentence = SPELLING.SENTENCE_ON && Boolean(item.sentence);

  // plan = every position of this game for the current size of the game area.
  const [plan, setPlan] = useState(null); // { key, width, height, scale, slots, spots, boxes, picture, header }
  const [dragging, setDragging] = useState(null);
  const [placed, setPlaced] = useState({}); // letterId -> slot index
  const [near, setNear] = useState(null); // the placeholder whose own letter is held close by (magnet)
  const [hints, setHints] = useState({}); // slot index -> true
  const [bursts, setBursts] = useState({}); // slot index -> counter
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false); // the word is finished (the picture is out)
  const [solid, setSolid] = useState(false); // the word has turned one colour
  const [part, setPart] = useState('word'); // 'word' -> 'sentence'

  const letterRefs = useRef({});
  const placedRef = useRef({});
  const misses = useRef({});
  const timers = useRef([]);
  const alive = useRef(true);
  const introPending = useRef(true); // the opening "Let's spell ... cake" is still playing

  const pictureStep = useRef(new Animated.Value(0)).current; // 0 = hidden in the word, 1 = popped out big, 2 = small on the word
  const pictureSway = useRef(new Animated.Value(0)).current;
  const headerStep = useRef(new Animated.Value(0)).current; // 0 = the word in the middle, 1 = small at the top (sentence part)

  useEffect(() => {
    alive.current = true;
    preloadLetterSounds(letters.map((l) => l.char)); // the clips are ready before the first touch
    // The word is said after the opening line, unless the child already grabbed a letter (then it would
    // talk over the letter's sound).
    speakUi("Let's spell this word!", null, {
      onDone: () => {
        if (alive.current && introPending.current) speak(item.sayAs);
        introPending.current = false;
      },
    });
    return () => {
      alive.current = false;
      timers.current.forEach(clearTimeout);
      stopHoldSound();
      releaseLetterSounds(letters.map((l) => l.char)); // free this word's clips
    };
  }, []);

  // The screen is not in front any more: no letter sound may go on.
  useEffect(() => {
    if (!active) stopHoldSound();
  }, [active]);

  // The finished word's picture sways happily, only while this screen is in front.
  useEffect(() => {
    if (!done || !active) {
      pictureSway.setValue(0);
      return undefined;
    }
    const loop = motion.loop(
      motion.sequence([
        motion.timing(pictureSway, 1, { duration: 700 }),
        motion.timing(pictureSway, -1, { duration: 1400 }),
        motion.timing(pictureSway, 0, { duration: 700 }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [done, active]);

  function later(fn, ms) {
    timers.current.push(setTimeout(() => alive.current && fn(), ms));
  }

  // Work out every position. It runs again when the size changes (the phone was turned).
  function onGameLayout(e) {
    const { width, height } = e.nativeEvent.layout;
    if (!width || !height) return;
    if (plan && Math.abs(plan.width - width) < 2 && Math.abs(plan.height - height) < 2) return;
    const word = layoutWord(letters.map((l) => l.char).join(''), width, height);
    const boxes = word.slots.map((slot) => touchBox(slot.width, slot.height));
    const smallPicture = picture ? SPELLING.PICTURE_SIZE * SPELLING.PICTURE_SMALL : 0;
    const middle = (word.top + word.bottom) / 2;

    // The picture's journey, as distances from the middle of the word: up to the middle of the space
    // above the word (big), then down onto the top edge of the word (small).
    const picturePath = {
      top: middle - SPELLING.PICTURE_SIZE / 2,
      up: Math.max(SPELLING.PICTURE_SIZE / 2, word.top / 2) - middle,
      perch: word.top - smallPicture * (0.5 - SPELLING.PICTURE_PERCH) - middle,
    };

    // The sentence part: the whole word (with its small picture) shrinks around the middle of the game
    // area and moves up until its top edge is at HEADER_PAD. `bottom` = where the sentence may start.
    const shrink = SPELLING.HEADER_SCALE;
    const shrunk = (y) => height / 2 + (y - height / 2) * shrink;
    const blockTop = word.top - smallPicture * (1 - SPELLING.PICTURE_PERCH);
    const shift = SPELLING.HEADER_PAD - shrunk(blockTop);
    const header = { shift, bottom: shrunk(word.bottom) + shift + SPELLING.HEADER_GAP };

    setDragging(null);
    setNear(null);
    setPlan({
      key: (plan ? plan.key : 0) + 1,
      width,
      height,
      scale: word.scale,
      slots: word.slots,
      spots: scatterPieces(boxes, width, height, word, 'around'),
      boxes,
      picture: picturePath,
      header,
    });
  }

  // The centre of a loose letter while it rests at home.
  function homeOf(letter) {
    const spot = plan.spots[letter.slot];
    const box = plan.boxes[letter.slot];
    return { cx: spot.x + box.width / 2, cy: spot.y + box.height / 2 };
  }

  function slotIsFree(slot) {
    return !Object.values(placedRef.current).includes(slot);
  }

  // MAGNET: the free placeholders of this letter's OWN letter, as distances from its home, with how close
  // counts as "near" (`reach`). The letter checks them itself while it is dragged (umbrella has two l's:
  // the nearer free one wins).
  function magnetTargets(letter) {
    const home = homeOf(letter);
    const list = [];
    plan.slots.forEach((r, i) => {
      if (letters[i].char !== letter.char || Object.values(placed).includes(i)) return;
      const reach = Math.max(r.height * SPELLING.MAGNET_DISTANCE, SPELLING.MAGNET_MIN);
      list.push({ slot: i, dx: r.cx - home.cx, dy: r.cy - home.cy, reach });
    });
    return list;
  }

  // Was the letter let go on top of a free placeholder of ANOTHER letter? (a wrong try)
  function onWrongSlot(letter, dx, dy) {
    const home = homeOf(letter);
    const px = home.cx + dx;
    const py = home.cy + dy;
    const slack = SPELLING.DROP_SLACK;
    return plan.slots.some(
      (r, i) =>
        letters[i].char !== letter.char &&
        slotIsFree(i) &&
        px > r.x - slack &&
        px < r.x + r.width + slack &&
        py > r.y - slack &&
        py < r.y + r.height + slack
    );
  }

  // The first free placeholder that wants this letter.
  function rightSlotFor(char) {
    return letters.findIndex((l) => l.char === char && slotIsFree(l.slot));
  }

  function handleGrab(letter) {
    introPending.current = false;
    setDragging(letter.id);
    startHoldSound(letter.char, {
      gapMs: SPELLING.HOLD_GAP_MS,
      repeatVolume: SPELLING.HOLD_REPEAT_VOLUME,
      maxRepeats: SPELLING.HOLD_MAX_REPEATS,
      repeat: SPELLING.HOLD_REPEAT_ENABLED,
    });
  }

  function handleDrop(letter, dx, dy, magnetSlot) {
    stopHoldSound(); // the child let go: the sound stops at once
    setDragging(null);
    setNear(null);
    if (magnetSlot !== null) place(letter, magnetSlot);
    else if (onWrongSlot(letter, dx, dy)) missed(letter);
    else letterRefs.current[letter.id].goHome();
  }

  function place(letter, slot) {
    placedRef.current = { ...placedRef.current, [letter.id]: slot };
    setPlaced(placedRef.current);
    setHints((h) => ({ ...h, [slot]: false }));
    const home = homeOf(letter);
    const target = plan.slots[slot];
    const landed = () => {
      if (!alive.current) return;
      if (letterRefs.current[letter.id]) letterRefs.current[letter.id].hop(null, SPELLING.LAND_HOP);
      setBursts((b) => ({ ...b, [slot]: (b[slot] || 0) + 1 }));
      if (SPELLING_DROP_AUDIO === 'sound') playLetterSound(letter.char);
      else speak(letter.nameSpeech);
      if (Object.keys(placedRef.current).length === count) later(finish, SPELLING.FINISH_DELAY);
    };
    playSound('sparkle');
    // The loose letter and the placeholder are the same size, so it lands exactly on top.
    letterRefs.current[letter.id].landOn(target.cx - home.cx, target.cy - home.cy, landed);
  }

  // A wrong try: only something to SEE (boing + wiggle). Help grows with the number of tries.
  function missed(letter) {
    misses.current[letter.id] = (misses.current[letter.id] || 0) + 1;
    const tries = misses.current[letter.id];
    const right = rightSlotFor(letter.char);
    letterRefs.current[letter.id].goHome({ wiggle: true });

    if (tries >= SPELLING.HINT_AFTER_MISSES) setHints((h) => ({ ...h, [right]: true }));
    if (tries >= SPELLING.HELP_AFTER_MISSES) {
      setBusy(true);
      speakUi('Here, let me help.');
      later(() => {
        setBusy(false);
        place(letter, right);
      }, SPELLING.HELP_DELAY);
    }
  }

  // All letters of the finished word hop together.
  function bounceWord() {
    letters.forEach((letter) => letterRefs.current[letter.id] && letterRefs.current[letter.id].hop());
  }

  // Every letter is in: a letter parade, the picture pops out, the word, then the happy ending.
  async function finish() {
    setBusy(true);
    if (SPELLING.SPELL_OUT_LETTERS) {
      for (const letter of [...letters].sort((a, b) => placedRef.current[a.id] - placedRef.current[b.id])) {
        if (!alive.current) return;
        if (letterRefs.current[letter.id]) letterRefs.current[letter.id].hop();
        await speakAsync(letter.nameSpeech);
        await wait(SPELLING.LETTER_GAP);
      }
    }
    if (!alive.current) return;
    setDone(true);
    motion.spring(pictureStep, 1, { friction: 5, tension: 70 }).start(); // the picture pops out of the word
    playSound('tada');
    if (onCelebrate) onCelebrate();
    await speakAsync(item.sayAs, { rate: 0.7 });
    if (!alive.current) return;

    // The word turns one colour and the picture shrinks onto it.
    letters.forEach((letter) => letterRefs.current[letter.id] && letterRefs.current[letter.id].turnSolid());
    setSolid(true);
    motion.spring(pictureStep, 2, { friction: 7, tension: 60 }).start();
    await wait(SPELLING.SOLID_TIME);
    if (!alive.current) return;

    // The happy ending: the word bounces, more poppers, a bell and "Yaaay!".
    for (let n = 0; n < SPELLING.WORD_BOUNCES; n++) later(bounceWord, n * SPELLING.WORD_BOUNCE_GAP);
    playSound('cheerBell');
    if (onCelebrate) onCelebrate();
    speakUi('Yaaay!', null, { pitch: 1.5, rate: 0.92 });

    if (hasSentence) later(startSentence, SPELLING.SENTENCE_DELAY);
    else later(() => onFinished && onFinished(), SPELLING.BUTTONS_DELAY);
  }

  // Part 2: the finished word glides to the top and gets small; the sentence appears under it.
  function startSentence() {
    setPart('sentence');
    motion.spring(headerStep, 1, { friction: 8, tension: 50 }).start();
  }

  return (
    <View style={styles.game} onLayout={onGameLayout}>
      {plan ? (
        <>
          {/* the word (placeholders, letters, effects, picture): one layer, so it can move to the top together */}
          <Animated.View
            pointerEvents="box-none"
            style={[
              StyleSheet.absoluteFill,
              {
                transform: [
                  { translateY: headerStep.interpolate({ inputRange: [0, 1], outputRange: [0, plan.header.shift] }) },
                  { scale: headerStep.interpolate({ inputRange: [0, 1], outputRange: [1, SPELLING.HEADER_SCALE] }) },
                ],
              },
            ]}
          >
            {letters.map((l) => (
              <LetterSlot
                key={l.slot}
                renderArt={(tint) => <LetterArt char={l.char} scale={plan.scale} tint={tint} />}
                glowColor={LETTER_ART[l.char].light}
                spot={plan.slots[l.slot]}
                near={near === l.slot}
                hint={active && Boolean(hints[l.slot])}
                filled={Object.values(placed).includes(l.slot)}
              />
            ))}

            {letters.map((letter, i) => {
              const slot = placed[letter.id];
              const isPlaced = slot !== undefined;
              const home = homeOf(letter);
              const shape = plan.slots[i];
              return (
                <PieceSpot key={`${letter.id}-${plan.key}`} index={i} x={plan.spots[i].x} y={plan.spots[i].y} lifted={dragging === letter.id}>
                  <LooseLetter
                    ref={(view) => {
                      letterRefs.current[letter.id] = view;
                    }}
                    shape={{ width: shape.width, height: shape.height }}
                    renderArt={(tint) => <LetterArt char={letter.char} scale={plan.scale} tint={tint} />}
                    box={plan.boxes[i]}
                    tilt={plan.spots[i].tilt}
                    start={isPlaced ? { dx: plan.slots[slot].cx - home.cx, dy: plan.slots[slot].cy - home.cy, solid } : null}
                    disabled={isPlaced || busy || (dragging !== null && dragging !== letter.id)}
                    eyes
                    active={active}
                    targets={isPlaced ? [] : magnetTargets(letter)}
                    onGrab={() => handleGrab(letter)}
                    onMagnet={setNear}
                    onDrop={(dx, dy, magnetSlot) => handleDrop(letter, dx, dy, magnetSlot)}
                  />
                </PieceSpot>
              );
            })}

            {letters.map((l) => (
              <SlotBurst
                key={l.slot}
                renderArt={(tint) => <LetterArt char={l.char} scale={plan.scale} tint={tint} />}
                color={LETTER_ART[l.char].color}
                light={LETTER_ART[l.char].light}
                spot={plan.slots[l.slot]}
                burstKey={bursts[l.slot] || 0}
              />
            ))}

            {picture ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.picture,
                  { top: plan.picture.top, opacity: pictureStep.interpolate({ inputRange: [0, 0.3, 2], outputRange: [0, 1, 1] }) },
                  {
                    transform: [
                      { translateY: pictureStep.interpolate({ inputRange: [0, 1, 2], outputRange: [0, plan.picture.up, plan.picture.perch] }) },
                      { scale: pictureStep.interpolate({ inputRange: [0, 1, 2], outputRange: [0.1, 1, SPELLING.PICTURE_SMALL] }) },
                      { rotate: wiggleRotate(pictureSway, SPELLING.PICTURE_DANCE_ANGLE) },
                    ],
                  },
                ]}
              >
                <Image source={picture} fadeDuration={0} style={{ width: SPELLING.PICTURE_SIZE, height: SPELLING.PICTURE_SIZE }} resizeMode="contain" />
              </Animated.View>
            ) : null}
          </Animated.View>

          {part === 'sentence' ? (
            <View style={[styles.sentence, { top: plan.header.bottom }]}>
              <SentenceBoard item={item} sentence={item.sentence} active={active} onCelebrate={onCelebrate} onFinished={onFinished} />
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  game: {
    flex: 1,
    direction: 'ltr', // English words always read left to right, also in Urdu mode
  },
  picture: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
    elevation: 50,
  },
  sentence: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
