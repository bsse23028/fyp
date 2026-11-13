// LISTEN PAGE - one picture per page: the big letter above, ONE big object below that is a little
// character (TalkingObject: eyes, smile, arms, feet).
// Each time the page appears the picture springs in from the right, then WAVES hello while the voice
// says "A for apple!" (its mouth talks while the voice speaks); then the buddy says "Tap the picture!".
// TAP: the picture dances (or jumps if it is still dancing), its letters pop in, the voice says
// "A says ah, like apple." (mouth talking) and a happy cheer. The first tap finishes the page.
// A tap during the intro simply starts the tap sequence. Off screen, every loop stops (active = false).

import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import ListenPicture from './ListenPicture';
import useLessonSequence from './useLessonSequence';
import { LessonLetter } from '../LetterCase';
import { motion } from '../../../../../shared/utils/motion';
import { cheer } from '../../../../../shared/utils/speech';
import { playSound } from '../../../../../shared/utils/sounds';
import { CALM_RADIUS, CALM_SHADOW, FONTS } from '../../../../../shared/theme/theme';

const INTRO_DELAY = 350; // ms after the slide-in before the hello wave + voice
const DANCE_MS = 1500; // the tap sequence lasts at least this long (the dance)

export default function ListenPage({ item, exampleIndex, active, voice, contentWidth, onDone, onCheer, onHint }) {
  const example = item.examples[exampleIndex] || item.examples[0];
  const word = example.word.toLowerCase();
  const sequence = useLessonSequence(active);
  const slide = useRef(new Animated.Value(1)).current;
  const [popKey, setPopKey] = useState(0);
  const [talk, setTalk] = useState({ mood: 'idle', key: 0 });
  const [speaking, setSpeaking] = useState(false);
  const tapped = useRef(false);
  const size = Math.min(210, contentWidth * 0.6);

  const playMood = (mood) => setTalk((t) => ({ mood, key: t.key + 1 }));

  useEffect(() => {
    if (!active) {
      setSpeaking(false);
      return;
    }
    slide.setValue(1);
    motion.spring(slide, 0, { friction: 7, tension: 60 }).start();
    const line = `${item.letter} for ${word}!`;
    sequence
      .play(async ({ say, wait }) => {
        await wait(INTRO_DELAY);
        voice.remember(line);
        playMood('wave');
        setSpeaking(true);
        await say(line);
      })
      .then((finished) => {
        if (!finished) return; // cancelled by a tap: the tap sequence owns the mouth now
        setSpeaking(false);
        if (!tapped.current) onHint();
      });
  }, [active]);

  // The TalkingObject already plays its own dance / jump on the tap; this adds the voice, sounds and letters.
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
    setSpeaking(true);
    const finished = await sequence.play(async ({ say, wait }) => {
      await Promise.all([say(line), wait(DANCE_MS)]);
      setSpeaking(false);
      cheer();
    });
    setSpeaking(false);
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
        <ListenPicture
          item={item}
          example={example}
          size={size}
          popKey={popKey}
          mood={talk.mood}
          moodKey={talk.key}
          speaking={speaking}
          active={active}
          onPress={handleTap}
        />
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
