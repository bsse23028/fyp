// ENGLISH HUB SCREEN - the English section: Alphabets · Words (coming soon) · Sentences.
// Sentences opens the existing Read Along flow (ReadingTopics) unchanged. Opened from Child Home.

import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../../../shared/components/AppText';
import Screen from '../../../shared/components/Screen';
import FadeInView from '../../../shared/components/FadeInView';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import BuddyCharacter from '../../../shared/components/BuddyCharacter';
import ComingSoonModal from '../../../shared/components/ComingSoonModal';
import SectionHeader from '../components/SectionHeader';
import { speakUi, stopSpeaking } from '../../../shared/utils/speech';
import { CALM, CALM_ACCENTS, CALM_RADIUS, CALM_SHADOW, FONTS } from '../../../shared/theme/theme';

const GREETING = 'What do you want to learn?';

const SECTIONS = [
  { title: 'Alphabets', subtitle: 'Letters and their sounds', icon: '🔤', screen: 'AlphabetList', accent: CALM_ACCENTS[0] },
  { title: 'Words', subtitle: 'Read and match words', icon: '🧩', screen: null, accent: CALM_ACCENTS[3] },
  { title: 'Sentences', subtitle: 'Read Along stories', icon: '📖', screen: 'ReadingTopics', accent: CALM_ACCENTS[1] },
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
    <Screen scroll mode="child" background={CALM.background}>
      <View style={styles.body}>
        <SectionHeader title="English" onBack={() => navigation.goBack()} onSound={() => speakUi(GREETING)} />

        <View style={styles.greeting}>
          <BuddyCharacter size={84} bubbleSide message={GREETING} messageKey={1} />
        </View>

        {SECTIONS.map((section, i) => (
          <FadeInView key={section.title} index={i + 1} style={styles.tileWrap}>
            <AnimatedPressable
              onPress={() => open(section)}
              accessibilityLabel={section.title}
              style={[styles.tile, CALM_SHADOW.soft, { backgroundColor: section.accent.pale }]}
            >
              <View style={styles.iconBox}>
                <Text style={styles.icon}>{section.icon}</Text>
              </View>
              <View style={styles.text}>
                <Text style={styles.title}>{section.title}</Text>
                <Text style={styles.subtitle}>{section.subtitle}</Text>
                {!section.screen && (
                  <View style={styles.soonTag}>
                    <Text style={styles.soonText}>Coming soon</Text>
                  </View>
                )}
              </View>
            </AnimatedPressable>
          </FadeInView>
        ))}
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
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: CALM_RADIUS.xl,
  },
  iconBox: {
    width: 76,
    height: 76,
    borderRadius: CALM_RADIUS.large,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CALM.surface,
  },
  icon: {
    fontSize: 40,
    lineHeight: 50,
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
  soonTag: {
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
