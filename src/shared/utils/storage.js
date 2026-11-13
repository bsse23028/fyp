// STORAGE - two tiny helpers around AsyncStorage (the phone's key-value store)
// so the rest of the app never has to repeat JSON.parse / try-catch.
//
//   await saveData('kidbuddy_language', 'en');
//   const language = await loadData('kidbuddy_language', 'en');   // 'en' if nothing saved yet
//
// Everything the app remembers is listed in KEYS, so you can see at a glance
// what is saved on the phone.

import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  language: 'kidbuddy_language', // 'en' | 'ur'            (whole phone)
  introSeen: 'kidbuddy_intro_seen', // true after the first launch  (whole phone)
  permissions: 'kidbuddy_permissions', // { asked, camera, microphone } (whole phone)
  authToken: 'kidbuddy_auth_token', // the login token (JWT) from the backend (see shared/api/client.js)
  alphabetProgress: 'kidbuddy_alphabet_progress', // { childId: { A: 3, B: 1 } } best stars per letter (frontend-only for now)
  // These two are per parent, so the parent's email is added to the key:
  children: (email) => `kidbuddy_children_${email}`, // list of child profiles
  activeChild: (email) => `kidbuddy_active_child_${email}`, // id of the child using the app
  pin: (email) => `kidbuddy_pin_${email}`, // the 4-digit Parent PIN
};

export async function saveData(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Saving is a nice-to-have: if it fails the app keeps working.
  }
}

export async function loadData(key, fallback) {
  try {
    const json = await AsyncStorage.getItem(key);
    return json === null ? fallback : JSON.parse(json);
  } catch (e) {
    return fallback;
  }
}
