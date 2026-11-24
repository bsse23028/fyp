// LEARNING GROUP SCREEN - one Child Home group (Speech Sounds, Feelings & Stories, Numbers, My Day ...):
// the big title with the buddy, then the group's modules from the FYP proposal as pastel tiles
// (only the ones the parent switched on for this child).
// A module that is built opens its screen; one that is not built yet shows a "Coming soon" tag, and a tap
// only says "Coming soon!" (no pop-up). The groups and their modules are in learningGroups.js.
//
// Route params: { groupId }  (an id from LEARNING_GROUPS)
// Props: { navigation, route }

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Screen from '../../shared/components/Screen';
import PageTitle from '../../shared/components/PageTitle';
import Sheet from '../../shared/components/Sheet';
import PastelTile from '../../shared/components/PastelTile';
import Tag from '../../shared/components/Tag';
import AppIcon from '../../shared/components/AppIcon';
import AnimatedPressable from '../../shared/components/AnimatedPressable';
import { speakUi } from '../../shared/utils/speech';
import { useDirection } from '../../shared/utils/direction';
import { CALM_SHADOW, CALM_SIZES, PALETTE } from '../../shared/theme/theme';
import { getGroup, moduleScreen } from './learningGroups';
import { useChild } from '../../app/store/useChild';
import { activityOn } from '../../shared/utils/childActivities';

export default function LearningGroupScreen({ navigation, route }) {
  const { isRTL } = useDirection();
  const { activeChild } = useChild();
  const group = getGroup(route.params && route.params.groupId);
  // only the modules the parent switched on for this child
  const items = group ? group.modules.filter((item) => activityOn(activeChild, item.no)) : [];

  if (!group) return <Screen mode="child" />;

  function open(item) {
    const screen = moduleScreen(item);
    if (screen) navigation.navigate(screen);
    else speakUi('Coming soon!');
  }

  return (
    <Screen scroll mode="child">
      <AnimatedPressable onPress={() => navigation.goBack()} hitSlop={6} accessibilityLabel="Back" style={[styles.back, CALM_SHADOW.soft]}>
        <AppIcon name={isRTL ? 'arrow-right' : 'arrow-left'} size={28} color={PALETTE.purple} />
      </AnimatedPressable>

      <PageTitle eyebrow={group.label} title="What shall we try?" />

      <Sheet>
        <View style={styles.grid}>
          {items.map((item) => {
            const built = Boolean(moduleScreen(item));
            return (
              <PastelTile
                key={item.no}
                title={item.title}
                subtitle={item.subtitle}
                iconName={item.iconName}
                iconColor={group.accent.deep}
                color={group.accent.pale}
                minHeight={150}
                onPress={() => open(item)}
              >
                {!built ? <Tag label="Coming soon" color={PALETTE.cloudWhite} style={styles.soon} /> : null}
              </PastelTile>
            );
          })}
        </View>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    width: CALM_SIZES.tap,
    height: CALM_SIZES.tap,
    borderRadius: CALM_SIZES.tap / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.cloudWhite,
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
