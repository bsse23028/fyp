// ENGLISH SLICE - the Redux Toolkit state of the English module.
//
// What is kept here:
//   topicId, level  - what the child picked for the Read Along session that is running
//   content         - the Read-Along content FROM THE DATABASE, for one child:
//                     { childId, levels: [...], topics: [...] }   (topics include the child's
//                     own custom topics at the end). Same shape as data/readingTopics.json.
//   contentStatus   - 'idle' | 'loading' | 'ready' | 'failed'   (+ contentError: the message)
//   struggleWords   - words a child found hard, per child, FROM THE SERVER:
//                     { 'childId': [ { word: 'lightning', count: 3, topic: 'Weather', ... } ] }
//   struggleStatus  - per child: 'loading' | 'ready' | 'failed'   (+ struggleError: the message)
//
// HOW TO USE IT in a screen:
//   const dispatch = useDispatch();
//   const { topicId } = useSelector((state) => state.english);
//   const topics = useSelector(selectAllTopics);
//   dispatch(topicChosen('animals'));
//
// Everything comes from the BACKEND (backend/docs/API.md):
//   fetchReadingContent({ childId })          GET  /api/reading/topics?childId=...
//                                             (runs by itself when a child is chosen, see
//                                              app/store/store.js - and only ONCE per child)
//   saveCustomTopic({ childId, topic })       POST /api/children/:childId/topics, then reloads
//   fetchStruggleWords(childId)               GET  /api/children/:childId/struggle-words
//   reportStruggleWord(childId, word, topic)  POST /api/children/:childId/struggle-words
//
// DEMO_MODE: while the content is not there (or could not be loaded), the built-in
// data/readingTopics.json is shown instead. With DEMO_MODE off there is no fallback.

import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { api } from '../../../shared/api/client';
import { DEMO_MODE } from '../../../shared/config';
import { logOut, sessionExpired } from '../../../app/store/authSlice';
import { DEMO_LEVELS, DEMO_TOPICS, findSentences } from '../readingData';

const LANGUAGE = 'en'; // this module's words are English

// ---------- reading content (topics, levels, sentences, Urdu) ----------

// { childId }            -> loads the content of this child, unless it is already loaded / loading
// { childId, force: true } -> loads it again (after a custom topic was saved)
export const fetchReadingContent = createAsyncThunk(
  'english/fetchReadingContent',
  async ({ childId }) => {
    return api.get(`/api/reading/topics?childId=${childId}`); // { levels, topics }
  },
  {
    // `condition` runs BEFORE the request: returning false skips it. This is what makes it
    // "fetch once": the same child's content is not asked for again.
    condition: ({ childId, force }, { getState }) => {
      const { contentChildId, contentStatus } = getState().english;
      if (force) return true;
      const sameChild = contentChildId === childId;
      return !(sameChild && (contentStatus === 'ready' || contentStatus === 'loading'));
    },
  }
);

// A personalised topic for one child:  dispatch(saveCustomTopic({ childId: activeChild.id, topic })).unwrap()
//   topic = { title, icon, tint, levels: { easy: [ SENTENCE, ... ] } }   (see readingData.js)
// The server saves it; then the topic list is loaded again, so it shows up straight away.
// Returns the saved topic (with its new id 'custom-...'). Throws if the server said no.
export const saveCustomTopic = createAsyncThunk('english/saveCustomTopic', async ({ childId, topic }, { dispatch }) => {
  const data = await api.post(`/api/children/${childId}/topics`, topic); // { topic }
  await dispatch(fetchReadingContent({ childId, force: true }));
  return data.topic;
});

// ---------- struggle words ----------

// The words of one child, most missed first  ->  { words: [...] }
export const fetchStruggleWords = createAsyncThunk('english/fetchStruggleWords', async (childId) => {
  return api.get(`/api/children/${childId}/struggle-words?language=${LANGUAGE}`);
});

// A child struggled with a word. The server adds it, or counts it once more  ->  { word: {...} }
export const addStruggleWord = createAsyncThunk('english/addStruggleWord', async ({ childId, word, topic }) => {
  const body = { word, language: LANGUAGE };
  if (topic) body.topic = topic; // a topic id ('weather') or title ('Weather')
  return api.post(`/api/children/${childId}/struggle-words`, body);
});

// Use this when speech scoring finds a word the child struggled with:
//   dispatch(reportStruggleWord(activeChild.id, 'lightning', 'Weather'));
export const reportStruggleWord = (childId, word, topic) => addStruggleWord({ childId, word, topic });

// ---------- the slice ----------

// What belongs to the logged-in parent's children (emptied on logout).
const emptyServerData = {
  content: null,
  contentChildId: null,
  contentStatus: 'idle',
  contentError: null,
  struggleWords: {},
  struggleStatus: {},
  struggleError: {},
};

const englishSlice = createSlice({
  name: 'english',
  initialState: {
    topicId: null, // 'animals' ...
    level: null, // 'easy' | 'medium' | 'hard'
    ...emptyServerData,
  },
  reducers: {
    // The child picked a topic (the level must be picked again).
    topicChosen(state, action) {
      state.topicId = action.payload;
      state.level = null;
    },
    // The child picked a level.
    levelChosen(state, action) {
      state.level = action.payload;
    },
  },
  extraReducers: (builder) => {
    const clear = (state) => {
      Object.assign(state, emptyServerData);
    };

    builder
      // ----- reading content -----
      .addCase(fetchReadingContent.pending, (state, action) => {
        const { childId } = action.meta.arg;
        // Another child: their content (custom topics!) must not be shown to this one.
        if (state.contentChildId !== childId) state.content = null;
        state.contentChildId = childId;
        state.contentStatus = 'loading';
        state.contentError = null;
      })
      .addCase(fetchReadingContent.fulfilled, (state, action) => {
        if (state.contentChildId !== action.meta.arg.childId) return; // an older answer: ignore it
        state.content = { childId: action.meta.arg.childId, ...action.payload };
        state.contentStatus = 'ready';
      })
      .addCase(fetchReadingContent.rejected, (state, action) => {
        if (action.meta.condition) return; // skipped by `condition` (already loaded): not an error
        if (state.contentChildId !== action.meta.arg.childId) return;
        state.contentStatus = 'failed';
        state.contentError = action.error.message;
      })

      // ----- struggle words -----
      .addCase(fetchStruggleWords.pending, (state, action) => {
        state.struggleStatus[action.meta.arg] = 'loading';
        state.struggleError[action.meta.arg] = null;
      })
      .addCase(fetchStruggleWords.fulfilled, (state, action) => {
        state.struggleWords[action.meta.arg] = action.payload.words;
        state.struggleStatus[action.meta.arg] = 'ready';
      })
      .addCase(fetchStruggleWords.rejected, (state, action) => {
        state.struggleStatus[action.meta.arg] = 'failed';
        state.struggleError[action.meta.arg] = action.error.message;
      })
      // The server sends back the saved word with its new count: put it in the list.
      .addCase(addStruggleWord.fulfilled, (state, action) => {
        const { childId } = action.meta.arg;
        const saved = action.payload.word;
        const list = state.struggleWords[childId] || [];
        const index = list.findIndex((item) => item.word.toLowerCase() === saved.word.toLowerCase());
        if (index >= 0) list[index] = saved;
        else list.push(saved);
        state.struggleWords[childId] = list;
      })

      // ----- logged out: forget everything of this parent's children -----
      .addCase(logOut.fulfilled, clear)
      .addCase(sessionExpired, clear);
  },
});

export const { topicChosen, levelChosen } = englishSlice.actions;
export default englishSlice.reducer;

// ---------- selectors (small functions that read from the state) ----------

// All topics of the child (built-in + custom) from the database.
// Not loaded? DEMO_MODE shows readingTopics.json; otherwise there are no topics yet.
// (createSelector remembers the answer, so it is only rebuilt when the content changes.)
export const selectAllTopics = createSelector([(state) => state.english.content], (content) => {
  if (content) return content.topics;
  return DEMO_MODE ? DEMO_TOPICS : [];
});

// Easy / Medium / Hard, from the database (same fallback as above).
export const selectLevels = createSelector([(state) => state.english.content], (content) => {
  if (content) return content.levels;
  return DEMO_MODE ? DEMO_LEVELS : [];
});

// Is the content usable? { loading, error }  (used by the topics screen for its spinner / Retry)
export const selectContentState = createSelector(
  [(state) => state.english.contentStatus, (state) => state.english.contentError],
  (status, error) => ({ loading: status === 'loading' || status === 'idle', error: status === 'failed' ? error : null })
);

// The topic the child picked (or null).
export const selectTopic = createSelector(
  [selectAllTopics, (state) => state.english.topicId],
  (topics, topicId) => topics.find((t) => t.id === topicId) || null
);

// The sentences of the picked topic + level.
// Nothing picked yet? Fall back to the first topic, easy level, so a screen never breaks.
export const selectSentences = createSelector(
  [selectAllTopics, (state) => state.english.topicId, (state) => state.english.level],
  (topics, topicId, level) => {
    if (topics.length === 0) return [];
    const picked = findSentences(topics, topicId, level);
    return picked.length > 0 ? picked : findSentences(topics, topics[0].id, 'easy');
  }
);
