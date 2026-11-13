// OPEN CHILD MODE CARD - the hero card of Parent Home for the chosen child: Buddy, name,
// age · last active · streak, their activities, and one big "Open Child Mode" button.

import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Text from '../../../shared/components/AppText';
import Mascot from '../../../shared/components/Mascot';
import SoftButton from '../../../shared/components/SoftButton';
import { getAvatar } from '../../../shared/theme/avatars';
import { useIdleBob } from '../../../shared/utils/motion';
import { ageText, lastActiveText, streakDays } from '../../../shared/utils/progress';
import { CALM, CALM_RADIUS, CALM_SHADOW, FONTS } from '../../../shared/theme/theme';

export default function OpenChildModeCard({ child, onOpen }) {
  const avatar = getAvatar(child.avatar);
  const bob = useIdleBob({ height: 5 });
  const modules = child.modules || [];
  const streak = streakDays(child);

  return (
    <View style={[styles.card, CALM_SHADOW.lifted]}>
      <View style={styles.top}>
        <View style={[styles.mascotBox, { backgroundColor: avatar.color }]}>
          <Animated.View style={bob}>
            <Mascot size={78} avatar={child.avatar} />
          </Animated.View>
        </View>

        <View style={styles.info}>
          <Text style={styles.eyebrow}>Ready to learn</Text>
          <Text style={styles.name} numberOfLines={1}>
            {child.name}
          </Text>
          <Text style={styles.meta} numberOfLines={2}>
            {ageText(child)} · Active {lastActiveText(child).toLowerCase()}
          </Text>
          <View style={styles.streak}>
            <Text style={styles.streakText}>🔥 {streak}d</Text>
          </View>
        </View>
      </View>

      {modules.length > 0 && (
        <View style={styles.chips}>
          {modules.slice(0, 3).map((name) => (
            <View key={name} style={styles.chip}>
              <Text style={styles.chipText}>{name}</Text>
            </View>
          ))}
          {modules.length > 3 && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>+{modules.length - 3}</Text>
            </View>
          )}
        </View>
      )}

      <SoftButton title="Open Child Mode" icon="🌈" onPress={onOpen} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: CALM_RADIUS.xl,
    backgroundColor: CALM.surface,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mascotBox: {
    width: 96,
    height: 96,
    borderRadius: CALM_RADIUS.large,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  info: {
    flex: 1,
    marginStart: 14,
    alignItems: 'flex-start',
  },
  eyebrow: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 13,
    color: CALM.primaryDark,
  },
  name: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 24,
    color: CALM.text,
  },
  meta: {
    marginTop: 2,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 13,
    color: CALM.textSoft,
  },
  streak: {
    marginTop: 6,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: CALM_RADIUS.pill,
    backgroundColor: CALM.coralPale,
  },
  streakText: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 13,
    color: CALM.text,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },
  chip: {
    marginEnd: 6,
    marginBottom: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: CALM_RADIUS.pill,
    backgroundColor: CALM.primaryPale,
  },
  chipText: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 12,
    color: CALM.primaryDark,
  },
  button: {
    marginTop: 14,
    minHeight: 60,
  },
});
