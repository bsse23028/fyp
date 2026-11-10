// PARENT SETTINGS SCREEN - account, children, language, PIN, permissions, log out.
//
//   - Account: the logged-in parent (tap -> My account: name, password, PIN)
//   - Children: tap one to edit the profile (nickname, age, buddy, language)
//   - Language: English / اردو (the same choice as the header toggle)
//   - Parent PIN: first time "Create PIN", afterwards "Update PIN" (old PIN + email code)
//   - Permissions: shows camera / microphone and opens the phone's settings
//   - Log Out: the ONLY place the parent logs out
//
// Props: { navigation }

import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import Mascot from '../../shared/components/Mascot';
import SegmentedControl from '../../shared/components/SegmentedControl';
import PinModal from '../../shared/components/PinModal';
import Button from '../../shared/components/Button';
import { useAuth } from '../../app/context/AuthContext';
import { useChild } from '../../app/store/useChild';
import { useDevice } from '../../app/context/DeviceContext';
import { useLanguage } from '../../app/context/LanguageContext';
import { goToLogIn } from '../../app/navigation/helpers';
import { getAvatar } from '../../shared/theme/avatars';
import { openPhoneSettings } from '../../shared/utils/permissions';
import { translate } from '../../shared/i18n/translate';
import { showComingSoon } from '../../shared/utils/alerts';
import { ageText } from '../../shared/utils/progress';
import { COLORS, FONTS } from '../../shared/theme/theme';

const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'ur', label: 'اردو' },
];

// One settings row: title + small text on the left, something on the right.
function Row({ title, copy, right = '›', onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowCopy}>{copy}</Text>
      </View>
      <Text style={styles.chevron}>{right}</Text>
    </Pressable>
  );
}

export default function ParentSettingsScreen({ navigation }) {
  const { user, logOut, pin } = useAuth();
  const { childProfiles } = useChild();
  const { permissions } = useDevice();
  const { language, setLanguage } = useLanguage();
  const [pinOpen, setPinOpen] = useState(false);

  // First PIN: quick pop-up. A PIN already exists: the safe "Update PIN" screen.
  function handlePinRow() {
    if (pin) navigation.navigate('UpdatePin');
    else setPinOpen(true);
  }

  function handlePinSaved() {
    setPinOpen(false);
    Alert.alert(translate('PIN saved'), translate('Use this PIN to leave Child Mode.'));
  }

  function confirmLogOut() {
    Alert.alert(translate('Log out?'), translate('You can log back in with your email and password.'), [
      { text: translate('Cancel'), style: 'cancel' },
      {
        text: translate('Log out'),
        style: 'destructive',
        onPress: async () => {
          await logOut();
          goToLogIn(navigation);
        },
      },
    ]);
  }

  const permissionText =
    permissions.camera && permissions.microphone
      ? 'Camera and microphone are allowed. Tap to open phone settings.'
      : 'Camera or microphone is off. Tap to open phone settings.';

  return (
    <Screen scroll mode="parent">
      <View style={styles.body}>
        <Text style={styles.heading}>Settings</Text>
        <Text style={styles.subheading}>Profiles, language, privacy and preferences.</Text>

        {/* account */}
        <Pressable onPress={() => navigation.navigate('ParentProfile')} accessibilityRole="button" style={styles.account}>
          <View style={styles.accountPic}>
            <Mascot size={44} avatar="rabbit" />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.accountName}>{user ? user.name : 'Parent'}</Text>
            <Text style={styles.rowCopy}>{user ? user.email : ''}</Text>
            <Text style={styles.editLink}>Edit my account</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        {/* children */}
        <Text style={styles.section}>CHILDREN</Text>
        {childProfiles.map((child) => (
          <Pressable
            key={child.id}
            onPress={() => navigation.navigate('EditProfile', { childId: child.id })}
            accessibilityRole="button"
            style={styles.row}
          >
            <View style={[styles.childPic, { backgroundColor: getAvatar(child.avatar).color }]}>
              <Mascot size={34} avatar={child.avatar} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{child.name}’s profile</Text>
              <Text style={styles.rowCopy}>
                {ageText(child)} · {child.language === 'ur' ? 'اردو' : 'English'}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}

        {/* language */}
        <Text style={styles.section}>LANGUAGE</Text>
        <SegmentedControl options={LANGUAGES} value={language} onChange={setLanguage} />
        <Text style={styles.note}>Each child also has their own language, set in their profile.</Text>

        {/* safety + preferences */}
        <Text style={styles.section}>SAFETY AND PRIVACY</Text>
        <Row
          title={pin ? 'Update PIN' : 'Create PIN'}
          copy={pin ? 'Required when leaving Child Mode. Needs your old PIN and an email code.' : 'Not set yet. Tap to create one.'}
          onPress={handlePinRow}
        />
        <Row title="Permissions" copy={permissionText} onPress={openPhoneSettings} />
        <Row title="Notifications" copy="Practice reminders and weekly summaries" onPress={() => showComingSoon('Notifications')} />
        <Row title="Share with therapist" copy="Export a summary, no therapist login" onPress={() => showComingSoon('Share with therapist')} />

        <Button title="Log Out" variant="secondary" onPress={confirmLogOut} style={styles.logout} />
      </View>

      <PinModal visible={pinOpen} onClose={() => setPinOpen(false)} onSuccess={handlePinSaved} forceCreate />
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
    fontSize: 12,
    color: COLORS.textMuted,
  },
  account: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  accountPic: {
    width: 54,
    height: 54,
    marginEnd: 12,
    borderRadius: 16,
    backgroundColor: COLORS.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editLink: {
    marginTop: 4,
    fontFamily: FONTS.interSemiBold,
    fontSize: 12,
    color: COLORS.primary,
  },
  accountName: {
    fontFamily: FONTS.interBold,
    fontSize: 16,
    color: COLORS.text,
  },
  section: {
    marginTop: 22,
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
    paddingVertical: 13,
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
  childPic: {
    width: 44,
    height: 44,
    marginEnd: 12,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: {
    marginTop: 8,
    fontFamily: FONTS.interRegular,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textMuted,
  },
  logout: {
    marginTop: 14,
  },
});
