// CHILD LIST - the children on Parent Home, as white inspo-style cards (ProgressCard): the buddy on
// the left, the name, one line, and a progress bar of the child's progress in the first learning module
// (English: letters learned out of 26). The numbers come from the modules' public door (selectModuleProgress).
// Tap a card to choose that child for the hero card; ⋯ opens the per-child actions menu.
// ("Add a child" is a pastel tile on Parent Home itself.)

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import Text from '../../../shared/components/AppText';
import Mascot from '../../../shared/components/Mascot';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import ProgressCard from '../../../shared/components/ProgressCard';
import { getAvatar } from '../../../shared/theme/avatars';
import { ageText } from '../../../shared/utils/progress';
import { sameProgress, selectModuleProgress } from '../../../modules';
import { CALM, CALM_RADIUS, FONTS, PALETTE } from '../../../shared/theme/theme';

function ChildRow({ child, selected, onSelect, onMore }) {
  const avatar = getAvatar(child.avatar);
  const progress = useSelector((state) => selectModuleProgress(state, child.id), sameProgress);
  const main = progress[0]; // the first module that reports progress (English)

  return (
    <ProgressCard
      onPress={onSelect}
      selected={selected}
      left={
        <View style={[styles.avatar, { backgroundColor: avatar.color }]}>
          <Mascot size={42} avatar={child.avatar} />
        </View>
      }
      title={child.name}
      subtitle={main ? `${ageText(child)} · ${main.text}` : ageText(child)}
      progress={main ? main.done / main.total : undefined}
      barColor={PALETTE.sunny}
      right={
        <AnimatedPressable onPress={onMore} hitSlop={6} accessibilityLabel="More options" style={styles.more}>
          <Text style={styles.moreText}>⋯</Text>
        </AnimatedPressable>
      }
    />
  );
}

export default function ChildList({ profiles, selectedId, onSelect, onMore }) {
  return (
    <View>
      {profiles.map((child) => (
        <ChildRow
          key={child.id}
          child={child}
          selected={child.id === selectedId}
          onSelect={() => onSelect(child.id)}
          onMore={() => onMore(child)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  more: {
    width: 48,
    height: 48,
    borderRadius: CALM_RADIUS.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 24,
    lineHeight: 28,
    color: CALM.textSoft,
  },
});
