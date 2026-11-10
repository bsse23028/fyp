// EDIT PROFILE SCREEN - the hub for one child (opened from Parent Home / Settings).
//
// Each part of the profile is edited on its OWN small screen with its own Save:
//   Basics            nickname, age band, avatar, language
//   Areas of support  optional chips
//   Activities        which activities are switched on
//   Personalize stories  people, favourite things, hobbies, everyday world (its own step-by-step form)
// "Delete profile" removes the child.
//
// Route params: { childId }
// Props: { navigation, route }

import React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import Mascot from '../../shared/components/Mascot';
import Button from '../../shared/components/Button';
import { useChild } from '../../app/store/useChild';
import { goToParentHome } from '../../app/navigation/helpers';
import { getAvatar } from '../../shared/theme/avatars';
import { translate } from '../../shared/i18n/translate';
import { ageText } from '../../shared/utils/progress';
import { countStoryDetails } from '../../shared/utils/storyOptions';
import { COLORS, FONTS } from '../../shared/theme/theme';

export default function EditProfileScreen({ navigation, route }) {
  const { childProfiles, deleteChild } = useChild();
  const child = childProfiles.find((c) => c.id === route.params.childId) || null;

  if (!child) {
    return (
      <Screen mode="parent">
        <Text style={styles.heading}>Profile not found</Text>
        <View style={styles.spacer} />
        <Button title="Go back" onPress={() => goToParentHome(navigation)} />
      </Screen>
    );
  }

  const storyCount = countStoryDetails(child); // how many story details are filled in

  // One row per section: `summary` is the small grey line under the title.
  const sections = [
    {
      key: 'basics',
      icon: '🙂',
      title: 'Basics',
      summary: `${child.name} · ${ageText(child)} · ${child.language === 'ur' ? 'اردو' : 'English'}`,
    },
    {
      key: 'support',
      icon: '🧩',
      title: 'Areas of support',
      summary: (child.supports || []).length > 0 ? (child.supports || []).join(', ') : 'None chosen (optional)',
    },
    {
      key: 'modules',
      icon: '🎯',
      title: 'Activities',
      summary: `${(child.modules || []).length} switched on`,
    },
    {
      key: 'stories',
      icon: '✨',
      title: 'Personalize stories',
      summary: storyCount > 0 ? `${storyCount} details added` : 'Nothing added yet (optional)',
    },
  ];

  function confirmDelete() {
    Alert.alert(
      translate('Delete {name}?', { name: child.name }),
      translate('This removes the profile and all of its progress from this phone. It cannot be undone.'),
      [
        { text: translate('Cancel'), style: 'cancel' },
        {
          text: translate('Delete'),
          style: 'destructive',
          onPress: () => {
            deleteChild(child.id);
            goToParentHome(navigation);
          },
        },
      ]
    );
  }

  return (
    <Screen scroll mode="parent" avatar={child.avatar}>
      <View style={styles.body}>
        <Text style={styles.heading}>Edit profile</Text>

        <View style={styles.top}>
          <View style={[styles.avatarBox, { backgroundColor: getAvatar(child.avatar).color }]}>
            <Mascot size={64} avatar={child.avatar} />
          </View>
          <Text style={styles.name}>{child.name}</Text>
        </View>

        {sections.map((section) => (
          <Pressable
            key={section.key}
            onPress={() =>
              section.key === 'stories'
                ? navigation.navigate('PersonalizeStories', { childId: child.id })
                : navigation.navigate('EditChildSection', { childId: child.id, section: section.key })
            }
            accessibilityRole="button"
            style={styles.row}
          >
            <View style={styles.icon}>
              <Text style={styles.iconText}>{section.icon}</Text>
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{section.title}</Text>
              <Text style={styles.rowSummary} numberOfLines={1}>
                {section.summary}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}

        <View style={styles.spacer} />

        <Pressable onPress={confirmDelete} accessibilityRole="button" style={styles.delete}>
          <Text style={styles.deleteText}>Delete profile</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  heading: {
    fontFamily: FONTS.interBold,
    fontSize: 24,
    color: COLORS.text,
  },
  top: {
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 18,
  },
  avatarBox: {
    width: 104,
    height: 104,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: 10,
    fontFamily: FONTS.interBold,
    fontSize: 20,
    color: COLORS.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 21,
  },
  rowText: {
    flex: 1,
    marginHorizontal: 12,
  },
  rowTitle: {
    fontFamily: FONTS.interBold,
    fontSize: 15,
    color: COLORS.text,
  },
  rowSummary: {
    marginTop: 3,
    fontFamily: FONTS.interRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  chevron: {
    fontSize: 22,
    color: COLORS.primary,
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  delete: {
    alignSelf: 'center',
    marginTop: 10,
    padding: 8,
  },
  deleteText: {
    fontFamily: FONTS.interBold,
    fontSize: 13,
    color: COLORS.error,
  },
});
