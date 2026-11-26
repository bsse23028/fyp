// ALPHABET SLICE - best stars (0-3) per letter, per child:  state.englishAlphabet.stars[childId][letter]
// Frontend-only for now: kept on the phone (KEYS.alphabetProgress) and loaded when the app starts.
// recordLetterResult() is the ONLY place that saves (swap its body for a backend call later).
// It never lowers a score and does nothing in Preview mode.
// letterCase ('upper' | 'lower') is how the lessons draw letters; setLetterCase saves it (not in Preview).

import { createSlice } from '@reduxjs/toolkit';
import { KEYS, loadData, saveData } from '../../../shared/utils/storage';
import { previewEnded, previewStarted, selectPreviewActive } from '../../../app/store/previewSlice';

const EMPTY = {};

const alphabetSlice = createSlice({
  name: 'englishAlphabet',
  initialState: { stars: {}, loaded: false, letterCase: 'upper', previewCase: null },
  reducers: {
    progressLoaded(state, action) {
      state.stars = action.payload || {};
      state.loaded = true;
    },
    letterCaseChanged(state, action) {
      state.letterCase = action.payload === 'lower' ? 'lower' : 'upper';
    },
    previewCaseChanged(state, action) {
      state.previewCase = action.payload === 'lower' ? 'lower' : 'upper';
    },
    letterStarsSaved(state, action) {
      const { childId, letter, stars } = action.payload;
      state.stars[childId] = { ...(state.stars[childId] || {}), [letter]: stars };
    },
  },
  extraReducers: (builder) => {
    const clearPreview = (state) => {
      state.previewCase = null;
    };
    builder.addCase(previewStarted, clearPreview).addCase(previewEnded, clearPreview);
  },
});

const { progressLoaded, letterStarsSaved, letterCaseChanged, previewCaseChanged } = alphabetSlice.actions;

export const loadAlphabetProgress = () => async (dispatch) => {
  dispatch(progressLoaded(await loadData(KEYS.alphabetProgress, {})));
  dispatch(letterCaseChanged(await loadData(KEYS.alphabetCase, 'upper')));
};

// In Preview mode the choice lives only until the preview ends (previewCase) and is never saved.
export const setLetterCase = (letterCase) => (dispatch, getState) => {
  if (selectPreviewActive(getState())) {
    dispatch(previewCaseChanged(letterCase));
    return;
  }
  dispatch(letterCaseChanged(letterCase));
  saveData(KEYS.alphabetCase, getState().englishAlphabet.letterCase);
};

export const selectLetterCase = (state) =>
  (selectPreviewActive(state) && state.englishAlphabet.previewCase) || state.englishAlphabet.letterCase;

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
