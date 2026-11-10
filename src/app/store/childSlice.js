// CHILD SLICE - the child profiles of the logged-in parent and the Parent / Child MODE,
// kept in Redux Toolkit.  (Before, this lived in a ChildContext.)
//
// A child profile looks like this (it is saved with AsyncStorage):
//   {
//     id, name, ageBand, avatar: 'rabbit', language: 'en',
//     supports: ['Reading', ...],          areas of support
//     modules:  ['Read-Along', ...],       activities switched on
//     story:    answers of "Personalize my child's stories" (see shared/utils/storyOptions.js),
//     reading:  { date: '2026-10-12', starsToday: 3, sessions: 1 },
//     activity: { '2026-10-12': { sessions: 1, stars: 3 }, ... },   history for Parent progress
//   }
//
// TWO MODES:
//   Parent Mode (default, every time the app opens) - add / edit / delete children, progress, settings.
//   Child Mode  - started by choosing a child on "Who is learning?". It is NOT saved.
//
// Screens do not use this file directly. They call  useChild()  (see useChild.js),
// which gives the same functions as before: addChild, updateChild, deleteChild ...
//
// The "reducers" below change the state. The "thunks" at the bottom save the list on the phone.

import { createSlice } from '@reduxjs/toolkit';
import { KEYS, loadData, saveData } from '../../shared/utils/storage';
import { dayKey } from '../../shared/utils/progress';
import { AVATARS, DEFAULT_AVATAR } from '../../shared/theme/avatars';

const childSlice = createSlice({
  name: 'child',
  initialState: {
    list: [], // every child profile of this parent
    activeId: null, // id of the child who uses (or last used) the app
    childMode: false, // false = Parent Mode
    loading: true, // only true until the FIRST load is done
  },
  reducers: {
    // The saved children were read from the phone.
    childrenLoaded(state, action) {
      state.list = action.payload.list;
      state.activeId = action.payload.activeId;
      state.childMode = false; // always start in Parent Mode
      state.loading = false;
    },

    // Nobody is logged in: forget everything.
    childrenCleared(state) {
      state.list = [];
      state.activeId = null;
      state.childMode = false;
      state.loading = false;
    },

    // A new child. `prepare` builds the full profile (id + empty progress) before the reducer runs.
    childAdded: {
      reducer(state, action) {
        state.list.push(action.payload);
        if (!state.activeId) state.activeId = action.payload.id;
      },
      prepare(profile) {
        return {
          payload: {
            ...profile,
            id: String(Date.now()),
            reading: { date: dayKey(), starsToday: 0, sessions: 0 },
            activity: {},
          },
        };
      },
    },

    // Changes some fields of a child:  { id, changes: { avatar: 'wolf' } }
    childUpdated(state, action) {
      const { id, changes } = action.payload;
      const index = state.list.findIndex((c) => c.id === id);
      if (index >= 0) Object.assign(state.list[index], changes);
    },

    // Removes a child for good.
    childDeleted(state, action) {
      state.list = state.list.filter((c) => c.id !== action.payload);
      if (state.activeId === action.payload) {
        state.activeId = state.list.length > 0 ? state.list[0].id : null;
      }
    },

    // "Continue as Zara": this child is now using the app.
    childModeEntered(state, action) {
      state.activeId = action.payload;
      state.childMode = true;
    },

    // Back to Parent Mode (after the Parent PIN was accepted).
    childModeExited(state) {
      state.childMode = false;
    },

    // Adds stars after a reading session (today's count starts again from 0 each new day).
    readingResultAdded(state, action) {
      const child = state.list.find((c) => c.id === state.activeId);
      if (!child) return;
      const stars = action.payload;
      const today = dayKey();
      const old = child.reading && child.reading.date === today ? child.reading : { date: today, starsToday: 0, sessions: 0 };
      const day = (child.activity && child.activity[today]) || { sessions: 0, stars: 0 };
      child.reading = { date: today, starsToday: old.starsToday + stars, sessions: old.sessions + 1 };
      if (!child.activity) child.activity = {};
      child.activity[today] = { sessions: day.sessions + 1, stars: day.stars + stars };
    },
  },
});

export const {
  childrenLoaded,
  childrenCleared,
  childAdded,
  childUpdated,
  childDeleted,
  childModeEntered,
  childModeExited,
  readingResultAdded,
} = childSlice.actions;
export default childSlice.reducer;

// ---------- thunks (they change the state AND save it on the phone) ----------

// Saves the current list for this parent.
function saveList(email, getState) {
  if (email) saveData(KEYS.children(email), getState().child.list);
}

// Reads this parent's children from the phone. Returns them (Login uses that).
export const loadChildren = (email) => async (dispatch) => {
  const saved = await loadData(KEYS.children(email), []);
  // Profiles saved by an older version used colour avatars ('lavender' ...): show them as the rabbit.
  const list = saved.map((c) => (AVATARS.some((a) => a.id === c.avatar) ? c : { ...c, avatar: DEFAULT_AVATAR }));
  const savedActive = await loadData(KEYS.activeChild(email), null);
  const stillExists = list.some((c) => c.id === savedActive);
  const activeId = stillExists ? savedActive : list.length > 0 ? list[0].id : null;
  dispatch(childrenLoaded({ list, activeId }));
  return list;
};

// Adds a new child (does NOT switch to Child Mode). Returns the new child.
export const addChild = (email, profile) => (dispatch, getState) => {
  const action = dispatch(childAdded(profile));
  saveList(email, getState);
  return action.payload;
};

export const updateChild = (email, id, changes) => (dispatch, getState) => {
  dispatch(childUpdated({ id, changes }));
  saveList(email, getState);
};

export const deleteChild = (email, id) => (dispatch, getState) => {
  dispatch(childDeleted(id));
  saveList(email, getState);
  if (email) saveData(KEYS.activeChild(email), getState().child.activeId);
};

export const enterChildMode = (email, id) => (dispatch) => {
  dispatch(childModeEntered(id));
  if (email) saveData(KEYS.activeChild(email), id);
};

export const addReadingResult = (email, stars) => (dispatch, getState) => {
  dispatch(readingResultAdded(stars));
  saveList(email, getState);
};
