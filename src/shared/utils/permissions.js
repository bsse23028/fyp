// PERMISSIONS - camera + microphone.
//
// IMPORTANT: camera / microphone permission belongs to the PHONE and the app,
// not to a KidBuddy account. Every parent and every child on this phone shares
// the same permission, and the app cannot switch it on or off by itself.
//   - So KidBuddy asks ONCE, when the first account is created.
//   - To change it later, the parent uses the phone's Settings
//     (openPhoneSettings() below takes them there).
//
// The camera package also handles the microphone permission, so one package
// is enough here.

import { translate } from '../i18n/translate';
import { Alert, Linking } from 'react-native';
import { Camera } from 'expo-camera';
import { KEYS, loadData, saveData } from './storage';

// What we remember about the question: { asked, camera, microphone }
export async function getSavedPermissions() {
  return loadData(KEYS.permissions, { asked: false, camera: false, microphone: false });
}

// Shows the phone's own permission pop-ups and saves the answers.
export async function askForPermissions() {
  const camera = await Camera.requestCameraPermissionsAsync();
  const microphone = await Camera.requestMicrophonePermissionsAsync();

  const result = { asked: true, camera: camera.granted, microphone: microphone.granted };
  await saveData(KEYS.permissions, result);
  return result;
}

// Used when the parent taps "Skip for now": we asked, nothing was allowed.
export async function saveSkippedPermissions() {
  const result = { asked: true, camera: false, microphone: false };
  await saveData(KEYS.permissions, result);
  return result;
}

export function openPhoneSettings() {
  Linking.openSettings();
}

// Call this right before a feature that needs the microphone.
// Returns true when we may use it. If not, it explains why and offers
// a button that opens the phone's Settings.
export async function ensureMicrophone() {
  let status = await Camera.getMicrophonePermissionsAsync();
  if (status.granted) return true;

  // The phone only lets us ask again if the parent has not blocked it.
  if (status.canAskAgain) {
    status = await Camera.requestMicrophonePermissionsAsync();
    if (status.granted) return true;
  }

  Alert.alert(
    translate('Microphone is off'),
    translate('Ask a grown-up to turn on the microphone for KidBuddy in the phone Settings.'),
    [
      { text: translate('Not now'), style: 'cancel' },
      { text: translate('Open Settings'), onPress: openPhoneSettings },
    ]
  );
  return false;
}
