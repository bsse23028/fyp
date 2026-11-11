// AUTH SLICE - who is logged in, kept in Redux Toolkit. The data comes from the BACKEND.
// (Before, AuthContext.js kept accounts on the phone with AsyncStorage.)
//
// Screens do NOT use this file directly. They keep calling  useAuth()  (AuthContext.js),
// which gives the same functions as before: logIn, startSignUp, checkPin ...
//
// HOW A CALL TO THE SERVER WORKS HERE (createAsyncThunk)
//   export const logIn = createAsyncThunk('auth/logIn', async ({ email, password }) => {
//     const data = await api.post('/api/auth/login', { email, password });   // 1. ask the server
//     await saveToken(data.token);                                           // 2. remember the token
//     return data;                                                           // 3. goes to the reducer
//   });
//   - while it runs      -> action 'auth/logIn/pending'
//   - when it worked     -> action 'auth/logIn/fulfilled'  (action.payload = what we returned)
//   - when it threw      -> action 'auth/logIn/rejected'   (action.error.message = the server's message)
//   The reducers at the bottom (extraReducers) update the state for the actions we care about.
//
// The endpoints are described in backend/docs/API.md.

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import { api, clearToken, getToken, saveToken } from '../../shared/api/client';

// Sent with log in / verify email, so the backend can show which phone a login belongs to.
const DEVICE = { platform: Platform.OS };

// ---------- session ----------

// When the app opens: is a token saved? Then ask the server who it belongs to.
export const restoreSession = createAsyncThunk('auth/restoreSession', async (_, { rejectWithValue }) => {
  const token = await getToken();
  if (!token) return null; // nobody was logged in
  try {
    return await api.get('/api/auth/me'); // { user, hasPin }
  } catch (error) {
    // No connection: the app shows the message with a Retry button (the token is kept).
    if (error.status === 0) return rejectWithValue(error.message);
    // 401: the login ended (the client already deleted the token). Start logged out.
    return null;
  }
});

export const logIn = createAsyncThunk('auth/logIn', async ({ email, password }) => {
  const data = await api.post('/api/auth/login', { email: email.trim(), password, ...DEVICE });
  await saveToken(data.token);
  return data; // { token, user, hasPin }
});

export const logOut = createAsyncThunk('auth/logOut', async () => {
  try {
    await api.post('/api/auth/logout'); // ends the login on the server too
  } catch (error) {
    // Even without a connection we still log out on the phone.
  }
  await clearToken();
});

// ---------- sign up ----------

// Step 1: the server saves the account and emails (prints) a code.
export const signUp = createAsyncThunk('auth/signUp', async ({ name, email, password }) => {
  return api.post('/api/auth/signup', { name: name.trim(), email: email.trim(), password });
});

// Step 2: the code is right -> the account is active and the parent is logged in.
export const verifyEmail = createAsyncThunk('auth/verifyEmail', async ({ email, code }) => {
  const data = await api.post('/api/auth/verify-email', { email: email.trim(), code, ...DEVICE });
  await saveToken(data.token);
  return data; // { token, user, hasPin }
});

// "Resend code" for sign-up or forgot password.  purpose: 'signup' | 'reset_password'
export const resendCode = createAsyncThunk('auth/resendCode', async ({ email, purpose }) => {
  return api.post('/api/auth/resend-code', { email: email.trim(), purpose });
});

// ---------- forgot password ----------

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async ({ email }) => {
  return api.post('/api/auth/forgot-password', { email: email.trim() });
});

// The code is right -> the server gives a short-lived resetToken (kept in the state below).
export const verifyResetCode = createAsyncThunk('auth/verifyResetCode', async ({ email, code }) => {
  return api.post('/api/auth/verify-reset-code', { email: email.trim(), code }); // { resetToken }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ newPassword }, { getState }) => {
  const { resetToken } = getState().auth;
  if (!resetToken) throw new Error('Please verify your email code first.');
  return api.post('/api/auth/reset-password', { resetToken, newPassword });
});

// ---------- account (logged in) ----------

export const updateName = createAsyncThunk('auth/updateName', async ({ name }) => {
  return api.patch('/api/account', { name: name.trim() }); // { user }
});

// "Is this my password?"  -> { valid: true / false }
export const verifyPassword = createAsyncThunk('auth/verifyPassword', async ({ password }) => {
  return api.post('/api/account/verify-password', { password });
});

export const sendChangePasswordCode = createAsyncThunk('auth/sendChangePasswordCode', async () => {
  return api.post('/api/account/password/send-code');
});

export const verifyChangePasswordCode = createAsyncThunk('auth/verifyChangePasswordCode', async ({ code }) => {
  return api.post('/api/account/password/verify-code', { code });
});

export const changePassword = createAsyncThunk('auth/changePassword', async ({ oldPassword, newPassword, code }) => {
  return api.put('/api/account/password', { oldPassword, newPassword, code });
});

// ---------- Parent PIN ----------

// The very first PIN of the account.
export const createPin = createAsyncThunk('auth/createPin', async ({ pin }) => {
  return api.post('/api/account/pin', { pin });
});

// -> { valid: true }  or  { valid: false, attemptsLeft, lockedUntil }   (429 = locked: it throws)
export const verifyPin = createAsyncThunk('auth/verifyPin', async ({ pin }) => {
  return api.post('/api/account/pin/verify', { pin });
});

export const changePin = createAsyncThunk('auth/changePin', async ({ oldPin, newPin }) => {
  return api.put('/api/account/pin', { oldPin, newPin });
});

// "Forgot PIN?": the account password proves it is really the parent.
export const resetPin = createAsyncThunk('auth/resetPin', async ({ password, newPin }) => {
  return api.post('/api/account/pin/reset', { password, newPin });
});

// ---------- the slice ----------

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null, // { id, name, email } of the logged-in parent, or null
    hasPin: false, // has this parent created a Parent PIN?
    loading: true, // true only until restoreSession is done (the app shows a spinner)
    startupError: null, // restoreSession could not reach the server (the app shows Retry)
    codePurpose: null, // which code we are waiting for: 'signup' | 'reset_password' | 'change_password'
    resetToken: null, // from verifyResetCode, used once by resetPassword
  },
  reducers: {
    // The server said 401 to a logged-in request: the login is over.
    sessionExpired(state) {
      state.user = null;
      state.hasPin = false;
    },
  },
  extraReducers: (builder) => {
    // A successful log in looks the same for these three.
    const loggedIn = (state, action) => {
      state.user = action.payload.user;
      state.hasPin = action.payload.hasPin;
      state.codePurpose = null;
    };

    builder
      .addCase(restoreSession.pending, (state) => {
        state.startupError = null; // (again after Retry)
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) loggedIn(state, action);
      })
      .addCase(restoreSession.rejected, (state, action) => {
        // Stay "loading": AppNavigator shows this message with a Retry button.
        state.startupError = action.payload || action.error.message;
      })
      .addCase(logIn.fulfilled, loggedIn)
      .addCase(verifyEmail.fulfilled, loggedIn)
      .addCase(logOut.fulfilled, (state) => {
        state.user = null;
        state.hasPin = false;
      })
      .addCase(signUp.fulfilled, (state) => {
        state.codePurpose = 'signup';
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.codePurpose = 'reset_password';
        state.resetToken = null;
      })
      .addCase(verifyResetCode.fulfilled, (state, action) => {
        state.resetToken = action.payload.resetToken;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetToken = null;
        state.codePurpose = null;
      })
      .addCase(updateName.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(sendChangePasswordCode.fulfilled, (state) => {
        state.codePurpose = 'change_password';
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.codePurpose = null;
      })
      .addCase(createPin.fulfilled, (state) => {
        state.hasPin = true;
      })
      .addCase(resetPin.fulfilled, (state) => {
        state.hasPin = true;
      });
  },
});

export const { sessionExpired } = authSlice.actions;
export default authSlice.reducer;
