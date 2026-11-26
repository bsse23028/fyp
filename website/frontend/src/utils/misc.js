// MISC - small helpers used in several places: the greeting, ids, safe browser storage.

// "Good morning / afternoon / evening / night" from the computer's clock: 5-12 morning, 12-17 afternoon, 17-20 evening, 20-5 night.
export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return { text: 'Good morning!', emoji: '🌞' };
  if (hour >= 12 && hour < 17) return { text: 'Good afternoon!', emoji: '☀️' };
  if (hour >= 17 && hour < 20) return { text: 'Good evening!', emoji: '🌆' };
  return { text: 'Good night!', emoji: '🌙' }; // 8 pm - 5 am (the app says "Good evening" here too; the website says night)
}

// A random UUID (used once per Read-Along session so a retry never counts the stars twice).
export function makeUuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// Browser storage that never crashes (private windows can block it). Keys start with kidbuddy_.
export const KEYS = {
  language: 'kidbuddy_language',
  introSeen: 'kidbuddy_intro_seen',
  permissions: 'kidbuddy_permissions',
  alphabetProgress: 'kidbuddy_alphabet_progress',
  alphabetCase: 'kidbuddy_alphabet_case',
  sound: 'kidbuddy_sound',
  motion: 'kidbuddy_motion',
  aacBig: 'kidbuddy_aac_big', // the Talk board: big buttons (true) or all words (false)
  explored: 'kidbuddy_explored', // the parent already tried Explore KidBuddy (or tapped "Not now")
  // per browser TAB (sessionStorage): Child Mode must survive a refresh, so a child cannot
  // "refresh" their way back into Parent Mode.
  childMode: 'kidbuddy_child_mode',
  preview: 'kidbuddy_preview',
};

export function loadData(key, fallback, store = 'local') {
  try {
    const raw = (store === 'session' ? sessionStorage : localStorage).getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

export function saveData(key, value, store = 'local') {
  try {
    (store === 'session' ? sessionStorage : localStorage).setItem(key, JSON.stringify(value));
  } catch (error) {
    // storage blocked: the setting simply is not remembered
  }
}

export function removeData(key, store = 'local') {
  try {
    (store === 'session' ? sessionStorage : localStorage).removeItem(key);
  } catch (error) {
    // ignore
  }
}

export function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Add or remove one item from a list.
export function toggleInList(list, item) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}
