// PARENT SETTINGS SCREEN ("Me" in the bottom bar) - account, children, language, PIN, permissions,
// log out, in the inspo look: the big purple title with the buddy, then the pale sheet with white cards.
//
//   - Account: the logged-in parent (tap -> My account: name, password, PIN)
//   (Children are edited from their card on Parent Home: ⋯ -> Edit profile. That is the one way in.)
//   - Language: English / اردو pill tabs (the same choice as the header toggle)
//   - Parent PIN: first time "Create PIN", afterwards "Update PIN" (old PIN + email code)
//   - Permissions: shows camera / microphone and opens the phone's settings
//   - Log Out: the ONLY place the parent logs out
//
// Props: { navigation }

import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import Mascot from '../../shared/components/Mascot';
import PageTitle from '../../shared/components/PageTitle';
import Sheet from '../../shared/components/Sheet';
import ProgressCard from '../../shared/components/ProgressCard';
import SegmentedControl from '../../shared/components/SegmentedControl';
import PinModal from '../../shared/components/PinModal';
import Button from '../../shared/components/Button';
import { useAuth } from '../../app/context/AuthContext';
import { useDevice } from '../../app/context/DeviceContext';
import { useLanguage } from '../../app/context/LanguageContext';
import { goToLogIn } from '../../app/navigation/helpers';
import { openPhoneSettings } from '../../shared/utils/permissions';
import { translate } from '../../shared/i18n/translate';
import { showComingSoon } from '../../shared/utils/alerts';
import { CATEGORY, COLORS, FONTS, PALETTE } from '../../shared/theme/theme';

const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'ur', label: 'اردو' },
];

const Chevron = () => <Text style={styles.chevron}>›</Text>;

export default function ParentSettingsScreen({ navigation }) {
  const { user, logOut, pin } = useAuth();
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
      <PageTitle eyebrow="Profiles, language and privacy" title="Settings" avatar="rabbit" />

      <Sheet>
        {/* account */}
        <ProgressCard
          left={
            <View style={[styles.pic, { backgroundColor: PALETTE.pastelLilac }]}>
              <Mascot size={44} avatar="rabbit" />
            </View>
          }
          title={user ? user.name : 'Parent'}
          subtitle={user ? user.email : ''}
          onPress={() => navigation.navigate('ParentProfile')}
          right={<Chevron />}
        />

        {/* language */}
        <Text style={styles.section}>Language</Text>
        <SegmentedControl options={LANGUAGES} value={language} onChange={setLanguage} />
        <Text style={styles.note}>Each child also has their own language, set in their profile.</Text>

        {/* safety + preferences */}
        <Text style={styles.section}>Safety and privacy</Text>
        <ProgressCard
          iconName="lock"
          iconColor={CATEGORY.art.pale}
          iconTint={CATEGORY.art.deep}
          title={pin ? 'Update PIN' : 'Create PIN'}
          subtitle={pin ? 'Required when leaving Child Mode. Needs your old PIN and an email code.' : 'Not set yet. Tap to create one.'}
          onPress={handlePinRow}
          right={<Chevron />}
        />
        <ProgressCard
          iconName="camera"
          iconColor={CATEGORY.calm.pale}
          iconTint={CATEGORY.calm.deep}
          title="Permissions"
          subtitle={permissionText}
          onPress={openPhoneSettings}
          right={<Chevron />}
        />
        <ProgressCard
          iconName="bell"
          iconColor={CATEGORY.games.pale}
          iconTint={CATEGORY.games.deep}
          title="Notifications"
          subtitle="Practice reminders and weekly summaries"
          onPress={() => showComingSoon('Notifications')}
          right={<Chevron />}
        />
        <ProgressCard
          iconName="share-variant"
          iconColor={CATEGORY.reading.pale}
          iconTint={CATEGORY.reading.deep}
          title="Share with therapist"
          subtitle="Export a summary, no therapist login"
          onPress={() => showComingSoon('Share with therapist')}
          right={<Chevron />}
        />

        <Button title="Log Out" variant="secondary" onPress={confirmLogOut} style={styles.logout} />

        <Text style={styles.credits}>Credits</Text>
        <Text style={styles.note}>Phonics sounds: Phonicademy (phonicademy.com)</Text>
      </Sheet>

      <PinModal visible={pinOpen} onClose={() => setPinOpen(false)} onSuccess={handlePinSaved} forceCreate />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pic: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  section: {
    marginTop: 14,
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
  note: {
    marginTop: 8,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textMuted,
  },
  credits: {
    marginTop: 22,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  logout: {
    marginTop: 18,
  },
});
