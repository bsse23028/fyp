// PARENT PROFILE SCREEN - "My account" (opened from Parent Settings).
//
//   - edit the parent's name
//   - the email (shown, cannot be changed here)
//   - Change password  -> ChangePasswordScreen (old password + email code)
//   - Parent PIN       -> first time: "Create PIN"; after that: "Update PIN"
//                         (UpdatePinScreen: old PIN + email code, like the password)
//
// Props: { navigation }

import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import TextField from '../../shared/components/TextField';
import Button from '../../shared/components/Button';
import PinModal from '../../shared/components/PinModal';
import { useAuth } from '../../app/context/AuthContext';
import { translate } from '../../shared/i18n/translate';
import { nameError } from '../../shared/utils/validation';
import { COLORS, FONTS } from '../../shared/theme/theme';

export default function ParentProfileScreen({ navigation }) {
  const { user, pin, updateName } = useAuth();

  const [name, setName] = useState(user ? user.name : '');
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);

  const nameProblem = nameError(name);
  const changed = user && name.trim() !== user.name;

  async function handleSaveName() {
    setSubmitted(true);
    if (nameProblem) return;
    await updateName(name);
    setSaved(true);
  }

  // No PIN yet -> create one. Already has a PIN -> the safe "update" screen.
  function handlePinRow() {
    if (pin) navigation.navigate('UpdatePin');
    else setPinOpen(true);
  }

  function handlePinCreated() {
    setPinOpen(false);
    Alert.alert(translate('PIN saved'), translate('Use this PIN to leave Child Mode.'));
  }

  return (
    <Screen scroll mode="parent">
      <View style={styles.body}>
        <Text style={styles.heading}>My account</Text>
        <Text style={styles.subheading}>Your name, password and Parent PIN.</Text>

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
          style={styles.firstField}
        />
        {changed || saved ? (
          <Button
            title={saved ? 'Saved ✓' : 'Save name'}
            variant={saved ? 'secondary' : 'primary'}
            onPress={handleSaveName}
            style={styles.saveName}
          />
        ) : null}

        <Text style={styles.label}>Email address</Text>
        <View style={styles.emailBox}>
          <Text style={styles.emailText}>{user ? user.email : ''}</Text>
        </View>

        <Text style={styles.section}>SECURITY</Text>

        <Pressable onPress={() => navigation.navigate('ChangePassword')} accessibilityRole="button" style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Change password</Text>
            <Text style={styles.rowCopy}>Needs your old password and a code sent to your email.</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable onPress={handlePinRow} accessibilityRole="button" style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>{pin ? 'Update PIN' : 'Create PIN'}</Text>
            <Text style={styles.rowCopy}>
              {pin
                ? 'Needs your old PIN and a code sent to your email.'
                : 'A 4-digit PIN keeps Child Mode and Parent Mode apart.'}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </View>

      <PinModal visible={pinOpen} onClose={() => setPinOpen(false)} onSuccess={handlePinCreated} forceCreate />
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
  subheading: {
    marginTop: 3,
    fontFamily: FONTS.interRegular,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  firstField: {
    marginTop: 20,
  },
  saveName: {
    marginTop: 12,
  },
  label: {
    marginTop: 18,
    marginBottom: 6,
    fontFamily: FONTS.interSemiBold,
    fontSize: 13,
    color: COLORS.text,
  },
  emailBox: {
    height: 50,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F7F5FC',
    justifyContent: 'center',
  },
  emailText: {
    fontFamily: FONTS.interRegular,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  section: {
    marginTop: 26,
    marginBottom: 8,
    fontFamily: FONTS.interBold,
    fontSize: 12,
    letterSpacing: 0.8,
    color: COLORS.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 14,
    color: COLORS.text,
  },
  rowCopy: {
    marginTop: 3,
    fontFamily: FONTS.interRegular,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textMuted,
  },
  chevron: {
    marginStart: 8,
    fontSize: 20,
    color: COLORS.primary,
  },
});
