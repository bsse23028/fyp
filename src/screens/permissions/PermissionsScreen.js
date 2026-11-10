// PERMISSIONS SCREEN - asks for camera + microphone ONCE, right after the
// parent's account is created (before the child profile).
//
// Why here, and why no on/off switches?
//   Camera / microphone permission belongs to the PHONE, not to a KidBuddy
//   account, so it cannot be different for different children. The app also
//   cannot switch it off by itself. So we ask once now, and if the parent
//   ever wants to change it, they use the phone's Settings.
//
// What it holds:
//   - one card for Camera, one for Microphone (what we capture + how it is stored)
//   - a list of which activities use which sensor
//   - "Allow Camera & Microphone" -> the phone's own pop-ups appear
//   - "Skip for now"              -> nothing is allowed; activities that need it ask later
//   Either way the parent then continues to "Create child profile".
//
// Props: { navigation }

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import AuthHeading from '../../shared/components/AuthHeading';
import Button from '../../shared/components/Button';
import { useDevice } from '../../app/context/DeviceContext';
import { askForPermissions, saveSkippedPermissions } from '../../shared/utils/permissions';
import { goToStart } from '../../app/navigation/helpers';
import { globalStyles } from '../../shared/theme/globalStyles';
import { COLORS, FONTS } from '../../shared/theme/theme';

// Text shown in the two cards (from Figma, with the "toggle" lines removed).
const CAMERA_ROWS = [
  ['What we capture', 'Short clips during reading and emotion activities.'],
  ['How it is stored', 'Processed on-device only. Never uploaded or shared.'],
  ['How to turn off', 'In your phone’s Settings, any time.'],
];
const MICROPHONE_ROWS = [
  ['What we capture', 'Voice recordings during reading-aloud and pronunciation activities.'],
  ['How it is stored', 'Analysed instantly on-device; audio deleted within 60 seconds.'],
  ['How to turn off', 'In your phone’s Settings, any time.'],
];
const SENSOR_MODULES = [
  ['Read-Along', 'Microphone'],
  ['Sounds', 'Camera + microphone'],
  ['Mirror the Emotion', 'Camera'],
  ['Camera Counting', 'Camera'],
];

// One card (Camera or Microphone).
function PermissionCard({ icon, title, rows }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTitleRow}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {rows.map(([label, text]) => (
        <Text key={label} style={styles.cardRow}>
          <Text style={styles.cardRowLabel}>{label}: </Text>
          {text}
        </Text>
      ))}
    </View>
  );
}

export default function PermissionsScreen({ navigation }) {
  const { setPermissions } = useDevice();
  const [loading, setLoading] = useState(false);

  // Remember the answer, then go on to the child profile.
  function finish(result) {
    setPermissions(result);
    goToStart(navigation, 'CreateChildProfile');
  }

  async function handleAllow() {
    setLoading(true);
    try {
      finish(await askForPermissions()); // the phone shows its own pop-ups here
    } catch (e) {
      finish(await saveSkippedPermissions()); // if anything goes wrong, carry on
    }
    setLoading(false);
  }

  async function handleSkip() {
    finish(await saveSkippedPermissions());
  }

  return (
    <Screen scroll>
      <View style={styles.body}>
        <AuthHeading
          title="Permissions"
          subtitle="KidBuddy needs your permission before using these features."
        />

        <PermissionCard icon="📷" title="Camera" rows={CAMERA_ROWS} />
        <PermissionCard icon="🎤" title="Microphone" rows={MICROPHONE_ROWS} />

        <Text style={styles.sectionTitle}>Activities using sensors</Text>
        <View style={styles.list}>
          {SENSOR_MODULES.map(([module, sensor], index) => (
            <View key={module} style={[styles.listRow, index > 0 && styles.listRowBorder]}>
              <Text style={styles.listName}>{module}</Text>
              <Text style={styles.badge}>{sensor}</Text>
            </View>
          ))}
        </View>

        <View style={styles.note}>
          <Text style={styles.noteIcon}>🔒</Text>
          <Text style={styles.noteText}>
            We ask only once, on this phone. If you change your mind, use your phone’s Settings. We
            never sell or share your child’s data with third parties.
          </Text>
        </View>

        <Button
          title="Allow Camera & Microphone"
          onPress={handleAllow}
          loading={loading}
          style={styles.button}
        />

        <Text style={[globalStyles.centerText, styles.skip]} onPress={handleSkip}>
          Skip for now (some features will be unavailable)
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  card: {
    marginTop: 16,
    padding: 20,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  cardTitle: {
    marginStart: 10,
    fontFamily: FONTS.interBold,
    fontSize: 17,
    color: COLORS.text,
  },
  cardRow: {
    marginTop: 8,
    fontFamily: FONTS.interRegular,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textMuted,
  },
  cardRowLabel: {
    fontFamily: FONTS.interSemiBold,
    color: COLORS.text,
  },
  sectionTitle: {
    marginTop: 22,
    marginBottom: 10,
    fontFamily: FONTS.interBold,
    fontSize: 15,
    color: COLORS.text,
  },
  list: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  listRowBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  listName: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 13,
    color: COLORS.text,
  },
  badge: {
    overflow: 'hidden',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primaryPale,
    fontFamily: FONTS.interBold,
    fontSize: 11,
    color: COLORS.primary,
  },
  note: {
    flexDirection: 'row',
    marginTop: 18,
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.primaryPale,
  },
  noteIcon: {
    fontSize: 18,
    marginEnd: 10,
  },
  noteText: {
    flex: 1,
    fontFamily: FONTS.interRegular,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.primary,
  },
  button: {
    marginTop: 20,
  },
  skip: {
    marginTop: 16,
    fontSize: 14,
  },
});
