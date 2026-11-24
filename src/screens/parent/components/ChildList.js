// CHILD LIST - "Your children" on Parent Home: one white card per child, the SAME card as on the Me page:
// the buddy, the name, "age · language · {n} activities on" and a ⋯ button (Edit / Delete).
// Tap a card = choose that child (purple edge). (No letters / progress bar here: progress is on the
// Progress tab, and only for the activities the child is enrolled in.)
// Props: { profiles, selectedId, onSelect(id), onMore(child) }

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../../../shared/components/AppText';
import Mascot from '../../../shared/components/Mascot';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import ProgressCard from '../../../shared/components/ProgressCard';
import { getAvatar } from '../../../shared/theme/avatars';
import { translate } from '../../../shared/i18n/translate';
import { ageText } from '../../../shared/utils/progress';
import { CALM, CALM_RADIUS, FONTS } from '../../../shared/theme/theme';

// "Age 7–9 · English · 3 activities on" (also used on the Me page)
export function childLine(child) {
  const language = child.language === 'ur' ? 'اردو' : 'English';
  return `${ageText(child)} · ${language} · ${translate('{n} activities on', { n: (child.modules || []).length })}`;
}

function ChildRow({ child, selected, onSelect, onMore }) {
  const avatar = getAvatar(child.avatar);

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
      subtitle={childLine(child)}
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
