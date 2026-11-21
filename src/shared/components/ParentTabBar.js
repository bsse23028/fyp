// PARENT TAB BAR - the bottom bar of Parent Mode (Home · Plan · Progress · Me), in the inspo look:
// a pale lilac bar with rounded top corners; the chosen tab is coral, the others purple.
// It lives under the navigator (AppNavigator.js), so it stays still while the screens slide.
// It only shows on the four tab screens (app/navigation/parentTabs.js) and never in Child Mode.
//
// Moving between tabs: Home always goes BACK to Parent Home (no pile of screens), and from one
// tab screen to another the screen is swapped (replace), so "back" still leads to Parent Home.

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Text from './AppText';
import { navigationRef, useCurrentRouteKey } from '../../app/navigation/navigationRef';
import { PARENT_TABS, isParentTabScreen } from '../../app/navigation/parentTabs';
import { DESIGN } from '../theme/designConfig';
import { FONTS, PALETTE } from '../theme/theme';

export default function ParentTabBar() {
  useCurrentRouteKey(); // draw again whenever the screen changes
  const route = navigationRef.isReady() ? navigationRef.getCurrentRoute() : null;
  const current = route ? route.name : '';

  if (!isParentTabScreen(current)) return null;

  function open(screen) {
    if (screen === current) return;
    if (screen === 'ParentHome') navigationRef.navigate('ParentHome');
    else if (current !== 'ParentHome') navigationRef.dispatch(StackActions.replace(screen));
    else navigationRef.navigate(screen);
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.bar}>
      <View style={styles.row}>
        {PARENT_TABS.map((tab) => {
          const on = tab.screen === current;
          const color = on ? PALETTE.coralDeep : PALETTE.purple;
          return (
            <Pressable
              key={tab.screen}
              onPress={() => open(tab.screen)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={tab.label}
              style={styles.tab}
            >
              <Ionicons name={on ? tab.iconOn : tab.icon} size={DESIGN.TAB_ICON} color={color} />
              <Text style={[styles.label, { color }]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: PALETTE.paleLilac,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: PALETTE.deepPlum,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -3 },
    elevation: 10,
  },
  row: {
    height: DESIGN.TAB_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 3,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 12,
  },
});
