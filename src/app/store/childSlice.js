// CHILD SLICE - the child profiles of the logged-in parent and the Parent / Child MODE,
// kept in Redux Toolkit. The profiles now come from the BACKEND (backend/docs/API.md).
// (Before, they were saved on the phone with AsyncStorage.)
//
// A child profile looks like this (the server sends exactly this shape):
//   {
//     id: '12', name, ageBand: '4–6 years', avatar: 'rabbit', language: 'en',
//     supports: ['Reading', ...],          areas of support
//     modules:  ['Read-Along', ...],       activities switched on
//     story:    answers of "Personalize my child's stories" (see shared/utils/storyOptions.js),
//     reading:  { date: '2026-10-12', starsToday: 3, sessions: 1 },   latest Read-Along day
//     activity: { '2026-10-12': { sessions: 1, stars: 3 }, ... },   history for Parent progress
//   }
// `reading` and `activity` are worked out by the SERVER. After a reading session is saved
// (saveReadingSession) the server sends the new totals and they replace the old ones.
//
// TWO MODES:
//   Parent Mode (default, every time the app opens) - add / edit / delete children, progress, settings.
//   Child Mode  - started by choosing a child on "Who is learning?". The MODE is not saved,
//                 but the server remembers which child was chosen last (activeId).
//
// THE CHOICE LISTS (age bands, avatars, relations, supports, modules) also come from the
// server (GET /api/options) and are kept here in `options`. See useChildOptions.js.
//
// Screens do not use this file directly. They call  useChild()  (see useChild.js),
// which gives the same functions as before: addChild, updateChild, deleteChild ...
//
// The thunks (createAsyncThunk) talk to the server, exactly like in authSlice.js:
//   pending -> fulfilled (it worked, action.payload = the answer)  or  rejected (it failed).

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../shared/api/client';
import { logOut, sessionExpired } from './authSlice';
import { notInPreview } from './previewSlice';

// Runs one request. If it fails, the thunk is "rejected" with { message, status }
// (status 0 = the server could not be reached). useChild.js uses the status to decide
// whether a "Retry" button makes sense.
async function callServer(work, rejectWithValue) {
  try {
    return await work();
  } catch (error) {
    return rejectWithValue({ message: error.message, status: error.status });
  }
}

// ---------- the choice lists (public, no login needed) ----------

export const loadOptions = createAsyncThunk('child/loadOptions', async (_, { rejectWithValue }) =>
  callServer(() => api.get('/api/options'), rejectWithValue)
);

// ---------- the child profiles (logged in) ----------

// GET /api/children  ->  { children: [...], activeId: '12' | null }
export const fetchChildren = createAsyncThunk('child/fetchChildren', async (_, { getState, rejectWithValue }) =>
  callServer(async () => {
    const data = await api.get('/api/children');
    // The parent logged out while we were waiting: do not show their children any more.
    if (!getState().auth.user) return { children: [], activeId: null };
    return data;
  }, rejectWithValue)
);

// POST /api/children  ->  { child }
export const createChild = createAsyncThunk(
  'child/createChild',
  async (profile, { rejectWithValue }) => callServer(() => api.post('/api/children', profile), rejectWithValue),
  { condition: notInPreview }
);

// PATCH /api/children/:id  (only the fields that change)  ->  { child }
export const saveChildChanges = createAsyncThunk(
  'child/saveChildChanges',
  async ({ id, changes }, { rejectWithValue }) => callServer(() => api.patch(`/api/children/${id}`, changes), rejectWithValue),
  { condition: notInPreview }
);

// DELETE /api/children/:id  ->  204 (no body). We return the id so the reducer knows which one.
export const removeChild = createAsyncThunk(
  'child/removeChild',
  async (id, { rejectWithValue }) =>
    callServer(async () => {
      await api.delete(`/api/children/${id}`);
      return id;
    }, rejectWithValue),
  { condition: notInPreview }
);

// "Continue as Zara": POST /api/children/:id/select  ->  { activeId }
export const selectChild = createAsyncThunk(
  'child/selectChild',
  async (id, { rejectWithValue }) => callServer(() => api.post(`/api/children/${id}/select`), rejectWithValue),
  { condition: notInPreview }
);

// A Read-Along session finished: POST /api/children/:id/sessions
//   session = { childId, clientSessionId, stars, topicId, level, language, sessionDate }
// The server answers with the child's NEW totals: { duplicate, reading, activity }.
// Sending the same clientSessionId again (Retry) never adds the stars twice.
export const saveReadingSession = createAsyncThunk(
  'child/saveReadingSession',
  async (session, { rejectWithValue }) => {
    const { childId, ...body } = session;
    return callServer(() => api.post(`/api/children/${childId}/sessions`, body), rejectWithValue);
  },
  { condition: notInPreview }
);

// Loads the children ONCE even if two places ask at the same time
// (ChildLoader and the Log In screen both ask right after logging in).
// Returns the list (the Log In screen uses it to choose the next screen). Throws if it failed.
let loadingNow = null;
export const loadChildren = () => (dispatch) => {
  if (!loadingNow) {
    loadingNow = dispatch(fetchChildren())
      .unwrap()
      .then((data) => data.children)
      .finally(() => {
        loadingNow = null;
      });
  }
  return loadingNow;
};

// ---------- the slice ----------

const emptyState = {
  list: [], // every child profile of this parent
  activeId: null, // id of the child who uses (or last used) the app
  childMode: false, // false = Parent Mode
};

const childSlice = createSlice({
  name: 'child',
  initialState: {
    ...emptyState,
    loading: true, // only true until the FIRST load is done (the app shows a spinner)
    error: null, // why the children could not be loaded (the app shows it with a Retry button)
    options: null, // the answer of GET /api/options, or null if it is not loaded
    optionsStatus: 'idle', // 'idle' | 'loading' | 'ready' | 'failed'
    optionsError: null,
  },
  reducers: {
    // Nobody is logged in: forget the children (the choice lists are kept, they are public).
    childrenCleared(state) {
      Object.assign(state, emptyState);
      state.loading = false;
      state.error = null;
    },

    // Back to Parent Mode (after the Parent PIN was accepted).
    childModeExited(state) {
      state.childMode = false;
    },
  },
  extraReducers: (builder) => {
    const clear = (state) => {
      Object.assign(state, emptyState);
      state.error = null;
    };

    builder
      // ----- choice lists -----
      .addCase(loadOptions.pending, (state) => {
        state.optionsStatus = 'loading';
        state.optionsError = null;
      })
      .addCase(loadOptions.fulfilled, (state, action) => {
        state.options = action.payload;
        state.optionsStatus = 'ready';
      })
      .addCase(loadOptions.rejected, (state, action) => {
        state.optionsStatus = 'failed';
        state.optionsError = action.payload ? action.payload.message : action.error.message;
      })

      // ----- the list of children -----
      .addCase(fetchChildren.pending, (state) => {
        state.error = null; // a Retry is running: show the spinner again
      })
      .addCase(fetchChildren.fulfilled, (state, action) => {
        const { children, activeId } = action.payload;
        state.list = children;
        state.activeId = activeId || (children.length > 0 ? children[0].id : null);
        state.childMode = false; // always start in Parent Mode
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchChildren.rejected, (state, action) => {
        state.error = action.payload ? action.payload.message : action.error.message;
      })

      // ----- one child -----
      .addCase(createChild.fulfilled, (state, action) => {
        state.list.push(action.payload.child);
        if (!state.activeId) state.activeId = action.payload.child.id;
      })
      .addCase(saveChildChanges.fulfilled, (state, action) => {
        const saved = action.payload.child; // the server sends back the whole, saved child
        const index = state.list.findIndex((c) => c.id === saved.id);
        if (index >= 0) state.list[index] = saved;
      })
      .addCase(removeChild.fulfilled, (state, action) => {
        const id = action.payload;
        state.list = state.list.filter((c) => c.id !== id);
        if (state.activeId === id) state.activeId = state.list.length > 0 ? state.list[0].id : null;
      })
      .addCase(selectChild.fulfilled, (state, action) => {
        state.activeId = action.payload.activeId;
        state.childMode = true;
      })
      // The session is saved: use the server's totals (Child Home stars, Parent Home, Parent Progress).
      .addCase(saveReadingSession.fulfilled, (state, action) => {
        const child = state.list.find((c) => c.id === action.meta.arg.childId);
        if (!child) return;
        child.reading = action.payload.reading;
        child.activity = action.payload.activity;
      })

      // ----- logging out (by the parent, or because the login expired) -----
      .addCase(logOut.fulfilled, clear)
      .addCase(sessionExpired, clear);
  },
});

export const { childrenCleared, childModeExited } = childSlice.actions;
export default childSlice.reducer;
