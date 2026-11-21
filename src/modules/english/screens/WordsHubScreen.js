// WORDS HUB SCREEN - "Pick a word activity". Inspo look: the pastel tile grid sits on the rounded pale sheet.
// "Spelling" opens the spelling game; the other tiles say "Coming soon".
// (Read Along is NOT here: it is English -> Sentences, its one way in.)
//
// Props: { navigation }

import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Text from '../../../shared/components/AppText';
import AppIcon from '../../../shared/components/AppIcon';
import Screen from '../../../shared/components/Screen';
import ChildHeader from '../../../shared/components/ChildHeader';
import ChildInstruction from '../../../shared/components/ChildInstruction';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import FadeInView from '../../../shared/components/FadeInView';
import Sheet from '../../../shared/components/Sheet';
import { DESIGN } from '../../../shared/theme/designConfig';
import { useIdleBob } from '../../../shared/utils/motion';
import { showComingSoon } from '../../../shared/utils/alerts';
import { usePreview } from '../../../app/store/usePreview';
import { PALETTE, COLORS, FONTS } from '../../../shared/theme/theme';

const ITEMS = [
  { title: 'Reading Helper', icon: 'glasses', tint: PALETTE.pastelGreen, screen: null },
  { title: 'Phonics', icon: 'volume-high', tint: PALETTE.pastelBlue, screen: null },
  { title: 'Spelling', icon: 'alphabetical-variant', tint: PALETTE.pastelLilac, screen: 'SpellingWords' },
  { title: 'Writing', icon: 'pencil', tint: PALETTE.pastelYellow, screen: null },
];

// The tile icon (a flat AppIcon, purple) bobs gently a few times (each tile a little later), then rests.
function BobbingIcon({ icon, index }) {
  const bob = useIdleBob({ height: 5, duration: 1400, cycles: 4, delay: 400 + index * 200 });
  return (
    <Animated.View style={bob}>
      <AppIcon name={icon} size={44} color={PALETTE.purple} />
    </Animated.View>
  );
}

export default function WordsHubScreen({ navigation }) {
  const { isPreview } = usePreview();
  function openItem(item) {
    if (item.screen) navigation.navigate(item.screen);
    else showComingSoon(item.title);
  }

  return (
    <Screen scroll mode="child">
      <View style={styles.body}>
        <ChildHeader title="English" onBack={() => navigation.goBack()}/>

        <View style={styles.instruction}>
          <ChildInstruction text="Pick a word activity" />
        </View>

        <Sheet>
        <View style={styles.grid}>
          {ITEMS.map((item, i) => (
            <FadeInView key={item.title} index={i} style={styles.tileWrap}>
            <AnimatedPressable
              onPress={() => openItem(item)}
              accessibilityLabel={item.title}
              style={[styles.tile, { backgroundColor: item.tint }]}
            >
              <BobbingIcon icon={item.icon} index={i} />
              <Text style={styles.tileTitle}>{item.title}</Text>
              {isPreview && !item.screen && (
                <View style={styles.soonTag}>
                  <Text style={styles.soonText}>Coming soon</Text>
                </View>
              )}
            </AnimatedPressable>
            </FadeInView>
          ))}
        </View>
        </Sheet>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  instruction: {
    marginTop: 15,
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tileWrap: {
    width: '48%',
    marginBottom: 13,
  },
  tile: {
    minHeight: 144,
    padding: 12,
    borderRadius: DESIGN.TILE_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soonTag: {
    marginTop: 8,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  soonText: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 12,
    color: COLORS.warmMuted,
  },
  tileIcon: {
    fontSize: 44,
    lineHeight: 54,
  },
  tileTitle: {
    marginTop: 9,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 17,
    lineHeight: 20,
    color: COLORS.heading,
    textAlign: 'center',
  },
});
