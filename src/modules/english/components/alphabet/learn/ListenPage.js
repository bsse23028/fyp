// LISTEN PAGE - one picture per page: the big letter above, ONE big object below.
// Each time the page appears the picture springs in from the right and the voice says "A for apple!",
// then the buddy says "Tap the picture!" (onHint).
// TAP: the picture bounces and dances, its letters pop in, the voice says "A says ah, like apple." and
// "Yay!". The first tap finishes the page. A tap during the intro simply starts the tap sequence.

import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import AnimatedPressable from '../../../../../shared/components/AnimatedPressable';
import ListenPicture from './ListenPicture';
import useLessonSequence from './useLessonSequence';
import { LessonLetter } from '../LetterCase';
import { motion } from '../../../../../shared/utils/motion';
import { cheer } from '../../../../../shared/utils/speech';
import { playSound } from '../../../../../shared/utils/sounds';
import { CALM_RADIUS, CALM_SHADOW, FONTS } from '../../../../../shared/theme/theme';

export default function ListenPage({ item, exampleIndex, active, voice, contentWidth, onDone, onCheer, onHint }) {
  const example = item.examples[exampleIndex] || item.examples[0];
  const word = example.word.toLowerCase();
  const picture = useRef(null);
  const sequence = useLessonSequence(active);
  const slide = useRef(new Animated.Value(1)).current;
  const [popKey, setPopKey] = useState(0);
  const tapped = useRef(false);
  const size = Math.min(210, contentWidth * 0.6);

  useEffect(() => {
    if (!active) return;
    slide.setValue(1);
    motion.spring(slide, 0, { friction: 7, tension: 60 }).start();
    sequence
      .play(async ({ say, wait }) => {
        await wait(350);
        voice.remember(`${item.letter} for ${word}!`);
        await say(`${item.letter} for ${word}!`);
      })
      .then((finished) => {
        if (finished && !tapped.current) onHint();
      });
  }, [active]);

  async function handleTap() {
    if (sequence.playing) {
      if (tapped.current) return;
      sequence.cancel();
    }
    const first = !tapped.current;
    tapped.current = true;
    setPopKey((k) => k + 1);
    playSound('pop');
    const line = `${item.letter} says ${item.soundSpeech}, like ${word}.`;
    voice.remember(line);
    const finished = await sequence.play(async ({ anim, say }) => {
      await Promise.all([anim(picture.current.dance()), say(line)]);
      cheer();
    });
    if (finished && first) {
      onDone();
      onCheer();
    }
  }

  const slideStyle = {
    opacity: slide.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
    transform: [{ translateX: slide.interpolate({ inputRange: [0, 1], outputRange: [0, contentWidth * 0.7] }) }],
  };

  return (
    <View style={styles.body}>
      <View style={[styles.letterCard, CALM_SHADOW.soft, { backgroundColor: item.accent.pale }]}>
        <LessonLetter item={item} style={[styles.letter, { color: item.accent.deep }]} />
      </View>
      <Animated.View style={[styles.picture, slideStyle]}>
        <AnimatedPressable onPress={handleTap} accessibilityLabel={example.word}>
          <ListenPicture ref={picture} item={item} example={example} size={size} popKey={popKey} />
        </AnimatedPressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterCard: {
    minWidth: 96,
    height: 96,
    paddingHorizontal: 16,
    borderRadius: CALM_RADIUS.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 60,
    lineHeight: 74,
  },
  picture: {
    marginTop: 22,
  },
});
