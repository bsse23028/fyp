// SPELLING GAME SCREEN - one word to spell by dragging its letters (the game is SpellingBoard).
// Params: { wordId: 'cake' }. When the word is done: a big celebration, then three big buttons:
//   ↻ Play again (new random letter layout) · → Next word (when there is another word) · ▦ All words
// The board only runs its loops while this screen is in front (useIsFocused); the voice stops on leave.

import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import Text from '../../../shared/components/AppText';
import Screen from '../../../shared/components/Screen';
import FadeInView from '../../../shared/components/FadeInView';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import Celebration from '../../../shared/components/Celebration';
import SectionHeader from '../components/SectionHeader';
import SpellingBoard from '../components/spelling/SpellingBoard';
import { getSpellingWord, nextSpellingWord } from '../data/spellingWords';
import { speak, stopSpeaking } from '../../../shared/utils/speech';
import { useDirection } from '../../../shared/utils/direction';
import { useChild } from '../../../app/store/useChild';
import { getAvatar } from '../../../shared/theme/avatars';
import { CALM, CALM_RADIUS, CALM_SHADOW, CALM_SIZES, FONTS } from '../../../shared/theme/theme';

const BUTTON_ROW_HEIGHT = 92; // space kept for the end buttons, so the game never jumps

function EndButton({ icon, label, onPress, index, main, flip }) {
  return (
    <FadeInView index={index} style={styles.endItem}>
      <AnimatedPressable onPress={onPress} accessibilityLabel={label} style={[styles.endButton, CALM_SHADOW.soft, main && styles.endMain]}>
        <Ionicons name={icon} size={30} color={main ? CALM.onPrimary : CALM.primaryDark} style={flip && styles.flip} />
      </AnimatedPressable>
      <Text style={styles.endLabel}>{label}</Text>
    </FadeInView>
  );
}

export default function SpellingGameScreen({ navigation, route }) {
  const item = getSpellingWord(route.params ? route.params.wordId : null);
  const next = nextSpellingWord(item.id);
  const focused = useIsFocused();
  const { isRTL } = useDirection();
  const { displayAvatar } = useChild();
  // What pops out of the finished word: its picture, or the child's buddy for a word without one (a name).
  const picture = item.image || getAvatar(displayAvatar).mascot;
  const [round, setRound] = useState(1);
  const [partyKey, setPartyKey] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', stopSpeaking);
    return () => {
      unsubscribe();
      stopSpeaking();
    };
  }, [navigation]);

  function playAgain() {
    stopSpeaking();
    setFinished(false);
    setRound((r) => r + 1);
  }

  function goNext() {
    stopSpeaking();
    navigation.replace('SpellingGame', { wordId: next.id });
  }

  return (
    <Screen mode="child" scene="spelling">
      <View style={styles.body}>
        <SectionHeader title="Spelling" onBack={() => navigation.goBack()} onSound={() => speak(item.sayAs)} />

        <SpellingBoard
          key={`${item.id}-${round}`}
          item={item}
          picture={picture}
          active={focused}
          onCelebrate={() => setPartyKey((k) => k + 1)}
          onFinished={() => setFinished(true)}
        />

        <View style={styles.endRow}>
          {finished ? (
            <>
              <EndButton index={0} icon="refresh" label="Play again" onPress={playAgain} />
              {next.id !== item.id ? (
                <EndButton index={1} icon="arrow-forward" label="Next word" onPress={goNext} main flip={isRTL} />
              ) : null}
              <EndButton index={2} icon="grid" label="All words" onPress={() => navigation.navigate('SpellingWords')} />
            </>
          ) : null}
        </View>
      </View>
      <Celebration burstKey={partyKey} types={['popper', 'confetti', 'stars']} big />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  endRow: {
    height: BUTTON_ROW_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 22,
  },
  endItem: {
    alignItems: 'center',
  },
  endButton: {
    width: CALM_SIZES.bigButton,
    height: CALM_SIZES.bigButton,
    borderRadius: CALM_RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CALM.surface,
  },
  endMain: {
    backgroundColor: CALM.primary,
  },
  endLabel: {
    marginTop: 4,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 13,
    color: CALM.textSoft,
  },
  flip: {
    transform: [{ scaleX: -1 }],
  },
});
