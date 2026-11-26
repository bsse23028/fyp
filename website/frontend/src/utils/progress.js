// PROGRESS - turns a child's saved reading history into numbers for the parent pages
// (the same helpers as the mobile app's src/shared/utils/progress.js).
// A child has `activity`: { '2026-10-12': { sessions: 1, stars: 3 } } (worked out by the server).

export function dayKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function lastDays(child, count = 7) {
  const activity = (child && child.activity) || {};
  const days = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    const entry = activity[key] || { sessions: 0, stars: 0 };
    days.push({ key, label: DAY_NAMES[d.getDay()], sessions: entry.sessions, stars: entry.stars });
  }
  return days;
}

export function weekTotals(child) {
  return lastDays(child, 7).reduce(
    (sum, day) => ({ sessions: sum.sessions + day.sessions, stars: sum.stars + day.stars }),
    { sessions: 0, stars: 0 }
  );
}

export function streakDays(child) {
  const activity = (child && child.activity) || {};
  let streak = 0;
  const d = new Date();
  if (!activity[dayKey(d)]) d.setDate(d.getDate() - 1);
  while (activity[dayKey(d)]) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function allTimeTotals(child) {
  const activity = (child && child.activity) || {};
  return Object.keys(activity).reduce(
    (sum, key) => ({ sessions: sum.sessions + activity[key].sessions, stars: sum.stars + activity[key].stars }),
    { sessions: 0, stars: 0 }
  );
}

export function lastActiveText(child) {
  const activity = (child && child.activity) || {};
  for (let i = 0; i < 60; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (activity[dayKey(d)]) return i === 0 ? 'Today' : i === 1 ? 'Yesterday' : `${i} days ago`;
  }
  return 'Not yet';
}

export function ageText(child) {
  return child && child.ageBand ? `Age ${child.ageBand.replace(' years', '')}` : '';
}

export function starsToday(child, now = new Date()) {
  const reading = child ? child.reading : null;
  return reading && reading.date === dayKey(now) ? reading.starsToday : 0;
}
