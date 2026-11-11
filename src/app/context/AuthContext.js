// AUTH CONTEXT - everything about accounts, used by the screens through  useAuth().
//
//   const { user, logIn, startSignUp, checkPin } = useAuth();
//
// The accounts now live on the BACKEND (backend/docs/API.md). The data is kept in Redux
// (app/store/authSlice.js); this file only gives the screens the SAME functions they used
// before, so no screen had to learn about Redux or the server.
//
// Every function throws an Error with a message the screen can show (the server's message),
// exactly like before.
//
// <AuthProvider> (in App.js) does two things when the app opens:
//   1. restores the login saved on the phone (GET /api/auth/me)
//   2. tells the API client what to do on a 401: log out and open the Log In screen

import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { DEMO_MODE } from '../../shared/config';
import { translate } from '../../shared/i18n/translate';
import { setUnauthorizedHandler } from '../../shared/api/client';
import { navigationRef } from '../navigation/navigationRef';
import {
  changePassword,
  changePin,
  createPin,
  forgotPassword,
  logIn,
  logOut,
  resendCode,
  resetPassword,
  resetPin,
  restoreSession,
  sendChangePasswordCode,
  sessionExpired,
  signUp,
  updateName,
  verifyChangePasswordCode,
  verifyEmail,
  verifyPassword,
  verifyPin,
  verifyResetCode,
} from '../store/authSlice';

// DEMO MODE: no real email yet, the backend prints the code in its terminal.
function showDemoCodeNotice() {
  if (DEMO_MODE) {
    Alert.alert(
      translate('Demo mode'),
      translate('Your 6-digit code is printed in the backend terminal (the window where the server runs).')
    );
  }
}

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const store = useStore();

  useEffect(() => {
    // A logged-in request got 401: the login has ended (expired, or logged out elsewhere).
    setUnauthorizedHandler(() => {
      if (!store.getState().auth.user) return; // nobody was logged in: nothing to do
      dispatch(sessionExpired());
      // The same screens as goToLogIn() in navigation/helpers.js.
      if (navigationRef.isReady()) {
        navigationRef.reset({ index: 1, routes: [{ name: 'Welcome' }, { name: 'LogIn' }] });
      }
      Alert.alert(translate('Please log in again'), translate('Your login has expired.'));
    });

    dispatch(restoreSession());
  }, []);

  return children;
}

// Use inside any screen:  const { logIn } = useAuth();
export function useAuth() {
  const dispatch = useDispatch();
  const { user, hasPin, loading, startupError, codePurpose } = useSelector((state) => state.auth);

  // The account password typed in "Forgot PIN?" (PinModal), kept only until the new PIN is saved.
  const verifiedPassword = useRef(null);

  // Runs a thunk and waits for it. If the server said no, this THROWS an error whose
  // .message is the server's message (that is what `.unwrap()` does).
  const run = (thunk) => dispatch(thunk).unwrap();

  // ----- SIGN UP -----
  async function startSignUp(name, email, password) {
    await run(signUp({ name, email, password }));
    showDemoCodeNotice();
  }

  async function finishSignUp(email, code) {
    await run(verifyEmail({ email, code }));
  }

  // ----- LOG IN / LOG OUT -----
  // Returns { name, email }: the Log In screen uses it to decide where to go next.
  async function doLogIn(email, password) {
    const data = await run(logIn({ email, password }));
    return data.user;
  }

  async function doLogOut() {
    await run(logOut());
  }

  // ----- FORGOT PASSWORD -----
  async function startPasswordReset(email) {
    await run(forgotPassword({ email }));
    showDemoCodeNotice();
  }

  async function doVerifyResetCode(email, code) {
    await run(verifyResetCode({ email, code }));
  }

  async function doResetPassword(email, newPassword) {
    await run(resetPassword({ newPassword }));
  }

  // "Resend code" link. Screens do not wait for it, so problems are shown in a pop-up here.
  async function doResendCode(email) {
    try {
      if (codePurpose === 'change_password') await run(sendChangePasswordCode());
      else await run(resendCode({ email, purpose: codePurpose === 'reset_password' ? 'reset_password' : 'signup' }));
      showDemoCodeNotice();
    } catch (error) {
      Alert.alert(translate('Could not send the code'), translate(error.message));
    }
  }

  // ----- PARENT PROFILE: name / password -----
  async function doUpdateName(newName) {
    await run(updateName({ name: newName }));
  }

  // "Is this my password?" Used by Change password and by "Forgot PIN?".
  async function checkPassword(password) {
    const { valid } = await run(verifyPassword({ password }));
    verifiedPassword.current = valid ? password : null;
    return valid;
  }

  // Not awaited by the screen, so problems are shown in a pop-up here.
  async function sendChangeCode() {
    try {
      await run(sendChangePasswordCode());
      showDemoCodeNotice();
    } catch (error) {
      Alert.alert(translate('Could not send the code'), translate(error.message));
    }
  }

  async function verifyChangeCode(code) {
    await run(verifyChangePasswordCode({ code }));
  }

  async function doChangePassword(oldPassword, newPassword, code) {
    await run(changePassword({ oldPassword, newPassword, code }));
  }

  // ----- PARENT PIN (guards the way out of Child Mode) -----

  // true / false. Throws while the PIN is locked after too many wrong tries.
  async function checkPin(typed) {
    const result = await run(verifyPin({ pin: typed }));
    return result.valid;
  }

  // Saves a new PIN: the very first one, or a new one after "Forgot PIN?" (password checked).
  async function savePin(newPin) {
    if (!hasPin) {
      await run(createPin({ pin: newPin }));
      return;
    }
    if (!verifiedPassword.current) throw new Error('Type your account password first.');
    await run(resetPin({ password: verifiedPassword.current, newPin }));
    verifiedPassword.current = null;
  }

  async function doChangePin(oldPin, newPin) {
    await run(changePin({ oldPin, newPin }));
  }

  return {
    user,
    loading,
    startupError, // the saved login could not be checked (no connection): AppNavigator shows Retry
    retryRestoreSession: () => dispatch(restoreSession()),
    pin: hasPin, // screens only ask "is there a PIN?" - the PIN itself never leaves the server
    startSignUp,
    finishSignUp,
    logIn: doLogIn,
    logOut: doLogOut,
    startPasswordReset,
    verifyResetCode: doVerifyResetCode,
    resetPassword: doResetPassword,
    resendCode: doResendCode,
    updateName: doUpdateName,
    sendChangeCode,
    verifyChangeCode,
    changePassword: doChangePassword,
    changePin: doChangePin,
    savePin,
    checkPin,
    checkPassword,
  };
}
