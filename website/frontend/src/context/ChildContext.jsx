// CHILD CONTEXT - the child profiles, Parent / Child MODE, Preview mode and the English module's data.
// It mirrors the mobile app's childSlice + useChild + previewSlice + englishSlice + alphabetSlice:
//
//   const { childProfiles, activeChild, childMode, addChild, updateChild, deleteChild,
//           enterChildMode, exitChildMode, startPreview, endPreview, isPreview, options ... } = useChild();
//
// WHERE THE DATA LIVES
//   child profiles, progress, struggle words, reading topics  -> the shared API (the same database as the app)
//   Child Mode / Preview switch  -> this browser TAB (sessionStorage), so a refresh never drops a child
//                                   back into Parent Mode; it ends on logout or with the Parent PIN
//   alphabet stars + A/a choice  -> this browser (localStorage), exactly like the app keeps them on the phone
//
// Saving functions return a PROMISE: the result (or true) when it worked, null when it failed.
// On failure a pop-up explains why, with "Retry" when trying again can help (like the app).

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';
import { AVATARS } from '../data/avatars';
import { AGE_BANDS, LANGUAGES, MODULES, SUPPORT_OPTIONS, defaultModules } from '../data/childOptions';
import { RELATIONS } from '../data/storyOptions';
import { DEMO_LEVELS, DEMO_TOPICS } from '../data/readingData';
import { KEYS, loadData, removeData, saveData } from '../utils/misc';

const ChildContext = createContext(null);

// "Buddy", the demo child of Preview mode (never saved, never in the list).
export const DEMO_CHILD = Object.freeze({
  id: 'preview-buddy',
  name: 'Buddy',
  ageBand: '',
  avatar: 'rabbit',
  language: 'en',
  supports: [],
  modules: [],
  story: {},
  reading: null,
  activity: {},
  isDemo: true,
});

const FALLBACK_OPTIONS = {
  ageBands: AGE_BANDS,
  languages: LANGUAGES,
  supports: SUPPORT_OPTIONS,
  modules: MODULES,
  defaultModuleNames: defaultModules(),
  relations: RELATIONS,
  avatars: AVATARS,
};

function fromServer(options) {
  const codes = options.avatars.map((a) => a.code);
  return {
    ageBands: options.ageBands.map((band) => band.label),
    languages: options.languages.map((lang) => ({ id: lang.code, label: lang.nativeName })),
    supports: options.supports.map((s) => s.name),
    modules: options.modules.map((m) => ({ name: m.name, sensor: m.sensor || '', supports: m.supports })),
    defaultModuleNames: options.modules.filter((m) => m.onByDefault).map((m) => m.name),
    relations: options.relations.map((r) => r.name),
    avatars: AVATARS.filter((avatar) => codes.includes(avatar.id)),
  };
}

export function ChildProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { confirm, alert } = useUI();

  const [rawOptions, setRawOptions] = useState(null);
  const [optionsStatus, setOptionsStatus] = useState('idle');
  const [list, setList] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loadedUserId, setLoadedUserId] = useState(null); // whose children are in `list`
  const [error, setError] = useState(null);
  const [childMode, setChildModeState] = useState(() => loadData(KEYS.childMode, false, 'session'));
  const [isPreview, setPreviewState] = useState(() => loadData(KEYS.preview, false, 'session'));

  // English module data from the server, per child.
  const [reading, setReading] = useState({ childId: null, status: 'idle', error: null, content: null });
  const [struggle, setStruggle] = useState({}); // childId -> { status, error, words }
  // Alphabet stars per child + letter, and the A / a choice (browser storage, like the app's phone storage).
  const [letterStars, setLetterStars] = useState(() => loadData(KEYS.alphabetProgress, {}));
  const [savedCase, setSavedCase] = useState(() => loadData(KEYS.alphabetCase, 'upper'));
  const [previewCase, setPreviewCase] = useState(null);

  const loadingNow = useRef(null);

  const setChildMode = (on) => {
    setChildModeState(on);
    if (on) saveData(KEYS.childMode, true, 'session');
    else removeData(KEYS.childMode, 'session');
  };
  const setPreview = (on) => {
    setPreviewState(on);
    if (on) saveData(KEYS.preview, true, 'session');
    else removeData(KEYS.preview, 'session');
    setPreviewCase(null);
  };

  // ----- the choice lists (public) -----
  const loadOptions = useCallback(async () => {
    setOptionsStatus('loading');
    try {
      setRawOptions(await api.get('/api/options'));
      setOptionsStatus('ready');
    } catch (err) {
      setOptionsStatus('failed');
    }
  }, []);
  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  // ----- the children of the logged-in parent -----
  const userId = user ? user.id : null;
  const loadChildren = useCallback(() => {
    if (!loadingNow.current) {
      setError(null);
      loadingNow.current = api
        .get('/api/children')
        .then((data) => {
          setList(data.children);
          setActiveId(data.activeId || (data.children[0] ? data.children[0].id : null));
          setLoadedUserId(userId);
          return data.children;
        })
        .catch((err) => {
          setError(err.message);
          throw err;
        })
        .finally(() => {
          loadingNow.current = null;
        });
    }
    return loadingNow.current;
  }, [userId]);

  const clearAll = useCallback(() => {
    setList([]);
    setActiveId(null);
    setChildMode(false);
    setPreview(false);
    setReading({ childId: null, status: 'idle', error: null, content: null });
    setStruggle({});
    setLoadedUserId(null);
    setError(null);
  }, []);

  // (Wait for the saved-login check first, or a refresh would wipe Child Mode before we know who is here.)
  useEffect(() => {
    if (authLoading) return;
    if (userId) loadChildren().catch(() => {});
    else clearAll();
  }, [authLoading, userId, loadChildren, clearAll]);

  // true from the moment a parent is logged in until THEIR children have arrived
  const loading = Boolean(userId) && loadedUserId !== userId;

  useEffect(() => {
    const onEnd = () => clearAll();
    window.addEventListener('kidbuddy:session-expired', onEnd);
    window.addEventListener('kidbuddy:logged-out', onEnd);
    return () => {
      window.removeEventListener('kidbuddy:session-expired', onEnd);
      window.removeEventListener('kidbuddy:logged-out', onEnd);
    };
  }, [clearAll]);

  // Runs a request; on failure shows a pop-up (with Retry when it can help). Resolves to the result or null.
  const runWithPopup = useCallback(
    async (work, title) => {
      for (;;) {
        try {
          const result = await work();
          return result || true;
        } catch (err) {
          if (err.status === 401) return null;
          const canRetry = !err.status || err.status >= 500;
          if (canRetry) {
            const again = await confirm({ title, message: err.message, confirmLabel: 'Retry' });
            if (!again) return null;
          } else {
            await alert({ title, message: err.message });
            return null;
          }
        }
      }
    },
    [confirm, alert]
  );

  // ----- the English module: reading content and struggle words -----
  const fetchReadingContent = useCallback(
    async (childId, force = false) => {
      if (!childId || isPreview) return;
      let skip = false;
      setReading((r) => {
        if (!force && r.childId === childId && (r.status === 'ready' || r.status === 'loading')) {
          skip = true;
          return r;
        }
        return { childId, status: 'loading', error: null, content: r.childId === childId ? r.content : null };
      });
      if (skip) return;
      try {
        const data = await api.get(`/api/reading/topics?childId=${encodeURIComponent(childId)}`);
        setReading((r) => (r.childId === childId ? { childId, status: 'ready', error: null, content: data } : r));
      } catch (err) {
        setReading((r) => (r.childId === childId ? { ...r, status: 'failed', error: err.message } : r));
      }
    },
    [isPreview]
  );

  const fetchStruggleWords = useCallback(
    async (childId) => {
      if (!childId || isPreview) return;
      setStruggle((s) => ({ ...s, [childId]: { ...(s[childId] || {}), status: 'loading', error: null } }));
      try {
        const data = await api.get(`/api/children/${encodeURIComponent(childId)}/struggle-words?language=en`);
        setStruggle((s) => ({ ...s, [childId]: { status: 'ready', error: null, words: data.words } }));
      } catch (err) {
        setStruggle((s) => ({ ...s, [childId]: { ...(s[childId] || {}), status: 'failed', error: err.message } }));
      }
    },
    [isPreview]
  );

  const value = useMemo(() => {
    const options = rawOptions ? fromServer(rawOptions) : FALLBACK_OPTIONS;
    const activeChild = isPreview ? DEMO_CHILD : list.find((c) => c.id === activeId) || null;
    const inChildMode = childMode || isPreview;
    const previewSafe = (work) => (...args) => (isPreview ? Promise.resolve(true) : work(...args));

    // A real child only ever sees the topics the server sent for them (never the built-in demo file).
    const topics = isPreview ? DEMO_TOPICS : reading.content ? reading.content.topics : [];
    const levels = isPreview ? DEMO_LEVELS : reading.content ? reading.content.levels : [];

    const starsFor = (childId) => (isPreview || !childId ? {} : letterStars[childId] || {});

    return {
      // ----- profiles -----
      childProfiles: list,
      activeChild,
      childMode: inChildMode,
      displayAvatar: inChildMode && activeChild ? activeChild.avatar : 'rabbit',
      loading,
      error,
      loadChildren,

      // ----- choice lists -----
      options: {
        ...options,
        defaultModules: () => options.defaultModuleNames,
        suggestModules: (supports) =>
          supports.length === 0
            ? options.defaultModuleNames
            : options.modules.filter((m) => m.supports.some((s) => supports.includes(s))).map((m) => m.name),
      },
      optionsStatus,
      loadOptions,

      addChild: previewSafe((profile) =>
        runWithPopup(async () => {
          const data = await api.post('/api/children', profile);
          setList((l) => [...l, data.child]);
          setActiveId((id) => id || data.child.id);
          return data.child;
        }, 'Could not save')
      ),
      updateChild: previewSafe((id, changes) =>
        runWithPopup(async () => {
          const data = await api.patch(`/api/children/${encodeURIComponent(id)}`, changes);
          setList((l) => l.map((c) => (c.id === data.child.id ? data.child : c)));
          return data.child;
        }, 'Could not save')
      ),
      deleteChild: previewSafe((id) =>
        runWithPopup(async () => {
          await api.delete(`/api/children/${encodeURIComponent(id)}`);
          setList((l) => {
            const next = l.filter((c) => c.id !== id);
            setActiveId((current) => (current === id ? (next[0] ? next[0].id : null) : current));
            return next;
          });
          return true;
        }, 'Could not delete')
      ),
      enterChildMode: previewSafe((id) =>
        runWithPopup(async () => {
          const data = await api.post(`/api/children/${encodeURIComponent(id)}/select`);
          setActiveId(data.activeId);
          setChildMode(true);
          fetchReadingContent(data.activeId);
          return true;
        }, 'Could not open Child Mode')
      ),
      exitChildMode: () => {
        setChildMode(false);
        setPreview(false);
      },

      // A Read-Along session finished. Retry sends the SAME object (same clientSessionId), never counted twice.
      addReadingResult: previewSafe((session) =>
        runWithPopup(async () => {
          const { childId, ...body } = session;
          const data = await api.post(`/api/children/${encodeURIComponent(childId)}/sessions`, body);
          setList((l) => l.map((c) => (c.id === childId ? { ...c, reading: data.reading, activity: data.activity } : c)));
          return data;
        }, 'Your stars are not saved yet')
      ),

      // ----- Preview mode (Explore KidBuddy) -----
      isPreview,
      startPreview: () => setPreview(true),
      endPreview: () => setPreview(false),

      // ----- English: Read Along -----
      topics,
      levels,
      readingState: isPreview
        ? { loading: false, error: null }
        : { loading: reading.status === 'loading' || (reading.status === 'idle' && Boolean(activeChild)), error: reading.status === 'failed' ? reading.error : null },
      fetchReadingContent,
      saveCustomTopic: previewSafe(async (childId, topic) => {
        const data = await api.post(`/api/children/${encodeURIComponent(childId)}/topics`, topic);
        await fetchReadingContent(childId, true);
        return data.topic;
      }),

      // ----- English: struggle words -----
      struggle,
      fetchStruggleWords,
      reportStruggleWord: previewSafe(async (childId, word, topic) => {
        const body = { word, language: 'en' };
        if (topic) body.topic = topic;
        const data = await api.post(`/api/children/${encodeURIComponent(childId)}/struggle-words`, body);
        setStruggle((s) => {
          const current = (s[childId] && s[childId].words) || [];
          const index = current.findIndex((w) => w.word.toLowerCase() === data.word.word.toLowerCase());
          const words = index >= 0 ? current.map((w, i) => (i === index ? data.word : w)) : [...current, data.word];
          return { ...s, [childId]: { status: 'ready', error: null, words } };
        });
        return data.word;
      }),

      // ----- English: alphabet stars + A/a -----
      letterStars: starsFor,
      recordLetterResult: (childId, letter, stars) => {
        if (!childId || isPreview) return;
        const safe = Math.max(0, Math.min(3, Math.round(stars)));
        setLetterStars((all) => {
          const best = (all[childId] || {})[letter] || 0;
          if (safe <= best) return all;
          const next = { ...all, [childId]: { ...(all[childId] || {}), [letter]: safe } };
          saveData(KEYS.alphabetProgress, next);
          return next;
        });
      },
      alphabetProgress: (childId) => {
        const stars = starsFor(childId);
        const done = Object.keys(stars).filter((l) => stars[l] > 0).length;
        return { title: 'Alphabet', done, total: 26 };
      },
      letterCase: (isPreview && previewCase) || savedCase,
      setLetterCase: (value) => {
        const safe = value === 'lower' ? 'lower' : 'upper';
        if (isPreview) setPreviewCase(safe);
        else {
          setSavedCase(safe);
          saveData(KEYS.alphabetCase, safe);
        }
      },
    };
  }, [rawOptions, optionsStatus, list, activeId, loading, error, childMode, isPreview, reading, struggle, letterStars, savedCase, previewCase, loadChildren, loadOptions, runWithPopup, fetchReadingContent, fetchStruggleWords]);

  return <ChildContext.Provider value={value}>{children}</ChildContext.Provider>;
}

export function useChild() {
  return useContext(ChildContext);
}
