// CHILD SETUP SCREEN - right after "Create profile": "{name}'s profile is ready!" and three OPTIONAL extras.
//
//   1. Areas of support      -> EditChildSection 'support' (with the diagnosis guide)
//   2. Activities            -> EditChildSection 'modules' (recommended from the areas first)
//   3. Personalize stories   -> PersonalizeStories (helps customise the child's stories and activities)
//
// Every card says "Optional" until something is added, then "Added". Each screen saves and comes back
// here. "Skip for now" (nothing added) / "Finish" opens Parent Home. Everything can be done later in Edit profile.
//
// Route params: { childId }
// Props: { navigation, route }

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import AuthHeading from '../../shared/components/AuthHeading';
import ProgressCard from '../../shared/components/ProgressCard';
import Tag from '../../shared/components/Tag';
import Button from '../../shared/components/Button';
import { useChild } from '../../app/store/useChild';
import { goToParentHome } from '../../app/navigation/helpers';
import { translate } from '../../shared/i18n/translate';
import { countStoryDetails } from '../../shared/utils/storyOptions';
import { DESIGN } from '../../shared/theme/designConfig';
import { CATEGORY, COLORS, FONTS, PALETTE } from '../../shared/theme/theme';

export default function ChildSetupScreen({ navigation, route }) {
  const { childProfiles } = useChild();
  const child = childProfiles.find((c) => c.id === route.params.childId) || null;

  if (!child) {
    return (
      <Screen>
        <Text style={styles.note}>Profile not found</Text>
        <Button title="Go to Parent Home" onPress={() => goToParentHome(navigation)} />
      </Screen>
    );
  }

  const supports = child.supports || [];
  const modules = child.modules || [];
  const storyCount = countStoryDetails(child);

  // the three optional extras: `done` = something was added
  const extras = [
    {
      key: 'support',
      icon: 'puzzle',
      colors: CATEGORY.calm,
      title: 'Areas of support',
      text: supports.length > 0 ? supports.map((s) => translate(s)).join(', ') : 'Where your child needs help. We use it to recommend activities.',
      done: supports.length > 0,
      open: () => navigation.navigate('EditChildSection', { childId: child.id, section: 'support' }),
    },
    {
      key: 'modules',
      icon: 'target',
      colors: CATEGORY.games,
      title: 'Activities',
      text:
        modules.length > 0
          ? translate('{n} switched on. Choose which ones your child can use.', { n: modules.length })
          : 'All are off for now. Switch on the ones your child can use.',
      done: modules.length > 0, // a new child starts with every activity off

      open: () => navigation.navigate('EditChildSection', { childId: child.id, section: 'modules' }),
    },
    {
      key: 'stories',
      icon: 'creation',
      colors: CATEGORY.reading,
      title: 'Personalize stories',
      text:
        storyCount > 0
          ? translate('{n} details added', { n: storyCount })
          : 'Familiar people, favourite things and places. This helps customise your child’s stories and activities.',
      done: storyCount > 0,
      open: () => navigation.navigate('PersonalizeStories', { childId: child.id }),
    },
  ];
  const anyDone = extras.some((e) => e.done);

  return (
    <Screen scroll avatar={child.avatar}>
      <View style={styles.body}>
        <AuthHeading
          side
          avatar={child.avatar}
          mascotSize={DESIGN.CHILD_PREVIEW_MASCOT}
          title={translate('{name}’s profile is ready!', { name: child.name })}
          subtitle="Want to set up a little more? Everything here is optional."
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            You can skip this and set it up later: Parent Home, tap ⋯ on the child, then Edit profile.
          </Text>
        </View>

        {extras.map((extra) => (
          <ProgressCard
            key={extra.key}
            iconName={extra.icon}
            iconColor={extra.colors.pale}
            iconTint={extra.colors.deep}
            title={extra.title}
            subtitle={extra.text}
            onPress={extra.open}
            right={
              <Tag
                label={extra.done ? 'Added' : 'Optional'}
                color={extra.done ? PALETTE.pastelMint : COLORS.primaryPale}
                textColor={extra.done ? PALETTE.mintDeep : PALETTE.purple}
              />
            }
          />
        ))}

        {/* pushes the buttons to the bottom */}
        <View style={styles.spacer} />

        {/* one button: "Skip for now" while nothing is added, "Finish" afterwards */}
        <Button title={anyDone ? 'Finish' : 'Skip for now'} onPress={() => goToParentHome(navigation)} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  note: {
    marginBottom: 16,
    fontFamily: FONTS.interSemiBold,
    fontSize: 14,
    color: COLORS.text,
  },
  infoBox: {
    marginTop: 18,
    marginBottom: 16,
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderRadius: 13,
    backgroundColor: COLORS.primaryPale,
  },
  infoText: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.primary,
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
});
