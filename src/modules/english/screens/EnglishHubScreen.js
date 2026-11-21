// ENGLISH HUB SCREEN - the English section: Alphabets · Trace letters · Letter games · Letter stories · Words (WordsHub: Read Along, Spelling ...) · Sentences.
// Inspo look: the buddy says the question, then the rounded pale sheet with a 2-column grid of pastel tiles
// (each tile has its category colour, CATEGORY in theme.js, and an icon that bobs a few times).
// Sentences opens the existing Read Along flow (ReadingTopics) unchanged. Opened from Child Home.

import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Text from '../../../shared/components/AppText';
import AppIcon from '../../../shared/components/AppIcon';
import Screen from '../../../shared/components/Screen';
import FadeInView from '../../../shared/components/FadeInView';
import PastelTile from '../../../shared/components/PastelTile';
import Sheet from '../../../shared/components/Sheet';
import BuddyCharacter from '../../../shared/components/BuddyCharacter';
import ComingSoonModal from '../../../shared/components/ComingSoonModal';
import SectionHeader from '../components/SectionHeader';
import { speakUi, stopSpeaking } from '../../../shared/utils/speech';
import { useIdleBob } from '../../../shared/utils/motion';
import { CATEGORY, CALM, CALM_RADIUS, FONTS } from '../../../shared/theme/theme';

const GREETING = 'What do you want to learn?';

// The tile icon (a flat AppIcon) bobs gently a few times (each tile a little later), then rests.
function BobbingIcon({ icon, index, color }) {
  const bob = useIdleBob({ height: 5, duration: 1400, cycles: 4, delay: 500 + index * 250 });
  return (
    <View style={styles.iconBox}>
      <Animated.View style={bob}>
        <AppIcon name={icon} size={34} color={color} />
      </Animated.View>
    </View>
  );
}

const SECTIONS = [
  { title: 'Alphabets', subtitle: 'Letters and their sounds', icon: 'alphabetical-variant', screen: 'AlphabetList', accent: CATEGORY.learning },
  { title: 'Trace letters', subtitle: 'Draw letters with your finger', icon: 'draw', screen: 'TraceList', accent: CATEGORY.art },
  { title: 'Letter games', subtitle: 'Bubble pop and matching', icon: 'gamepad-variant', screen: 'LetterGames', accent: CATEGORY.games },
  { title: 'Letter stories', subtitle: 'Watch a letter come alive', icon: 'movie-open', screen: 'StoryList', accent: CATEGORY.music },
  { title: 'Words', subtitle: 'Read and match words', icon: 'puzzle', screen: 'WordsHub', accent: CATEGORY.calm },
  { title: 'Sentences', subtitle: 'Read Along stories', icon: 'book-open-variant', screen: 'ReadingTopics', accent: CATEGORY.reading },
];

export default function EnglishHubScreen({ navigation }) {
  const [soonOpen, setSoonOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', stopSpeaking);
    return unsubscribe;
  }, [navigation]);

  function open(section) {
    if (section.screen) navigation.navigate(section.screen);
    else setSoonOpen(true);
  }

  return (
    <Screen scroll mode="child">
      <View style={styles.body}>
        <SectionHeader title="English" onBack={() => navigation.goBack()} onSound={() => speakUi(GREETING)} />

        <View style={styles.greeting}>
          <BuddyCharacter size={84} bubbleSide message={GREETING} messageKey={1} messageSilent />
        </View>

        <Sheet>
          <FadeInView index={1} style={styles.grid}>
            {SECTIONS.map((section, i) => (
              <PastelTile
                key={section.title}
                title={section.title}
                subtitle={section.subtitle}
                iconNode={<BobbingIcon icon={section.icon} index={i} color={section.accent.deep} />}
                color={section.accent.pale}
                minHeight={150}
                onPress={() => open(section)}
              >
                {!section.screen && (
                  <View style={styles.soonTag}>
                    <Text style={styles.soonText}>Coming soon</Text>
                  </View>
                )}
              </PastelTile>
            ))}
          </FadeInView>
        </Sheet>
      </View>

      <ComingSoonModal
        visible={soonOpen}
        onClose={() => setSoonOpen(false)}
        message="Words is still being built. Check back soon!"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  greeting: {
    marginTop: 18,
    marginBottom: 6,
    alignSelf: 'flex-start',
    minHeight: 110,
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: CALM_RADIUS.large,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CALM.surface,
  },
  icon: {
    fontSize: 36,
    lineHeight: 46,
  },
  soonTag: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: CALM_RADIUS.pill,
    backgroundColor: CALM.surface,
  },
  soonText: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 12,
    color: CALM.textSoft,
  },
});
