// PARENT PROFILE SCREEN - "My account" (opened from Parent Settings), in the inspo detail look:
// a Soft Pink top (DetailHeader with the bunny, name and email) and the pale sheet below.
//
//   - edit the parent's name
//   - the email (shown, cannot be changed here)
//   - Change password  -> ChangePasswordScreen (old password + email code)
//   (The Parent PIN is NOT here: it is Settings -> Safety, its one way in.)
//
// Props: { navigation }

import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import DetailHeader from '../../shared/components/DetailHeader';
import Sheet from '../../shared/components/Sheet';
import ProgressCard from '../../shared/components/ProgressCard';
import TextField from '../../shared/components/TextField';
import Button from '../../shared/components/Button';
import { useAuth } from '../../app/context/AuthContext';
import { translate } from '../../shared/i18n/translate';
import { nameError } from '../../shared/utils/validation';
import { CATEGORY, COLORS, FONTS } from '../../shared/theme/theme';

export default function ParentProfileScreen({ navigation }) {
  const { user, updateName } = useAuth();

  const [name, setName] = useState(user ? user.name : '');
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const nameProblem = nameError(name);
  const changed = user && name.trim() !== user.name;

  async function handleSaveName() {
    setSubmitted(true);
    if (nameProblem) return;
    try {
      await updateName(name); // saved on the server
      setSaved(true);
    } catch (err) {
      Alert.alert(translate('Could not save'), translate(err.message));
    }
  }

  return (
    <Screen scroll mode="parent">
      <DetailHeader tag="My account" avatar="rabbit" title={user ? user.name : 'Parent'} caption={user ? user.email : ''} />

      <Sheet>
        <Text style={styles.sectionTitle}>Your name</Text>
        <TextField
          label="Your name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            setSaved(false);
          }}
          placeholder="Full name"
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={handleSaveName}
          error={submitted ? nameProblem : ''}
        />
        {changed || saved ? (
          <Button
            title={saved ? 'Saved ✓' : 'Save name'}
            variant={saved ? 'secondary' : 'primary'}
            onPress={handleSaveName}
            style={styles.saveName}
          />
        ) : null}
        <Text style={styles.note}>
          {translate('Your email ({email}) cannot be changed here.', { email: user ? user.email : '' })}
        </Text>

        <Text style={[styles.sectionTitle, styles.security]}>Security</Text>
        <ProgressCard
          iconName="key"
          iconColor={CATEGORY.games.pale}
          iconTint={CATEGORY.games.deep}
          title="Change password"
          subtitle="Needs your old password and a code sent to your email."
          onPress={() => navigation.navigate('ChangePassword')}
          right={<Text style={styles.chevron}>›</Text>}
        />
      </Sheet>

    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: 6,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 18,
    color: COLORS.heading,
  },
  security: {
    marginTop: 22,
    marginBottom: 10,
  },
  saveName: {
    marginTop: 12,
  },
  note: {
    marginTop: 10,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textMuted,
  },
  chevron: {
    marginHorizontal: 6,
    fontSize: 24,
    color: COLORS.primary,
  },
});
