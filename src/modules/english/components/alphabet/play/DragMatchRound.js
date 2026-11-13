// DRAG MATCH ROUND - drag one card (bottom) onto the matching target (top). Used by
// "Drag the letter to its picture" and "Big and small". Errorless guidance on wrong drops:
//   1st: the card glides back, the buddy tilts its head ("Let's try again")
//   2nd: glides back and the right target glows softly as a hint
//   3rd: the buddy places the answer for the child, and the round moves on
// Dropping on empty space just glides back (not counted). Never red, X or a negative sound.

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../../../../../shared/components/AppText';
import DraggableCard from './DraggableCard';
import DropTarget from './DropTarget';
import { cheer } from '../../../../../shared/utils/speech';
import { playSound } from '../../../../../shared/utils/sounds';
import { CALM, FONTS } from '../../../../../shared/theme/theme';

const SLACK = 14;
const NEXT_ROUND_DELAY = 1700;

export default function DragMatchRound({
  targets, // [{ key, content, width }]
  correctKey,
  card, // what the child drags
  badge, // small label shown on the matched target
  instruction, // { text, params } spoken when the round appears
  successLine, // written + spoken on a correct match
  successSpeech, // optional different spoken text
  voice,
  buddy,
  onDone,
}) {
  const cardRef = useRef(null);
  const targetRefs = useRef({});
  const rects = useRef({ card: null, targets: {} });
  const hoverRef = useRef(null);
  const attempts = useRef(0);
  const timers = useRef([]);

  const [hover, setHover] = useState(null);
  const [hint, setHint] = useState(false);
  const [locked, setLocked] = useState(false);
  const [matched, setMatched] = useState(false);
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [caption, setCaption] = useState(null);

  useEffect(() => {
    voice.ui(instruction.text, instruction.speakParams || instruction.params);
    return () => timers.current.forEach(clearTimeout);
  }, []);

  function later(fn, ms) {
    timers.current.push(setTimeout(fn, ms));
  }

  function measureAll() {
    if (cardRef.current) {
      cardRef.current.measure((x, y, w, h) => {
        rects.current.card = { cx: x + w / 2, cy: y + h / 2 };
      });
    }
    targets.forEach((target) => {
      const view = targetRefs.current[target.key];
      if (view) {
        view.measureInWindow((x, y, w, h) => {
          rects.current.targets[target.key] = { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
        });
      }
    });
  }

  function hitTest(dx, dy) {
    const home = rects.current.card;
    if (!home) return null;
    const px = home.cx + dx;
    const py = home.cy + dy;
    const found = Object.entries(rects.current.targets).find(
      ([, r]) => px >= r.x - SLACK && px <= r.x + r.w + SLACK && py >= r.y - SLACK && py <= r.y + r.h + SLACK
    );
    return found ? found[0] : null;
  }

  function updateHover(key) {
    if (hoverRef.current === key) return;
    hoverRef.current = key;
    setHover(key);
  }

  function succeed() {
    setLocked(true);
    const home = rects.current.card;
    const target = rects.current.targets[correctKey];
    const finish = () => {
      setMatched(true);
      setCelebrateKey((k) => k + 1);
      setCaption(successLine);
      playSound('pop');
      if (buddy.party) buddy.party();
      voice.teach(successSpeech || successLine, { onDone: () => cheer() });
      buddy.mood('happy');
      later(onDone, NEXT_ROUND_DELAY);
    };
    if (home && target) cardRef.current.snapTo(target.cx - home.cx, target.cy - home.cy, finish);
    else finish();
  }

  function missed() {
    attempts.current += 1;
    cardRef.current.glideBack();
    if (attempts.current === 1) {
      buddy.say("Let's try again", 'think');
    } else if (attempts.current === 2) {
      setHint(true);
      buddy.say('Look at the glowing one.', 'think');
    } else {
      setHint(true);
      setLocked(true);
      buddy.say('Here, let me help.', 'happy');
      later(succeed, 1300);
    }
  }

  function handleRelease(dx, dy) {
    const key = hitTest(dx, dy);
    updateHover(null);
    if (!key) cardRef.current.glideBack();
    else if (key === correctKey) succeed();
    else missed();
  }

  return (
    <View style={styles.body}>
      <View style={styles.targets}>
        {targets.map((target) => (
          <DropTarget
            key={target.key}
            ref={(view) => {
              targetRefs.current[target.key] = view;
            }}
            width={target.width}
            hover={hover === target.key}
            hint={hint && target.key === correctKey}
            matched={matched && target.key === correctKey}
            badge={badge}
            celebrateKey={target.key === correctKey ? celebrateKey : 0}
          >
            {target.content}
          </DropTarget>
        ))}
      </View>

      <Text style={styles.caption} numberOfLines={2}>
        {caption || ' '}
      </Text>

      <View style={styles.cardSpot}>
        <DraggableCard
          ref={cardRef}
          disabled={locked}
          onGrant={measureAll}
          onMove={(dx, dy) => updateHover(hitTest(dx, dy))}
          onRelease={handleRelease}
        >
          {card}
        </DraggableCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  targets: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    direction: 'ltr',
  },
  caption: {
    marginTop: 10,
    minHeight: 26,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 18,
    color: CALM.textSoft,
    textAlign: 'center',
  },
  cardSpot: {
    alignItems: 'center',
    paddingBottom: 6,
  },
});
