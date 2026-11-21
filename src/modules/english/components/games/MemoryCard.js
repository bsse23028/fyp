// MEMORY CARD - one card of the Match Pairs game. Face down it shows a soft coloured back with a star;
// face up it shows a letter picture. Turning over = the card squeezes to nothing and grows back with the
// other side (a gentle flip). A matched card bounces once and gets a soft green edge; `glowing` (the help
// hint) adds a pulsing yellow glow. Numbers are in gamesConfig.js (MATCH_GAME).

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import LetterArt from '../spelling/LetterArt';
import Sparkles from '../../../../shared/components/Sparkles';
import { motion, usePulse } from '../../../../shared/utils/motion';
import { MATCH_GAME as G } from './gamesConfig';
import { CALM_SHADOW, CALM_SUCCESS } from '../../../../shared/theme/theme';

export default function MemoryCard({ card, width, height, faceUp, matched, glowing, active, backColor, onPress }) {
  const squeeze = useRef(new Animated.Value(1)).current;
  const bounce = useRef(new Animated.Value(1)).current;
  const [showFace, setShowFace] = useState(faceUp);
  const [sparkle, setSparkle] = useState(0);
  const glow = usePulse(active && glowing && !matched, { duration: 650 });

  useEffect(() => {
    if (faceUp === showFace) return;
    motion
      .sequence([
        motion.timing(squeeze, 0, { duration: G.FLIP_MS / 2 }),
        motion.call(() => setShowFace(faceUp)),
        motion.timing(squeeze, 1, { duration: G.FLIP_MS / 2 }),
      ])
      .start();
  }, [faceUp]);

  useEffect(() => {
    if (!matched) return;
    setSparkle((k) => k + 1);
    motion.sequence([motion.timing(bounce, 1.12, { duration: 160 }), motion.spring(bounce, 1, { friction: 4, tension: 160 })]).start();
  }, [matched]);

  return (
    <Animated.View style={{ width, height, transform: [{ scale: bounce }] }}>
      <Animated.View
        pointerEvents="none"
        style={[styles.glow, { borderRadius: 26, opacity: glow }]}
      />
      <Pressable onPress={() => onPress(card)} accessibilityRole="button" accessibilityLabel={showFace ? card.char : 'card'} style={styles.fill}>
        <Animated.View
          style={[
            styles.card,
            CALM_SHADOW.soft,
            showFace ? styles.face : { backgroundColor: backColor },
            matched && styles.matched,
            { transform: [{ scaleX: squeeze }] },
          ]}
        >
          {showFace ? (
            <LetterArt char={card.char} scale={width * G.LETTER_SCALE_PER_POINT} />
          ) : (
            <View style={styles.back}>
              <Text style={styles.star}>⭐</Text>
            </View>
          )}
        </Animated.View>
      </Pressable>
      <Sparkles burstKey={sparkle} size={18} count={3} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    margin: -7,
    backgroundColor: '#FBEBA5',
  },
  card: {
    flex: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  face: {
    backgroundColor: '#FFFFFF',
  },
  matched: {
    borderColor: CALM_SUCCESS.main,
    backgroundColor: CALM_SUCCESS.pale,
  },
  back: {
    width: '62%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    fontSize: 30,
  },
});
