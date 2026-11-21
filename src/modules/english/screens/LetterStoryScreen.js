// LETTER STORY SCREEN - plays one letter's story video (made with Remotion, see the video/ folder) in a
// big rounded card over the sky. Tap the video = pause / play. It pauses when the screen is left and
// follows the app's sound switch. At the end three icon buttons pop in: watch again, the next letter's
// story (when it has one) and all stories. Params: { letter: 'A' }

import React, { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useEventListener } from 'expo';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../../shared/components/Screen';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import { BackCircle } from '../components/SectionHeader';
import { ALPHABET, getLetter } from '../data/alphabetData';
import { LETTER_VIDEOS } from '../data/letterVideos';
import { useScaleIn } from '../../../shared/utils/motion';
import { soundEnabled } from '../../../shared/utils/sounds';
import { stopSpeaking } from '../../../shared/utils/speech';
import { CALM, CALM_SHADOW, SPACING } from '../../../shared/theme/theme';

const CARD_FRACTION = 0.92; // the video card's width compared to the screen

function RoundButton({ icon, onPress, label, size = 64, main = false, delay = 0 }) {
  const appear = useScaleIn(delay);
  return (
    <Animated.View style={appear}>
      <AnimatedPressable
        onPress={onPress}
        accessibilityLabel={label}
        style={[styles.round, main && styles.roundMain, CALM_SHADOW.soft, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Ionicons name={icon} size={size * 0.48} color={main ? '#FFFFFF' : CALM.primaryDark} />
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function LetterStoryScreen({ navigation, route }) {
  const item = getLetter(route.params ? route.params.letter : 'A');
  const focused = useIsFocused();
  const { width, height } = useWindowDimensions();
  const side = Math.min(width - SPACING.screen * 2, height * 0.55) * CARD_FRACTION;
  const [ended, setEnded] = useState(false);
  const [paused, setPaused] = useState(false);

  const player = useVideoPlayer(LETTER_VIDEOS[item.letter], (p) => {
    p.loop = false;
    p.muted = !soundEnabled();
    p.play();
  });

  useEventListener(player, 'playToEnd', () => setEnded(true));

  // pause when another screen is in front, go on when the child comes back
  useEffect(() => {
    stopSpeaking();
    if (!focused) player.pause();
    else if (!ended && !paused) player.play();
  }, [focused]);

  const following = ALPHABET.slice(ALPHABET.findIndex((l) => l.letter === item.letter) + 1).find((l) => LETTER_VIDEOS[l.letter]);

  function toggle() {
    if (ended) return;
    if (paused) player.play();
    else player.pause();
    setPaused(!paused);
  }

  function again() {
    setEnded(false);
    setPaused(false);
    player.replay();
  }

  return (
    <Screen mode="child" scene="day">
      <View style={styles.body}>
        <View style={styles.header}>
          <BackCircle onPress={() => navigation.goBack()} />
        </View>

        <View style={styles.center}>
          <Pressable onPress={toggle} accessibilityRole="button" accessibilityLabel={paused ? 'Play' : 'Pause'}>
            <View style={[styles.card, CALM_SHADOW.lifted, { width: side, height: side }]}>
              <VideoView player={player} style={styles.video} contentFit="cover" nativeControls={false} />
              {paused ? (
                <View style={styles.pausedLayer}>
                  <Ionicons name="play" size={64} color="#FFFFFF" />
                </View>
              ) : null}
            </View>
          </Pressable>

          <View style={styles.actions}>
            {ended ? (
              <>
                <RoundButton icon="refresh" label="Watch again" onPress={again} />
                {following ? (
                  <RoundButton
                    icon="arrow-forward"
                    label="Next story"
                    main
                    size={78}
                    delay={120}
                    onPress={() => navigation.replace('LetterStory', { letter: following.letter })}
                  />
                ) : null}
                <RoundButton icon="grid" label="All stories" onPress={() => navigation.goBack()} delay={240} />
              </>
            ) : null}
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    direction: 'ltr',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 6,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  video: {
    flex: 1,
  },
  pausedLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(61, 31, 92, 0.25)',
  },
  actions: {
    minHeight: 100,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    direction: 'ltr',
  },
  round: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  roundMain: {
    backgroundColor: CALM.primary,
  },
});
