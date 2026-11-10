// ENGLISH SLICE - the Redux Toolkit state of the English module.
//
// What is kept here:
//   topicId, level  - what the child picked for the Read Along session that is running
//   struggleWords   - words a child found hard, per child:
//                     { 'childId': [ { word: 'lightning', count: 3, topic: 'Weather' } ] }
//   customTopics    - topics made for one child (later: from "Personalize stories").
//                     Same shape as the topics in data/readingTopics.json.
//
// HOW TO USE IT in a screen:
//   const dispatch = useDispatch();
//   const { topicId } = useSelector((state) => state.english);
//   dispatch(topicChosen('animals'));
//
// Struggle words and custom topics are saved on the phone (AsyncStorage) by the two small
// "thunks" at the bottom (a thunk is just a function that can save and then dispatch).

import { createSelector, createSlice } from '@reduxjs/toolkit';
import { loadData, saveData } from '../../../shared/utils/storage';
import { BUILT_IN_TOPICS, findSentences } from '../readingData';

const SAVE_KEY = 'kidbuddy_english'; // one key for the whole module

const englishSlice = createSlice({
  name: 'english',
  initialState: {
    topicId: null, // 'animals' ...
    level: null, // 'easy' | 'medium' | 'hard'
    struggleWords: {},
    customTopics: [],
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
    // The saved data was read from the phone.
    englishDataLoaded(state, action) {
      state.struggleWords = action.payload.struggleWords || {};
      state.customTopics = action.payload.customTopics || [];
    },
    // A child struggled with a word: add it, or count it once more.
    struggleWordAdded(state, action) {
      const { childId, word, topic } = action.payload;
      const list = state.struggleWords[childId] || [];
      const found = list.find((item) => item.word.toLowerCase() === word.toLowerCase());
      if (found) found.count += 1;
      else list.push({ word, count: 1, topic: topic || '' });
      state.struggleWords[childId] = list;
    },
    // A new custom topic was made.
    customTopicAdded(state, action) {
      state.customTopics.push(action.payload);
    },
  },
});

export const { topicChosen, levelChosen, englishDataLoaded, struggleWordAdded, customTopicAdded } = englishSlice.actions;
export default englishSlice.reducer;

// ---------- selectors (small functions that read from the state) ----------

// Built-in topics + custom topics. (createSelector remembers the answer, so it is
// only rebuilt when the custom topics change.)
export const selectAllTopics = createSelector(
  [(state) => state.english.customTopics],
  (customTopics) => [...BUILT_IN_TOPICS, ...customTopics]
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
    const picked = findSentences(topics, topicId, level);
    return picked.length > 0 ? picked : findSentences(topics, topics[0].id, 'easy');
  }
);

// ---------- thunks (save to the phone) ----------

// Call once when the app starts (the store does it for you, see app/store/store.js).
export const loadEnglishData = () => async (dispatch) => {
  const saved = await loadData(SAVE_KEY, {});
  dispatch(englishDataLoaded(saved));
};

// Use this when speech scoring finds a word the child struggled with:
//   dispatch(reportStruggleWord(activeChild.id, 'lightning', 'Weather'));
export const reportStruggleWord = (childId, word, topic) => (dispatch, getState) => {
  dispatch(struggleWordAdded({ childId, word, topic }));
  const { struggleWords, customTopics } = getState().english;
  saveData(SAVE_KEY, { struggleWords, customTopics });
};

// Use this when a personalised topic has been generated:  dispatch(saveCustomTopic(topic))
export const saveCustomTopic = (topic) => (dispatch, getState) => {
  dispatch(customTopicAdded(topic));
  const { struggleWords, customTopics } = getState().english;
  saveData(SAVE_KEY, { struggleWords, customTopics });
};
