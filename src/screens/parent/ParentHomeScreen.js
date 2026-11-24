// PARENT HOME SCREEN - the first screen after login (Parent Mode), in the inspo look:
//   top     "Good morning, Sarah 👋" + the big purple title "Who is learning today?" + the chosen child's buddy
//   sheet   (the rounded pale panel) this week's two numbers (pastel stat tiles), the "Open Child Mode"
//           hero card, the children as white cards with a letters progress bar (tap = choose, ⋯ = Edit profile /
//           Delete; progress is the Progress tab), and two pastel tiles: "Add a child" (mint) and "Explore KidBuddy" (peach).
//   FIRST-TIME parents also see a big blue "New to KidBuddy?" card at the top of the sheet (ExploreWelcomeCard)
//           until they explore once or tap "Not now" (remembered on the phone, KEYS.explored).
// Plan, Progress and Settings ("Me") are in the bottom bar (ParentTabBar); Log out is in Settings.
// (The old ☰ parent menu was removed on 2026-11-21.)
// The pieces are in ./components/ and shared/components/ (PageTitle, Sheet, StatTile, PastelTile).

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import FadeInView from '../../shared/components/FadeInView';
import PageTitle from '../../shared/components/PageTitle';
import Sheet from '../../shared/components/Sheet';
import StatTile from '../../shared/components/StatTile';
import PastelTile from '../../shared/components/PastelTile';
import Mascot from '../../shared/components/Mascot';
import OpenChildModeCard from './components/OpenChildModeCard';
import ChildList from './components/ChildList';
import ExploreWelcomeCard from './components/ExploreWelcomeCard';
import { KEYS, loadData, saveData } from '../../shared/utils/storage';
import ChildActionsMenu from './components/ChildActionsMenu';
import { useAuth } from '../../app/context/AuthContext';
import { useLanguage } from '../../app/context/LanguageContext';
import { useChild } from '../../app/store/useChild';
import { usePreview } from '../../app/store/usePreview';
import { goToChildHome, goToProfilePicker } from '../../app/navigation/helpers';
import { translate } from '../../shared/i18n/translate';
import { weekTotals } from '../../shared/utils/progress';
import { getGreeting } from '../../shared/utils/greeting';
import { CALM, FONTS, PALETTE } from '../../shared/theme/theme';

export default function ParentHomeScreen({ navigation }) {
  const { user } = useAuth();
  useLanguage(); // draw again when the language changes (the date is built in code)
  const { childProfiles, activeChild, deleteChild } = useChild();
  const { startPreview, endPreview } = usePreview();

  const [menuChild, setMenuChild] = useState(null);
  const [chosenId, setChosenId] = useState(null);

  // Has this phone tried Explore KidBuddy (or tapped Not now)? Until then the big welcome card shows on top.
  const [explored, setExplored] = useState(true); // true while loading, so the card never flashes
  useEffect(() => {
    loadData(KEYS.explored, false).then(setExplored);
  }, []);
  function hideWelcome() {
    setExplored(true);
    saveData(KEYS.explored, true);
  }

  // Parent Home is never part of the preview: switch it off whenever this screen comes into view.
  useFocusEffect(
    useCallback(() => {
      endPreview();
    }, [])
  );

  const realActive = activeChild && !activeChild.isDemo ? activeChild : null;
  const chosen =
    childProfiles.find((c) => c.id === chosenId) ||
    (realActive && childProfiles.find((c) => c.id === realActive.id)) ||
    childProfiles[0] ||
    null;

  const firstName = user && user.name ? user.name.trim().split(' ')[0] : 'there';

  let sessions = 0;
  let stars = 0;
  childProfiles.forEach((child) => {
    const week = weekTotals(child);
    sessions += week.sessions;
    stars += week.stars;
  });

  function confirmDelete(child) {
    Alert.alert(
      translate('Delete {name}?', { name: child.name }),
      translate('This deletes the profile and all of its progress from your account. It cannot be undone.'),
      [
        { text: translate('Cancel'), style: 'cancel' },
        { text: translate('Delete'), style: 'destructive', onPress: () => deleteChild(child.id) },
      ]
    );
  }

  function explore() {
    hideWelcome();
    startPreview();
    goToChildHome(navigation);
  }

  return (
    <Screen scroll mode="parent">
      <FadeInView index={0}>
        <PageTitle
          eyebrow={`${translate(getGreeting().text.replace('!', ''))}, ${firstName} 👋`}
          title="Who is learning today?"
          avatar={chosen ? chosen.avatar : undefined}
        />
      </FadeInView>

      <Sheet>
        {/* first-time parents: the big invitation to try Child Mode as Buddy (until explored once) */}
        {!explored ? (
          <FadeInView index={1}>
            <ExploreWelcomeCard onExplore={explore} onHide={hideWelcome} />
          </FadeInView>
        ) : null}

        <FadeInView index={1} style={styles.stats}>
          <StatTile value={sessions} label="Sessions this week" iconName="book-open-page-variant" color={PALETTE.pastelMint} />
          <StatTile value={stars} label="Stars this week" iconName="star" color={PALETTE.pastelYellow} />
        </FadeInView>

        {chosen && (
          <FadeInView index={2} style={styles.section}>
            <OpenChildModeCard child={chosen} onOpen={() => goToProfilePicker(navigation, chosen.id)} />
          </FadeInView>
        )}

        <FadeInView index={3} style={styles.section}>
          <Text style={styles.sectionTitle}>Your children</Text>
          {childProfiles.length === 0 ? (
            <Text style={styles.empty}>No child profiles yet. Add one to start learning together.</Text>
          ) : childProfiles.length > 1 ? (
            <Text style={styles.hint}>Tap a child to choose who learns next.</Text>
          ) : null}
          <ChildList
            profiles={childProfiles}
            selectedId={chosen ? chosen.id : null}
            onSelect={setChosenId}
            onMore={setMenuChild}
          />
        </FadeInView>

        {/* two pastel tiles, like "Add a new hobby" in the inspo */}
        <FadeInView index={4} style={styles.tiles}>
          <PastelTile
            title={childProfiles.length === 0 ? 'Add a child' : 'Add another child'}
            iconName="account-plus"
            color={PALETTE.pastelMint}
            onPress={() => navigation.navigate('CreateChildProfile')}
          >
            <View style={styles.tileMascot} pointerEvents="none">
              <Mascot size={58} avatar="panda" />
            </View>
          </PastelTile>
          <PastelTile
            title="Explore KidBuddy"
            subtitle="Try every activity. Nothing is saved."
            iconName="compass-outline"
            color={PALETTE.blushPeach}
            onPress={explore}
          />
        </FadeInView>
      </Sheet>

      <ChildActionsMenu
        child={menuChild}
        onClose={() => setMenuChild(null)}
        onEdit={(child) => navigation.navigate('EditProfile', { childId: child.id })}
        onDelete={confirmDelete}
      />

    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  section: {
    marginTop: 18,
  },
  tiles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  tileMascot: {
    position: 'absolute',
    end: 8,
    top: 8,
  },
  sectionTitle: {
    marginBottom: 6,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 18,
    color: CALM.heading,
  },
  hint: {
    marginBottom: 10,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 13,
    color: CALM.textSoft,
  },
  empty: {
    marginBottom: 12,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: CALM.textSoft,
  },
});
