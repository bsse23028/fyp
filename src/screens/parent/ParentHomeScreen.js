// PARENT HOME SCREEN - the first screen after login (Parent Mode).
// Top to bottom: greeting + this week's numbers, the "Open Child Mode" hero card for the chosen
// child, the compact list of children (tap to choose, ⋯ for View progress / Edit / Delete),
// "Add another child" and the "Explore KidBuddy" preview card.
// Plan, Progress, Settings and Log out live in the drawer opened by ☰ in the header.
// The pieces are in ./components/.

import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import FadeInView from '../../shared/components/FadeInView';
import ParentGreeting from './components/ParentGreeting';
import OpenChildModeCard from './components/OpenChildModeCard';
import ChildList from './components/ChildList';
import ChildActionsMenu from './components/ChildActionsMenu';
import ExploreCard from './components/ExploreCard';
import ParentDrawer from './components/ParentDrawer';
import { useAuth } from '../../app/context/AuthContext';
import { useLanguage } from '../../app/context/LanguageContext';
import { useChild } from '../../app/store/useChild';
import { usePreview } from '../../app/store/usePreview';
import { goToChildHome, goToLogIn, goToProfilePicker, goToProgress } from '../../app/navigation/helpers';
import { translate } from '../../shared/i18n/translate';
import { weekTotals } from '../../shared/utils/progress';
import { CALM, FONTS } from '../../shared/theme/theme';

export default function ParentHomeScreen({ navigation }) {
  const { user, logOut } = useAuth();
  useLanguage(); // draw again when the language changes (the date is built in code)
  const { childProfiles, activeChild, deleteChild } = useChild();
  const { startPreview, endPreview } = usePreview();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuChild, setMenuChild] = useState(null);
  const [chosenId, setChosenId] = useState(null);

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

  const openDrawer = useCallback(() => setDrawerOpen(true), []);

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

  function confirmLogOut() {
    Alert.alert(translate('Log out?'), translate('You can log back in with your email and password.'), [
      { text: translate('Cancel'), style: 'cancel' },
      {
        text: translate('Log out'),
        style: 'destructive',
        onPress: async () => {
          await logOut();
          goToLogIn(navigation);
        },
      },
    ]);
  }

  function explore() {
    startPreview();
    goToChildHome(navigation);
  }

  return (
    <Screen scroll mode="parent" background={CALM.background} onMenuPress={openDrawer}>
      <View style={styles.body}>
        <FadeInView index={0}>
          <ParentGreeting name={firstName} sessions={sessions} stars={stars} />
        </FadeInView>

        {chosen && (
          <FadeInView index={1} style={styles.section}>
            <OpenChildModeCard child={chosen} onOpen={() => goToProfilePicker(navigation, chosen.id)} />
          </FadeInView>
        )}

        <FadeInView index={2} style={styles.section}>
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
            onAdd={() => navigation.navigate('CreateChildProfile')}
          />
        </FadeInView>

        <FadeInView index={3} style={styles.section}>
          <ExploreCard onPress={explore} />
        </FadeInView>
      </View>

      <ChildActionsMenu
        child={menuChild}
        onClose={() => setMenuChild(null)}
        onProgress={(child) => goToProgress(navigation, child.id)}
        onEdit={(child) => navigation.navigate('EditProfile', { childId: child.id })}
        onDelete={confirmDelete}
      />

      <ParentDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        parentName={user ? user.name : ''}
        onNavigate={(screen) => navigation.navigate(screen)}
        onLogout={confirmLogOut}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingTop: 6,
    paddingBottom: 12,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    marginBottom: 6,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 18,
    color: CALM.text,
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
