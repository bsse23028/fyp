// LETTER EYES - two little blinking eyes drawn on a loose letter. Only used when SHOW_EYES is true in
// spellingConfig.js (it is false for now: this is a simple first version, not tuned letter by letter).
// The look is the same as the eyes of TalkingObject (white circle, dark pupil, tiny shine) and it uses the
// same colours and blink timing from talkingObjectConfig.js.
//   width / height = the size of the letter's shape; `active` = false stops the blinking.

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { animationsEnabled, motion } from '../../../../shared/utils/motion';
import { TALKING_COLORS, TALKING_MOTION } from '../../../../shared/components/talkingObjectConfig';
import { SPELLING } from './spellingConfig';

export default function LetterEyes({ width, height, active = true }) {
  const blink = useRef(new Animated.Value(1)).current;

  // Blink at random moments, only while the screen is in front.
  useEffect(() => {
    if (!active || !animationsEnabled()) return undefined;
    let timer = null;
    const next = () => {
      const pause = TALKING_MOTION.blinkEveryMin + Math.random() * (TALKING_MOTION.blinkEveryMax - TALKING_MOTION.blinkEveryMin);
      timer = setTimeout(() => {
        motion
          .sequence([
            motion.timing(blink, 0.1, { duration: TALKING_MOTION.blinkMs / 2 }),
            motion.timing(blink, 1, { duration: TALKING_MOTION.blinkMs / 2 }),
          ])
          .start(next);
      }, pause);
    };
    next();
    return () => clearTimeout(timer);
  }, [active]);

  // Thin letters (i, l) get smaller eyes so both still fit on the letter.
  const eye = Math.min(height * SPELLING.EYE_SIZE, width * 0.42);
  const pupil = eye * 0.55;
  const gap = eye * SPELLING.EYE_GAP;
  const top = height * SPELLING.EYES_Y - eye / 2;
  const left = width / 2 - eye - gap / 2;

  const oneEye = (offset) => (
    <Animated.View
      style={[styles.eye, { left: left + offset, top, width: eye, height: eye, borderRadius: eye / 2, transform: [{ scaleY: blink }] }]}
    >
      <View style={{ width: pupil, height: pupil, borderRadius: pupil / 2, backgroundColor: TALKING_COLORS.pupil }}>
        <View style={[styles.shine, { width: pupil * 0.32, height: pupil * 0.32, borderRadius: pupil * 0.16 }]} />
      </View>
    </Animated.View>
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {oneEye(0)}
      {oneEye(eye + gap)}
    </View>
  );
}

const styles = StyleSheet.create({
  eye: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TALKING_COLORS.eyeWhite,
    borderWidth: 1,
    borderColor: 'rgba(61, 31, 92, 0.25)',
  },
  shine: {
    position: 'absolute',
    top: '14%',
    left: '18%',
    backgroundColor: TALKING_COLORS.eyeShine,
  },
});
