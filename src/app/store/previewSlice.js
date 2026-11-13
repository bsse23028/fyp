// PREVIEW SLICE - the ONE switch for "Explore KidBuddy" (a preview of Child Mode with a demo child).
// While `active` is true nothing is saved and nothing is sent to the server. It is never stored on
// the phone, so the app always restarts in normal mode; logout / an expired login also switch it off.
// notInPreview is used as the `condition` of every thunk that would send child data to the server.

import { createSlice } from '@reduxjs/toolkit';
import { logOut, sessionExpired } from './authSlice';

const previewSlice = createSlice({
  name: 'preview',
  initialState: { active: false },
  reducers: {
    previewStarted(state) {
      state.active = true;
    },
    previewEnded(state) {
      state.active = false;
    },
  },
  extraReducers: (builder) => {
    const end = (state) => {
      state.active = false;
    };
    builder.addCase(logOut.fulfilled, end).addCase(sessionExpired, end);
  },
});

export const selectPreviewActive = (state) => Boolean(state.preview && state.preview.active);

export const notInPreview = (_arg, { getState }) => !selectPreviewActive(getState());

export const { previewStarted, previewEnded } = previewSlice.actions;
export default previewSlice.reducer;
