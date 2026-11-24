// CREATE CHILD PROFILE SCREEN - ONE quick step (nickname, age, avatar, language).
//
// Everything else (areas of support, activities, story personalisation) is optional, so creating
// a profile stays short. A new child starts with ALL activities switched OFF
// (NEW_CHILD_ACTIVITIES_ON in shared/utils/childOptions.js).
//
// "Create profile" saves the child (addChild) and opens ChildSetup: three OPTIONAL extras
// (areas of support, activities, personalize stories) with "Skip for now". They can also be
// done later in Parent Home -> ⋯ -> Edit profile.
//
// The header logo shows the avatar being chosen, live (see `avatar` on <Screen>).
// There is NO permission step here: camera / microphone were already asked
// right after the account was created.
// It is used twice: for the first child after sign-up, and for "Add another child" in Parent Mode.
//
// What it holds (state): name, ageBand, avatar, language, `submitted`.
//
// Props: { navigation }

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import AuthHeading from '../../shared/components/AuthHeading';
import TextField from '../../shared/components/TextField';
import Chip from '../../shared/components/Chip';
import AvatarPicker from '../../shared/components/AvatarPicker';
import SegmentedControl from '../../shared/components/SegmentedControl';
import Button from '../../shared/components/Button';
import { useChild } from '../../app/store/useChild';
import { goToParentHome } from '../../app/navigation/helpers';
import { useChildOptions } from '../../app/store/useChildOptions';
import { EMPTY_STORY } from '../../shared/utils/storyOptions';
import { NEW_CHILD_ACTIVITIES_ON } from '../../shared/utils/childOptions';
import { DEFAULT_AVATAR } from '../../shared/theme/avatars';
import { globalStyles } from '../../shared/theme/globalStyles';
import { DESIGN } from '../../shared/theme/designConfig';
import { COLORS, FONTS } from '../../shared/theme/theme';

export default function CreateChildProfileScreen({ navigation }) {
  const { addChild } = useChild();
  const { ageBands, languages, defaultModules } = useChildOptions(); // lists from the server

  const [name, setName] = useState('');
  const [ageBand, setAgeBand] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [language, setLanguage] = useState('en');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const nameProblem = name.trim() ? '' : 'Enter your child’s nickname.';
  const ageProblem = ageBand ? '' : 'Choose an age band.';

  async function handleCreate() {
    setSubmitted(true);
    if (nameProblem || ageProblem) return;
    setSaving(true);
    // Saved on the server. If that fails, a pop-up explains why and we stay here.
    const child = await addChild({
      name: name.trim(),
      ageBand,
      avatar,
      language,
      supports: [],
      modules: NEW_CHILD_ACTIVITIES_ON ? defaultModules() : [], // all OFF by default
      story: EMPTY_STORY,
    });
    setSaving(false);
    if (!child) return;
    // next: the OPTIONAL extras (areas of support, activities, stories). In Explore mode nothing is
    // saved (no id), so it goes straight to Parent Home.
    if (child.id) navigation.replace('ChildSetup', { childId: child.id });
    else goToParentHome(navigation);
  }

  return (
    <Screen scroll avatar={avatar}>
      <View style={styles.body}>
        {/* the words on the left, the CHOSEN buddy (whole body) on the right: it changes when another
            buddy is picked below, so the parent sees the full buddy before saving */}
        <AuthHeading
          side
          avatar={avatar}
          mascotSize={DESIGN.CHILD_PREVIEW_MASCOT}
          title="Create child profile"
          subtitle="Just a few quick details. Next you can add more if you like (optional)."
        />

        <TextField
          label="Nickname"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Zara"
          autoCapitalize="words"
          returnKeyType="done"
          error={submitted ? nameProblem : ''}
          style={styles.firstField}
        />

        <Text style={[styles.label, globalStyles.fieldGap]}>Age band</Text>
        <View style={styles.chipRow}>
          {ageBands.map((band) => (
            <Chip key={band} label={band} selected={ageBand === band} onPress={() => setAgeBand(band)} />
          ))}
        </View>
        {submitted && ageProblem ? <Text style={styles.error}>{ageProblem}</Text> : null}

        <Text style={[styles.label, globalStyles.fieldGap]}>Choose an avatar</Text>
        <AvatarPicker selectedId={avatar} onSelect={setAvatar} />

        <Text style={[styles.label, globalStyles.fieldGap]}>Primary language</Text>
        <SegmentedControl options={languages} value={language} onChange={setLanguage} />

        {/* pushes the buttons to the bottom */}
        <View style={styles.spacer} />

        <View style={styles.buttons}>
          {/* Back is only there when this screen was opened from Parent Home */}
          {navigation.canGoBack() && (
            <Button title="Back" variant="secondary" onPress={() => navigation.goBack()} style={styles.backButton} />
          )}
          <Button title="Create profile" onPress={handleCreate} loading={saving} style={styles.nextButton} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  firstField: {
    marginTop: 20,
  },
  label: {
    marginBottom: 8,
    fontFamily: FONTS.interSemiBold,
    fontSize: 13,
    color: COLORS.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  error: {
    marginTop: 8,
    fontFamily: FONTS.interRegular,
    fontSize: 12,
    color: COLORS.error,
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
  },
  backButton: {
    flex: 1,
    marginEnd: 10,
  },
  nextButton: {
    flex: 2,
  },
});
