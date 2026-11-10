// CREATE CHILD PROFILE SCREEN - ONE quick step (nickname, age, avatar, language).
//
// Everything else (areas of support, activities, story personalisation) is optional and
// lives in  Parent Home -> Edit -> Edit profile, so creating a profile is as short
// as possible. A new child starts with the usual activities switched on.
//
// "Create profile" saves the child (addChild) and opens Parent Home. The parent then
// taps "Open Child Mode" to let the child start.
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
import { AGE_BANDS, LANGUAGES, defaultModules } from '../../shared/utils/childOptions';
import { EMPTY_STORY } from '../../shared/utils/storyOptions';
import { DEFAULT_AVATAR } from '../../shared/theme/avatars';
import { globalStyles } from '../../shared/theme/globalStyles';
import { COLORS, FONTS } from '../../shared/theme/theme';

export default function CreateChildProfileScreen({ navigation }) {
  const { addChild } = useChild();

  const [name, setName] = useState('');
  const [ageBand, setAgeBand] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [language, setLanguage] = useState('en');
  const [submitted, setSubmitted] = useState(false);

  const nameProblem = name.trim() ? '' : 'Enter your child’s nickname.';
  const ageProblem = ageBand ? '' : 'Choose an age band.';

  function handleCreate() {
    setSubmitted(true);
    if (nameProblem || ageProblem) return;
    addChild({
      name: name.trim(),
      ageBand,
      avatar,
      language,
      supports: [],
      modules: defaultModules(),
      story: EMPTY_STORY,
    });
    goToParentHome(navigation);
  }

  return (
    <Screen scroll avatar={avatar}>
      <View style={styles.body}>
        <AuthHeading
          title="Create child profile"
          subtitle="Just a few quick details. You can add more later in Edit profile."
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
          {AGE_BANDS.map((band) => (
            <Chip key={band} label={band} selected={ageBand === band} onPress={() => setAgeBand(band)} />
          ))}
        </View>
        {submitted && ageProblem ? <Text style={styles.error}>{ageProblem}</Text> : null}

        <Text style={[styles.label, globalStyles.fieldGap]}>Choose an avatar</Text>
        <AvatarPicker selectedId={avatar} onSelect={setAvatar} />

        <Text style={[styles.label, globalStyles.fieldGap]}>Primary language</Text>
        <SegmentedControl options={LANGUAGES} value={language} onChange={setLanguage} />

        {/* pushes the buttons to the bottom */}
        <View style={styles.spacer} />

        <View style={styles.buttons}>
          {/* Back is only there when this screen was opened from Parent Home */}
          {navigation.canGoBack() && (
            <Button title="Back" variant="secondary" onPress={() => navigation.goBack()} style={styles.backButton} />
          )}
          <Button title="Create profile" onPress={handleCreate} style={styles.nextButton} />
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
