// SCREEN - the wrapper every screen uses.
//
// It gives each screen: safe area (phone buttons), the left/right padding, and tells
// the ONE fixed header (FixedHeader.js) which buttons to show.
//
//   <Screen>                 -> FIXED screen. Never scrolls. Used for the
//                               welcome and onboarding screens.
//   <Screen scroll>          -> FORM screen. Fits on the phone normally, but
//                               can scroll when the keyboard is open.
//   <Screen scroll footerMascot>  -> also puts a small Buddy at the bottom.
//   <Screen avatar="wolf">   -> preview an avatar in the header before saving.
//
// MODES (what the screen belongs to):
//   mode="child"   Child Mode: 🏠 Home and 🔒 Parent buttons in the header, and tapping
//                  the logo opens "My Buddy".
//   mode="parent"  Parent Mode: a 🏠 Home button in the header (back to Parent Home).
//   (no mode)      login, sign-up, create profile ... just the header.
//
// There is no bottom bar any more: everything is in the header.
//
// The phone's status bar (time, battery) is kept visible by the <StatusBar> inside.
//
// Inside, give your own content `flex: 1` and use a spacer View with
// `flex: 1` to push things (like buttons) to the bottom.

import React, { useLayoutEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import Mascot from './Mascot';
import { useHeaderConfig } from '../../app/context/HeaderContext';
import { COLORS, SPACING } from '../theme/theme';

export default function Screen({
  children,
  scroll = false,
  footerMascot = false,
  mode,
  avatar,
  contentStyle,
  scrollRef, // optional: lets a screen scroll itself back to the top
}) {
  const route = useRoute();
  const { setConfig, removeConfig } = useHeaderConfig();

  // The header is NOT drawn here any more: it is one fixed header above the navigator
  // (see FixedHeader.js). This screen only tells it what to show.
  useLayoutEffect(() => {
    setConfig(route.key, { mode, avatar });
  }, [route.key, mode, avatar]);

  useLayoutEffect(() => {
    return () => removeConfig(route.key);
  }, [route.key]);

  return (
    <View style={styles.root}>
      {/* edges: no "top" - the fixed header above the navigator already covers the notch */}
      <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
        {scroll ? (
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={[styles.scrollContent, contentStyle]}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              bounces={false}
              overScrollMode="never"
            >
              <View style={styles.flex}>{children}</View>
              {footerMascot && (
                <View style={styles.footer}>
                  <Mascot size={64} avatar={avatar} />
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        ) : (
          <View style={[styles.fixedContent, contentStyle]}>{children}</View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  flex: {
    flex: 1,
  },
  // FORM screens: flexGrow makes the content at least as tall as the screen,
  // so the "spacer" trick works, but it only scrolls if it is really too tall.
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.small,
    paddingBottom: SPACING.medium,
  },
  // FIXED screens: no ScrollView at all, so they can never scroll.
  fixedContent: {
    flex: 1,
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.small,
    paddingBottom: SPACING.medium,
  },
  footer: {
    alignItems: 'center',
    paddingTop: SPACING.medium,
  },
});
