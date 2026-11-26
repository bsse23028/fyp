// LETTER GAMES SCREEN - the games of the Alphabets: Bubble Pop and Match Pairs, as two big tiles over the
// animated sky. Tiles pop in one after another and their icons bob a few times. Opened from EnglishHub.

import React, { useEffect } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Text from '../../../shared/components/AppText';
import Screen from '../../../shared/components/Screen';
import FadeInView from '../../../shared/components/FadeInView';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import BuddyCharacter from '../../../shared/components/BuddyCharacter';
import SectionHeader from '../components/SectionHeader';
import { useIdleBob } from '../../../shared/utils/motion';
import { speakUi, stopSpeaking } from '../../../shared/utils/speech';
import { CALM, CALM_ACCENTS, CALM_RADIUS, CALM_SHADOW, FONTS } from '../../../shared/theme/theme';

const GREETING = "Let's play a letter game!";

const GAMES = [
  { title: 'Bubble Pop', subtitle: 'Pop the letter bubbles', icon: '🎈', screen: 'BubblePopGame', accent: CALM_ACCENTS[1] },
  { title: 'Match Pairs', subtitle: 'Find big and small letters', icon: '🧩', screen: 'MatchPairsGame', accent: CALM_ACCENTS[4] },
];

function BobbingIcon({ icon, index }) {
  const bob = useIdleBob({ height: 6, duration: 1300, cycles: 4, delay: 500 + index * 300 });
  return (
    <View style={styles.iconBox}>
      <Animated.Text style={[styles.icon, bob]}>{icon}</Animated.Text>
    </View>
  );
}

export default function LetterGamesScreen({ navigation }) {
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', stopSpeaking);
    return unsubscribe;
  }, [navigation]);

  return (
    <Screen scroll mode="child" scene="day">
      <View style={styles.body}>
        <SectionHeader title="Letter games" onBack={() => navigation.goBack()} onSound={() => speakUi(GREETING)} />

        <View style={styles.greeting}>
          <BuddyCharacter size={84} bubbleSide message={GREETING} messageKey={1} />
        </View>

        {GAMES.map((game, i) => (
          <FadeInView key={game.title} index={i + 1} style={styles.tileWrap}>
            <AnimatedPressable
              onPress={() => navigation.navigate(game.screen)}
              accessibilityLabel={game.title}
              style={[styles.tile, CALM_SHADOW.soft, { backgroundColor: game.accent.pale }]}
            >
              <BobbingIcon icon={game.icon} index={i} />
              <View style={styles.text}>
                <Text style={styles.title}>{game.title}</Text>
                <Text style={styles.subtitle}>{game.subtitle}</Text>
              </View>
            </AnimatedPressable>
          </FadeInView>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingBottom: 16,
  },
  greeting: {
    marginTop: 18,
    marginBottom: 6,
    alignSelf: 'flex-start',
    minHeight: 110,
    justifyContent: 'center',
  },
  tileWrap: {
    marginTop: 14,
  },
  tile: {
    minHeight: 120,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: CALM_RADIUS.xl,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: CALM_RADIUS.large,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CALM.surface,
  },
  icon: {
    fontSize: 44,
    lineHeight: 54,
  },
  text: {
    flex: 1,
    marginStart: 16,
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 24,
    color: CALM.text,
  },
  subtitle: {
    marginTop: 2,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 15,
    color: CALM.textSoft,
  },
});
