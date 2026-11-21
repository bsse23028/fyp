// EDIT PROFILE SCREEN - the hub for one child (opened from Parent Home / Settings), in the inspo detail look:
// a Soft Pink top (DetailHeader: tag, the buddy, name, age pill) and the pale sheet with one card per part.
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
import DetailHeader from '../../shared/components/DetailHeader';
import Sheet from '../../shared/components/Sheet';
import ProgressCard from '../../shared/components/ProgressCard';
import Button from '../../shared/components/Button';
import { useChild } from '../../app/store/useChild';
import { goToParentHome } from '../../app/navigation/helpers';
import { translate } from '../../shared/i18n/translate';
import { ageText } from '../../shared/utils/progress';
import { countStoryDetails } from '../../shared/utils/storyOptions';
import { CATEGORY, COLORS, FONTS } from '../../shared/theme/theme';

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
      color: CATEGORY.art.pale,
      tint: CATEGORY.art.deep,
      icon: 'emoticon-happy-outline',
      title: 'Basics',
      summary: `${child.name} · ${ageText(child)} · ${child.language === 'ur' ? 'اردو' : 'English'}`,
    },
    {
      key: 'support',
      color: CATEGORY.calm.pale,
      tint: CATEGORY.calm.deep,
      icon: 'puzzle',
      title: 'Areas of support',
      summary: (child.supports || []).length > 0 ? (child.supports || []).join(', ') : 'None chosen (optional)',
    },
    {
      key: 'modules',
      color: CATEGORY.games.pale,
      tint: CATEGORY.games.deep,
      icon: 'target',
      title: 'Activities',
      summary: `${(child.modules || []).length} switched on`,
    },
    {
      key: 'stories',
      color: CATEGORY.reading.pale,
      tint: CATEGORY.reading.deep,
      icon: 'creation',
      title: 'Personalize stories',
      summary: storyCount > 0 ? `${storyCount} details added` : 'Nothing added yet (optional)',
    },
  ];

  function confirmDelete() {
    Alert.alert(
      translate('Delete {name}?', { name: child.name }),
      translate('This deletes the profile and all of its progress from your account. It cannot be undone.'),
      [
        { text: translate('Cancel'), style: 'cancel' },
        {
          text: translate('Delete'),
          style: 'destructive',
          // Deleted on the server. If that fails, a pop-up explains why and we stay here.
          onPress: async () => {
            if (await deleteChild(child.id)) goToParentHome(navigation);
          },
        },
      ]
    );
  }

  return (
    <Screen scroll mode="parent" avatar={child.avatar}>
      <DetailHeader
        tag="Child profile"
        avatar={child.avatar}
        title={child.name}
        pill={ageText(child)}
        caption={child.language === 'ur' ? 'اردو' : 'English'}
      />

      <Sheet>
        <Text style={styles.sectionTitle}>Edit profile</Text>
        {sections.map((section) => (
          <ProgressCard
            key={section.key}
            iconName={section.icon}
            iconColor={section.color}
            iconTint={section.tint}
            title={section.title}
            subtitle={section.summary}
            onPress={() =>
              section.key === 'stories'
                ? navigation.navigate('PersonalizeStories', { childId: child.id })
                : navigation.navigate('EditChildSection', { childId: child.id, section: section.key })
            }
            right={<Text style={styles.chevron}>›</Text>}
          />
        ))}

        <View style={styles.spacer} />

        <Pressable onPress={confirmDelete} accessibilityRole="button" style={styles.delete}>
          <Text style={styles.deleteText}>Delete profile</Text>
        </Pressable>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 24,
    color: COLORS.heading,
  },
  sectionTitle: {
    marginBottom: 10,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 18,
    color: COLORS.heading,
  },
  chevron: {
    marginHorizontal: 6,
    fontSize: 24,
    color: COLORS.primary,
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  delete: {
    alignSelf: 'center',
    marginTop: 10,
    minHeight: 48,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  deleteText: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 14,
    color: COLORS.error,
  },
});
