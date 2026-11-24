// ENGLISH ACTIVITIES SCREEN - the activities of ONE proposal module of the English hub (data/englishSections.js):
//   Module 3 Words & Phonics          -> Alphabets · Phonics (Coming soon)
//   Module 4 Spelling & Letter Sounds -> Spelling · Bubble Pop · Match Pairs · Letter stories
// The same look as the hub: back + title, the buddy, the pale sheet with pastel tiles. A tile that is not
// built yet shows "Coming soon" and a tap only says so.
//
// Route params: { moduleNo }  (3 or 4)
// Props: { navigation, route }

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Screen from '../../../shared/components/Screen';
import FadeInView from '../../../shared/components/FadeInView';
import PastelTile from '../../../shared/components/PastelTile';
import Sheet from '../../../shared/components/Sheet';
import Tag from '../../../shared/components/Tag';
import BuddyCharacter from '../../../shared/components/BuddyCharacter';
import SectionHeader from '../components/SectionHeader';
import { BobbingIcon } from './EnglishHubScreen';
import { speakUi, stopSpeaking } from '../../../shared/utils/speech';
import { getEnglishModule } from '../data/englishSections';
import { CATEGORY, PALETTE } from '../../../shared/theme/theme';

const GREETING = 'Pick one!';

export default function EnglishActivitiesScreen({ navigation, route }) {
  const module = getEnglishModule(route.params && route.params.moduleNo);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', stopSpeaking);
    return unsubscribe;
  }, [navigation]);

  if (!module || !module.activities) return <Screen mode="child" />;

  function open(activity) {
    if (activity.screen) navigation.navigate(activity.screen);
    else speakUi('Coming soon!');
  }

  return (
    <Screen scroll mode="child">
      <View style={styles.body}>
        <SectionHeader title={module.title} onBack={() => navigation.goBack()} onSound={() => speakUi(GREETING)} />

        <View style={styles.greeting}>
          <BuddyCharacter size={84} bubbleSide message={GREETING} messageKey={1} messageSilent />
        </View>

        <Sheet>
          <FadeInView index={1} style={styles.grid}>
            {module.activities.map((activity, i) => {
              const accent = CATEGORY[activity.accent] || CATEGORY.reading;
              return (
                <PastelTile
                  key={activity.title}
                  title={activity.title}
                  subtitle={activity.subtitle}
                  iconNode={<BobbingIcon icon={activity.icon} index={i} color={accent.deep} />}
                  color={accent.pale}
                  minHeight={150}
                  onPress={() => open(activity)}
                >
                  {!activity.screen ? <Tag label="Coming soon" color={PALETTE.cloudWhite} style={styles.soon} /> : null}
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
  soon: {
    marginTop: 8,
  },
});
