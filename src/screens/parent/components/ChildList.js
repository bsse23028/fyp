// CHILD LIST - the compact list of children on Parent Home (avatar + name + one line).
// Tap a row to choose that child for the hero card; ⋯ opens the per-child actions menu.
// Ends with the dashed "Add another child" row.

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../../../shared/components/AppText';
import Mascot from '../../../shared/components/Mascot';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import { getAvatar } from '../../../shared/theme/avatars';
import { ageText, lastActiveText } from '../../../shared/utils/progress';
import { CALM, CALM_RADIUS, CALM_SIZES, FONTS } from '../../../shared/theme/theme';

function ChildRow({ child, selected, onSelect, onMore }) {
  const avatar = getAvatar(child.avatar);

  return (
    <AnimatedPressable
      onPress={onSelect}
      accessibilityLabel={child.name}
      accessibilityState={{ selected }}
      style={[styles.row, selected && styles.rowSelected]}
    >
      <View style={[styles.avatar, { backgroundColor: avatar.color }]}>
        <Mascot size={38} avatar={child.avatar} />
      </View>
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {child.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {ageText(child)} · Active {lastActiveText(child).toLowerCase()}
        </Text>
      </View>
      {selected ? <Text style={styles.check}>✓</Text> : null}
      <AnimatedPressable onPress={onMore} hitSlop={6} accessibilityLabel="More options" style={styles.more}>
        <Text style={styles.moreText}>⋯</Text>
      </AnimatedPressable>
    </AnimatedPressable>
  );
}

export default function ChildList({ profiles, selectedId, onSelect, onMore, onAdd }) {
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

      <AnimatedPressable onPress={onAdd} style={styles.add}>
        <Text style={styles.addPlus}>+</Text>
        <Text style={styles.addText}>{profiles.length === 0 ? 'Add a child' : 'Add another child'}</Text>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
    paddingStart: 8,
    paddingEnd: 4,
    borderRadius: CALM_RADIUS.medium,
    borderWidth: 2,
    borderColor: CALM.line,
    backgroundColor: CALM.surface,
  },
  rowSelected: {
    borderColor: CALM.primary,
    backgroundColor: CALM.primaryPale,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: CALM_RADIUS.small,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    flex: 1,
    marginHorizontal: 12,
  },
  name: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 17,
    color: CALM.text,
  },
  meta: {
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 12,
    color: CALM.textSoft,
  },
  check: {
    marginEnd: 4,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 18,
    color: CALM.primaryDark,
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
  add: {
    minHeight: CALM_SIZES.tap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: CALM_RADIUS.medium,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: CALM.line,
  },
  addPlus: {
    marginEnd: 8,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 22,
    color: CALM.textSoft,
  },
  addText: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 16,
    color: CALM.textSoft,
  },
});
