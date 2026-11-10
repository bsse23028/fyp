// AUTH CONTEXT - everything about accounts, kept in ONE place.
//
// There is no server yet, so accounts are saved on the phone with
// AsyncStorage (a tiny key-value store). Screens never touch AsyncStorage
// themselves: they call the functions below, and if something is wrong the
// function throws an Error whose message the screen shows to the parent.
//
// WHEN THE BACKEND ARRIVES: only the insides of these functions change.
// The screens stay exactly the same.
//
// (Passwords are stored as plain text here. That is fine for a local demo
// but must never be done in a real app - the server will hash them.)

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEMO_MODE } from '../../shared/config';
import { cleanEmail } from '../../shared/utils/validation';
import { KEYS, loadData, saveData } from '../../shared/utils/storage';
import { translate } from '../../shared/i18n/translate';

const USERS_KEY = 'kidbuddy_users'; // list of every account
const SESSION_KEY = 'kidbuddy_session'; // email of the logged-in parent

const AuthContext = createContext(null);

// ----- small helpers to read / write the users list -----
async function readUsers() {
  const json = await AsyncStorage.getItem(USERS_KEY);
  return json ? JSON.parse(json) : [];
}

async function writeUsers(users) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // logged-in parent, or null
  const [loading, setLoading] = useState(true); // true while we check for a saved session
  const [pin, setPinState] = useState(null); // the 4-digit Parent PIN, or null if not created yet

  // Things we need to remember between screens (not shown on screen, so refs):
  const pendingSignUp = useRef(null); // { name, email, password } waiting for email verification
  const sentCode = useRef(null); // { email, code } the last code we "sent"
  const verifiedResetEmail = useRef(null); // email whose reset code was verified

  // When the app starts, see if a parent was already logged in.
  useEffect(() => {
    async function restoreSession() {
      try {
        const email = await AsyncStorage.getItem(SESSION_KEY);
        if (email) {
          const users = await readUsers();
          const found = users.find((u) => u.email === email);
          if (found) setUser({ name: found.name, email: found.email });
        }
      } catch (e) {
        // If storage fails we simply start logged out.
      }
      setLoading(false);
    }
    restoreSession();
  }, []);

  // Load this parent's PIN whenever somebody logs in.
  useEffect(() => {
    if (user) loadData(KEYS.pin(user.email), null).then(setPinState);
    else setPinState(null);
  }, [user]);

  // ----- PARENT PIN (guards the way out of Child Mode) -----
  // (Saved as plain text for the demo. A real app would store it hashed.)
  function savePin(newPin) {
    setPinState(newPin);
    if (user) saveData(KEYS.pin(user.email), newPin);
  }

  function checkPin(typed) {
    return !!pin && typed === pin;
  }

  // "Forgot PIN?": the account password proves it is really the parent.
  async function checkPassword(password) {
    if (!user) return false;
    const users = await readUsers();
    return users.some((u) => u.email === user.email && u.password === password);
  }

  // ----- PARENT PROFILE: change name / password / PIN -----
  // Changing the password or the PIN needs TWO proofs: the old one, and a
  // 6-digit code sent to the parent's email (shown in a pop-up in demo mode).

  // Saves a new name for the logged-in parent.
  async function updateName(newName) {
    if (!user) return;
    const name = newName.trim();
    const users = await readUsers();
    await writeUsers(users.map((u) => (u.email === user.email ? { ...u, name } : u)));
    setUser({ ...user, name });
  }

  // Sends the code to the logged-in parent's own email.
  function sendChangeCode() {
    if (user) sendCode(user.email);
  }

  // Step 1 of a change: is the code right? (throws if not)
  function verifyChangeCode(code) {
    if (!user || !checkCode(user.email, code)) {
      throw new Error("That code isn't right. Check it and try again.");
    }
  }

  // Saves a new password. The old password AND the code must be right.
  async function changePassword(oldPassword, newPassword, code) {
    if (!(await checkPassword(oldPassword))) throw new Error('Your old password is not right.');
    if (oldPassword === newPassword) throw new Error('Choose a password you have not used before.');
    verifyChangeCode(code);
    const users = await readUsers();
    await writeUsers(users.map((u) => (u.email === user.email ? { ...u, password: newPassword } : u)));
    sentCode.current = null;
  }

  // Saves a new PIN. The old PIN AND the code must be right.
  function changePin(oldPin, newPin, code) {
    if (!checkPin(oldPin)) throw new Error('Your old PIN is not right.');
    if (oldPin === newPin) throw new Error('Choose a PIN you have not used before.');
    // verifyChangeCode(code);
    savePin(newPin);
    sentCode.current = null;
  }

  // ----- 6-digit codes (email verification + password reset) -----
  function sendCode(email) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    sentCode.current = { email, code };
    // TODO (backend phase): ask the server to email this code instead.
    if (DEMO_MODE) {
      Alert.alert(
        translate('Demo mode'),
        translate('Your 6-digit code is {code}.\n\nIn the real app this arrives by email.', { code })
      );
    }
  }

  // Returns true if the typed code is the one we sent to this email.
  function checkCode(email, code) {
    const sent = sentCode.current;
    return !!sent && sent.email === cleanEmail(email) && sent.code === code;
  }

  // ----- SIGN UP -----
  // Step 1: check the details, remember them, send a verification code.
  async function startSignUp(name, email, password) {
    const cleaned = cleanEmail(email);
    const users = await readUsers();
    if (users.some((u) => u.email === cleaned)) {
      throw new Error('An account with this email already exists. Try logging in.');
    }
    pendingSignUp.current = { name: name.trim(), email: cleaned, password };
    sendCode(cleaned);
  }

  // Step 2: the code was typed correctly -> really create the account.
  async function finishSignUp(email, code) {
    const pending = pendingSignUp.current;
    if (!pending || !checkCode(email, code)) {
      throw new Error("That code isn't right. Check it and try again.");
    }
    const users = await readUsers();
    await writeUsers([...users, pending]);
    await AsyncStorage.setItem(SESSION_KEY, pending.email);
    setUser({ name: pending.name, email: pending.email });
    pendingSignUp.current = null;
    sentCode.current = null;
  }

  // ----- LOG IN / LOG OUT -----
  async function logIn(email, password) {
    const cleaned = cleanEmail(email);
    const users = await readUsers();
    const found = users.find((u) => u.email === cleaned && u.password === password);
    if (!found) throw new Error('Incorrect email or password.');
    await AsyncStorage.setItem(SESSION_KEY, found.email);
    setUser({ name: found.name, email: found.email });
    return { name: found.name, email: found.email }; // the screen uses this to decide where to go next
  }

  async function logOut() {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  // ----- FORGOT PASSWORD -----
  // Step 1: make sure the account exists, then send a reset code.
  async function startPasswordReset(email) {
    const cleaned = cleanEmail(email);
    const users = await readUsers();
    if (!users.some((u) => u.email === cleaned)) {
      // TODO (backend phase): a real server should NOT reveal whether an email exists.
      throw new Error("We couldn't find an account with that email.");
    }
    verifiedResetEmail.current = null;
    sendCode(cleaned);
  }

  // Step 2: check the code the parent typed.
  function verifyResetCode(email, code) {
    if (!checkCode(email, code)) {
      throw new Error("That code isn't right. Check it and try again.");
    }
    verifiedResetEmail.current = cleanEmail(email);
  }

  // Step 3: save the new password.
  async function resetPassword(email, newPassword) {
    const cleaned = cleanEmail(email);
    if (verifiedResetEmail.current !== cleaned) {
      throw new Error('Please verify your email code first.');
    }
    const users = await readUsers();
    const account = users.find((u) => u.email === cleaned);
    if (!account) throw new Error("We couldn't find an account with that email.");
    if (account.password === newPassword) {
      throw new Error("Choose a password you haven't used before.");
    }
    await writeUsers(users.map((u) => (u.email === cleaned ? { ...u, password: newPassword } : u)));
    verifiedResetEmail.current = null;
    sentCode.current = null;
  }

  // Sends a fresh code (the "Resend code" link). Works for both flows.
  function resendCode(email) {
    sendCode(cleanEmail(email));
  }

  const value = {
    user,
    loading,
    startSignUp,
    finishSignUp,
    logIn,
    logOut,
    startPasswordReset,
    verifyResetCode,
    resetPassword,
    resendCode,
    updateName,
    sendChangeCode,
    verifyChangeCode,
    changePassword,
    changePin,
    pin,
    savePin,
    checkPin,
    checkPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Use inside any screen:  const { logIn } = useAuth();
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}
