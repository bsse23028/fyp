// ENGLISH HUB SCREEN - the "Reading & Writing" group of Child Home, laid out as the FYP proposal's
// Modules 1-5 (data/englishSections.js):
//   1 Read-Along · 2 Reading Assist (Coming soon) · 3 Words & Phonics · 4 Spelling & Letter Sounds · 5 Handwriting
// A module with one activity opens it straight away (Read Along topics, Trace letters); a module with several
// opens its activity page (EnglishActivitiesScreen); one that is not built shows "Coming soon" and a tap
// only says so. Inspo look: the buddy says the question, then the pale sheet with a 2-column tile grid
// (each tile in its CATEGORY colour, its icon bobs a few times).

import React, { useEffect } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import AppIcon from '../../../shared/components/AppIcon';
import Screen from '../../../shared/components/Screen';
import FadeInView from '../../../shared/components/FadeInView';
import PastelTile from '../../../shared/components/PastelTile';
import Sheet from '../../../shared/components/Sheet';
import Tag from '../../../shared/components/Tag';
import BuddyCharacter from '../../../shared/components/BuddyCharacter';
import SectionHeader from '../components/SectionHeader';
import { speakUi, stopSpeaking } from '../../../shared/utils/speech';
import { useIdleBob } from '../../../shared/utils/motion';
import { ENGLISH_MODULES } from '../data/englishSections';
import { CATEGORY, CALM, CALM_RADIUS, PALETTE } from '../../../shared/theme/theme';

const GREETING = 'What do you want to learn?';

// The tile icon (a flat AppIcon) bobs gently a few times (each tile a little later), then rests.
export function BobbingIcon({ icon, index, color }) {
  const bob = useIdleBob({ height: 5, duration: 1400, cycles: 4, delay: 500 + index * 250 });
  return (
    <View style={styles.iconBox}>
      <Animated.View style={bob}>
        <AppIcon name={icon} size={34} color={color} />
      </Animated.View>
    </View>
  );
}

export default function EnglishHubScreen({ navigation }) {
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', stopSpeaking);
    return unsubscribe;
  }, [navigation]);

  function open(module) {
    if (module.screen) navigation.navigate(module.screen);
    else if (module.activities) navigation.navigate('EnglishActivities', { moduleNo: module.no });
    else speakUi('Coming soon!');
  }

  return (
    <Screen scroll mode="child">
      <View style={styles.body}>
        <SectionHeader title="Reading & Writing" onBack={() => navigation.goBack()} onSound={() => speakUi(GREETING)} />

        <View style={styles.greeting}>
          <BuddyCharacter size={84} bubbleSide message={GREETING} messageKey={1} messageSilent />
        </View>

        <Sheet>
          <FadeInView index={1} style={styles.grid}>
            {ENGLISH_MODULES.map((module, i) => {
              const accent = CATEGORY[module.accent] || CATEGORY.reading;
              const built = Boolean(module.screen || module.activities);
              return (
                <PastelTile
                  key={module.no}
                  title={module.title}
                  subtitle={module.subtitle}
                  iconNode={<BobbingIcon icon={module.icon} index={i} color={accent.deep} />}
                  color={accent.pale}
                  minHeight={150}
                  onPress={() => open(module)}
                >
                  {!built ? <Tag label="Coming soon" color={PALETTE.cloudWhite} style={styles.soon} /> : null}
                </PastelTile>
              );
            })}
          </FadeInView>
        </Sheet>
      </View>
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
  soon: {
    marginTop: 8,
  },
});
