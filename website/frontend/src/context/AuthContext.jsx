// AUTH CONTEXT - everything about the parent's account, used by the pages through useAuth().
// It gives the SAME functions as the mobile app's useAuth() (src/app/context/AuthContext.js),
// talking to the same shared API through the website backend:
//
//   const { user, logIn, startSignUp, checkPin } = useAuth();
//
// Every function throws an Error with a message the page can show (the server's message).
// The login itself is an httpOnly cookie set by the website backend: no token is kept in JS.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, setUnauthorizedHandler } from '../services/api';
import { useUI } from './UIContext';

const AuthContext = createContext(null);

// DEMO MODE: only when the shared API runs with EMAIL_MODE=console (no real email), set VITE_DEMO_CODES=true
// and a pop-up says the code is printed in the API's terminal. Off by default: codes arrive by email.
const DEMO_CODES = import.meta.env.VITE_DEMO_CODES === 'true';

export function AuthProvider({ children }) {
  const { alert } = useUI();
  const [state, setState] = useState({ user: null, hasPin: false, loading: true, startupError: null });
  const [codePurpose, setCodePurpose] = useState(null); // 'signup' | 'reset_password' | 'change_password'
  const verifiedPassword = useRef(null); // "Forgot PIN?": the checked account password, until the new PIN is saved
  const userRef = useRef(null);
  userRef.current = state.user;

  const restoreSession = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, startupError: null }));
    try {
      const data = await api.get('/api/auth/me', { quiet401: true });
      setState({ user: data.user, hasPin: data.hasPin, loading: false, startupError: null });
    } catch (error) {
      // No connection, a server problem or "too many requests": keep the login and offer Retry.
      if (error.status === 0 || error.status === 429 || error.status >= 500) {
        setState({ user: null, hasPin: false, loading: true, startupError: error.message });
      } else {
        setState({ user: null, hasPin: false, loading: false, startupError: null });
      }
    }
  }, []);

  useEffect(() => {
    // A logged-in request got 401: the login has ended (expired, or logged out on another device).
    setUnauthorizedHandler(() => {
      if (!userRef.current) return;
      setState((s) => ({ ...s, user: null, hasPin: false }));
      window.dispatchEvent(new CustomEvent('kidbuddy:session-expired'));
      alert({ title: 'Please log in again', message: 'Your login has expired.' });
    });
    restoreSession();
  }, [restoreSession, alert]);

  const showDemoCodeNotice = () => {
    if (DEMO_CODES) alert({ title: 'Demo mode', message: 'Your 6-digit code is printed in the backend terminal (the window where the server runs).' });
  };

  const loggedIn = (data) => {
    setState({ user: data.user, hasPin: data.hasPin, loading: false, startupError: null });
    setCodePurpose(null);
  };

  const value = useMemo(
    () => ({
      user: state.user,
      pin: state.hasPin,
      loading: state.loading,
      startupError: state.startupError,
      codePurpose,
      retryRestoreSession: restoreSession,

      // ----- sign up -----
      async startSignUp(name, email, password) {
        await api.post('/api/auth/signup', { name: name.trim(), email: email.trim(), password });
        setCodePurpose('signup');
        showDemoCodeNotice();
      },
      async finishSignUp(email, code) {
        loggedIn(await api.post('/api/auth/verify-email', { email: email.trim(), code }));
      },

      // ----- log in / out -----
      async logIn(email, password) {
        const data = await api.post('/api/auth/login', { email: email.trim(), password });
        loggedIn(data);
        return data.user;
      },
      async logOut() {
        try {
          await api.post('/api/auth/logout');
        } catch (error) {
          // still log out in this browser
        }
        setState((s) => ({ ...s, user: null, hasPin: false }));
        window.dispatchEvent(new CustomEvent('kidbuddy:logged-out'));
      },

      // ----- forgot password -----
      async startPasswordReset(email) {
        await api.post('/api/auth/forgot-password', { email: email.trim() });
        setCodePurpose('reset_password');
        showDemoCodeNotice();
      },
      async verifyResetCode(email, code) {
        await api.post('/api/auth/verify-reset-code', { email: email.trim(), code });
      },
      async resetPassword(newPassword) {
        await api.post('/api/auth/reset-password', { newPassword });
        setCodePurpose(null);
      },

      // "Resend code": for sign-up, forgot password or change password.
      async resendCode(email, purpose) {
        const which = purpose || codePurpose;
        if (which === 'change_password') await api.post('/api/account/password/send-code');
        else await api.post('/api/auth/resend-code', { email: email.trim(), purpose: which === 'reset_password' ? 'reset_password' : 'signup' });
        showDemoCodeNotice();
      },

      // ----- account -----
      async updateName(name) {
        const data = await api.patch('/api/account', { name: name.trim() });
        setState((s) => ({ ...s, user: data.user }));
      },
      async checkPassword(password) {
        const { valid } = await api.post('/api/account/verify-password', { password });
        verifiedPassword.current = valid ? password : null;
        return valid;
      },
      async sendChangeCode() {
        await api.post('/api/account/password/send-code');
        setCodePurpose('change_password');
        showDemoCodeNotice();
      },
      async verifyChangeCode(code) {
        await api.post('/api/account/password/verify-code', { code });
      },
      async changePassword(oldPassword, newPassword, code) {
        await api.put('/api/account/password', { oldPassword, newPassword, code });
        setCodePurpose(null);
      },

      // ----- Parent PIN (guards the way out of Child Mode) -----
      async checkPin(pin) {
        const result = await api.post('/api/account/pin/verify', { pin });
        return result;
      },
      async savePin(newPin) {
        if (!state.hasPin) {
          await api.post('/api/account/pin', { pin: newPin });
        } else {
          if (!verifiedPassword.current) throw new Error('Type your account password first.');
          await api.post('/api/account/pin/reset', { password: verifiedPassword.current, newPin });
          verifiedPassword.current = null;
        }
        setState((s) => ({ ...s, hasPin: true }));
      },
      async changePin(oldPin, newPin) {
        await api.put('/api/account/pin', { oldPin, newPin });
      },
    }),
    [state, codePurpose, restoreSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
