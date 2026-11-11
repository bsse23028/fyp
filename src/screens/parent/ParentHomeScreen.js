// PARENT HOME SCREEN - the first screen after login (Parent Mode, from Figma).
//
//   - "Good morning, Sarah 👋" (from the phone's clock) + today's date
//   - quick numbers for this week
//   - "Open Child Mode ->"  opens "Who is learning?"
//   - Plan · Progress · Settings buttons (there is no bottom bar any more)
//   - one card per child: View progress · Edit profile · Delete
//   - "Add another child"
//
// The app always opens here (when logged in), never straight in Child Mode.
//
// Props: { navigation }

import React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import Mascot from '../../shared/components/Mascot';
import Button from '../../shared/components/Button';
import { useAuth } from '../../app/context/AuthContext';
import { useLanguage } from '../../app/context/LanguageContext';
import { useChild } from '../../app/store/useChild';
import { goToProfilePicker, goToProgress } from '../../app/navigation/helpers';
import { getAvatar } from '../../shared/theme/avatars';
import { translate } from '../../shared/i18n/translate';
import { getGreeting } from '../../shared/utils/greeting';
import { ageText, lastActiveText, streakDays, weekTotals } from '../../shared/utils/progress';
import { COLORS, FONTS } from '../../shared/theme/theme';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// "Tuesday, 13 October 2026"
function dateText(date) {
  return `${translate(WEEKDAYS[date.getDay()])}, ${date.getDate()} ${translate(MONTHS[date.getMonth()])} ${date.getFullYear()}`;
}

// The three big buttons under "Open Child Mode".
const SHORTCUTS = [
  { label: 'Plan', icon: '🗂️', screen: 'ParentPlan' },
  { label: 'Progress', icon: '📈', screen: 'ParentProgress' },
  { label: 'Settings', icon: '⚙️', screen: 'ParentSettings' },
];

export default function ParentHomeScreen({ navigation }) {
  const { user } = useAuth();
  useLanguage(); // draw again when the language changes (the date is built in code)
  const { childProfiles, deleteChild } = useChild();

  const now = new Date();
  const firstName = user && user.name ? user.name.trim().split(' ')[0] : 'there';
  const greeting = getGreeting(now).text.replace('!', '');

  // Numbers for all children together.
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
      translate('This removes the profile and all of its progress from this phone. It cannot be undone.'),
      [
        { text: translate('Cancel'), style: 'cancel' },
        { text: translate('Delete'), style: 'destructive', onPress: () => deleteChild(child.id) }, // on the server; a pop-up explains any problem
      ]
    );
  }

  return (
    <Screen scroll mode="parent">
      <View style={styles.body}>
        <Text style={styles.date}>{dateText(now)}</Text>
        <Text style={styles.hello}>
          {greeting}, {firstName} 👋
        </Text>

        {/* quick numbers */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.primaryPale }]}>
              <Text style={styles.statEmoji}>📊</Text>
            </View>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>{sessions}</Text>
            <Text style={styles.statLabel}>Sessions this week</Text>
          </View>
          <View style={styles.stat}>
            <View style={[styles.statIcon, { backgroundColor: '#FFF7ED' }]}>
              <Text style={styles.statEmoji}>⭐</Text>
            </View>
            <Text style={[styles.statValue, { color: '#EA580C' }]}>{stars}</Text>
            <Text style={styles.statLabel}>Stars this week</Text>
          </View>
        </View>

        {childProfiles.length > 0 && (
          <Button title="Open Child Mode →" onPress={() => goToProfilePicker(navigation)} style={styles.openChild} />
        )}

        <View style={styles.shortcuts}>
          {SHORTCUTS.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => navigation.navigate(item.screen)}
              accessibilityRole="button"
              style={styles.shortcut}
            >
              <Text style={styles.shortcutIcon}>{item.icon}</Text>
              <Text style={styles.shortcutLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Your children</Text>

        {childProfiles.length === 0 && (
          <Text style={styles.empty}>No child profiles yet. Add one to start learning together.</Text>
        )}

        {childProfiles.map((child) => {
          const avatar = getAvatar(child.avatar);
          const streak = streakDays(child);
          const modules = child.modules || [];
          return (
            <View key={child.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.avatarBox, { backgroundColor: avatar.color }]}>
                  <Mascot size={42} avatar={child.avatar} />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.childName} numberOfLines={1}>
                    {child.name}
                  </Text>
                  <Text style={styles.childMeta}>
                    {ageText(child)} · Active {lastActiveText(child).toLowerCase()}
                  </Text>
                </View>
                <View style={styles.streak}>
                  <Text style={styles.streakText}>🔥 {streak}d</Text>
                </View>
              </View>

              <View style={styles.chips}>
                {modules.slice(0, 4).map((name) => (
                  <View key={name} style={styles.chip}>
                    <Text style={styles.chipText}>{name}</Text>
                  </View>
                ))}
                {modules.length > 4 && (
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>+{modules.length - 4}</Text>
                  </View>
                )}
              </View>

              <View style={styles.actions}>
                <Pressable onPress={() => goToProgress(navigation, child.id)} hitSlop={8}>
                  <Text style={styles.actionMain}>View progress →</Text>
                </Pressable>
                <View style={styles.actionRight}>
                  <Pressable onPress={() => navigation.navigate('EditProfile', { childId: child.id })} hitSlop={8}>
                    <Text style={styles.action}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => confirmDelete(child)} hitSlop={8}>
                    <Text style={styles.actionDelete}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })}

        <Pressable
          onPress={() => navigation.navigate('CreateChildProfile')}
          accessibilityRole="button"
          style={styles.add}
        >
          <Text style={styles.addPlus}>+</Text>
          <Text style={styles.addText}>{childProfiles.length === 0 ? 'Add a child' : 'Add another child'}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingBottom: 8,
  },
  date: {
    fontFamily: FONTS.interRegular,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  hello: {
    marginTop: 2,
    fontFamily: FONTS.interBold,
    fontSize: 24,
    color: COLORS.text,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  stat: {
    width: '48.5%',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  statIcon: {
    width: 36,
    height: 36,
    marginBottom: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statEmoji: {
    fontSize: 18,
  },
  statValue: {
    fontFamily: FONTS.interBold,
    fontSize: 26,
  },
  statLabel: {
    marginTop: 2,
    fontFamily: FONTS.interRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  openChild: {
    marginTop: 16,
  },
  shortcuts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  shortcut: {
    width: '31.5%',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  shortcutIcon: {
    fontSize: 22,
  },
  shortcutLabel: {
    marginTop: 5,
    fontFamily: FONTS.interSemiBold,
    fontSize: 12,
    color: COLORS.text,
  },
  sectionTitle: {
    marginTop: 22,
    marginBottom: 10,
    fontFamily: FONTS.interBold,
    fontSize: 16,
    color: COLORS.text,
  },
  empty: {
    marginBottom: 12,
    fontFamily: FONTS.interRegular,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textMuted,
  },
  card: {
    marginBottom: 12,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    marginHorizontal: 12,
  },
  childName: {
    fontFamily: FONTS.interBold,
    fontSize: 17,
    color: COLORS.text,
  },
  childMeta: {
    marginTop: 2,
    fontFamily: FONTS.interRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  streak: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
  },
  streakText: {
    fontFamily: FONTS.interBold,
    fontSize: 13,
    color: '#EA580C',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  chip: {
    marginEnd: 6,
    marginBottom: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: COLORS.primaryPale,
  },
  chipText: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 12,
    color: COLORS.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionRight: {
    flexDirection: 'row',
  },
  actionMain: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 13,
    color: COLORS.primary,
  },
  action: {
    marginStart: 18,
    fontFamily: FONTS.interMedium,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  actionDelete: {
    marginStart: 18,
    fontFamily: FONTS.interMedium,
    fontSize: 13,
    color: COLORS.error,
  },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
  },
  addPlus: {
    marginEnd: 8,
    fontFamily: FONTS.interRegular,
    fontSize: 22,
    color: COLORS.textMuted,
  },
  addText: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 15,
    color: COLORS.textMuted,
  },
});
