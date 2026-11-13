// ALPHABET SLICE - best stars (0-3) per letter, per child:  state.englishAlphabet.stars[childId][letter]
// Frontend-only for now: kept on the phone (KEYS.alphabetProgress) and loaded when the app starts.
// recordLetterResult() is the ONLY place that saves (swap its body for a backend call later).
// It never lowers a score and does nothing in Preview mode.

import { createSlice } from '@reduxjs/toolkit';
import { KEYS, loadData, saveData } from '../../../shared/utils/storage';
import { selectPreviewActive } from '../../../app/store/previewSlice';

const EMPTY = {};

const alphabetSlice = createSlice({
  name: 'englishAlphabet',
  initialState: { stars: {}, loaded: false },
  reducers: {
    progressLoaded(state, action) {
      state.stars = action.payload || {};
      state.loaded = true;
    },
    letterStarsSaved(state, action) {
      const { childId, letter, stars } = action.payload;
      state.stars[childId] = { ...(state.stars[childId] || {}), [letter]: stars };
    },
  },
});

const { progressLoaded, letterStarsSaved } = alphabetSlice.actions;

export const loadAlphabetProgress = () => async (dispatch) => {
  dispatch(progressLoaded(await loadData(KEYS.alphabetProgress, {})));
};

export const recordLetterResult = (childId, letter, stars) => (dispatch, getState) => {
  const state = getState();
  if (!childId || selectPreviewActive(state)) return;
  const safeStars = Math.max(0, Math.min(3, Math.round(stars)));
  const best = (state.englishAlphabet.stars[childId] || EMPTY)[letter] || 0;
  if (safeStars <= best) return;
  dispatch(letterStarsSaved({ childId, letter, stars: safeStars }));
  saveData(KEYS.alphabetProgress, getState().englishAlphabet.stars);
};

// { A: 3, B: 1 } for one child (an empty object in Preview mode, so every letter looks fresh).
export const selectLetterStars = (state, childId) => {
  if (selectPreviewActive(state) || !childId) return EMPTY;
  return state.englishAlphabet.stars[childId] || EMPTY;
};

export default alphabetSlice.reducer;
