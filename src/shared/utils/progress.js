// PROGRESS - small helpers that turn a child's saved reading history into
// numbers for the Parent screens.
//
// A child keeps `activity`, one entry per day:  { '2026-10-12': { sessions: 1, stars: 3 } }

// "2026-10-12" for any Date (the phone's own time zone).
export function dayKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// The last `count` days, oldest first: [{ key, label: 'Mon', sessions, stars }]
export function lastDays(child, count = 7) {
  const activity = (child && child.activity) || {};
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    const entry = activity[key] || { sessions: 0, stars: 0 };
    days.push({ key, label: names[d.getDay()], sessions: entry.sessions, stars: entry.stars });
  }
  return days;
}

// Total sessions + stars in the last 7 days.
export function weekTotals(child) {
  return lastDays(child, 7).reduce(
    (sum, day) => ({ sessions: sum.sessions + day.sessions, stars: sum.stars + day.stars }),
    { sessions: 0, stars: 0 }
  );
}

// How many days in a row (ending today or yesterday) the child practised.
export function streakDays(child) {
  const activity = (child && child.activity) || {};
  let streak = 0;
  const d = new Date();
  // Not practised yet today? The streak can still be alive from yesterday.
  if (!activity[dayKey(d)]) d.setDate(d.getDate() - 1);
  while (activity[dayKey(d)]) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// Everything ever saved.
export function allTimeTotals(child) {
  const activity = (child && child.activity) || {};
  return Object.keys(activity).reduce(
    (sum, key) => ({ sessions: sum.sessions + activity[key].sessions, stars: sum.stars + activity[key].stars }),
    { sessions: 0, stars: 0 }
  );
}

// "Today", "Yesterday", "3 days ago" or "Not yet".
export function lastActiveText(child) {
  const activity = (child && child.activity) || {};
  for (let i = 0; i < 60; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (activity[dayKey(d)]) return i === 0 ? 'Today' : i === 1 ? 'Yesterday' : `${i} days ago`;
  }
  return 'Not yet';
}

// "Age 4–6" from "4–6 years".
export function ageText(child) {
  return child && child.ageBand ? `Age ${child.ageBand.replace(' years', '')}` : '';
}
