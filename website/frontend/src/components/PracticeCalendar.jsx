// PRACTICE CALENDAR - one month as a calendar; every day the child practised is CIRCLED (the same as the app's Progress tab).
//   <PracticeCalendar activity={child.activity} />
// activity = the child's saved days: { '2026-10-12': { sessions: 1, stars: 3 }, ... }; a day counts as "practised" when it has
// at least one session. Practised day = a filled circle · today = a ring · future days faded · ‹ › = the month before / after
// (never past this month). Weeks start on Sunday. Nothing here is saved.

import { useState } from 'react';
import { translate } from '../i18n/translate';
import { dayKey } from '../utils/progress';
import Icon from './Icon';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// The cells of one month: empty cells before the 1st, then every day.
function monthCells(year, month) {
  const first = new Date(year, month, 1).getDay();
  const count = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let day = 1; day <= count; day++) cells.push(new Date(year, month, day));
  return cells;
}

export default function PracticeCalendar({ activity = {} }) {
  const today = new Date();
  const [offset, setOffset] = useState(0); // 0 = this month, -1 = last month ...
  const shown = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const cells = monthCells(shown.getFullYear(), shown.getMonth());
  const todayKey = dayKey(today);
  const practised = (date) => {
    const entry = activity[dayKey(date)];
    return Boolean(entry && entry.sessions > 0);
  };
  const count = cells.filter((date) => date && practised(date)).length;

  return (
    <div className="pcal" dir="ltr">
      <div className="pcal-head">
        <button type="button" className="icon-btn outlined" onClick={() => setOffset(offset - 1)} aria-label={translate('Previous month')}>
          <Icon name="chevron-left" size={20} />
        </button>
        <strong>{translate(MONTHS[shown.getMonth()])} {shown.getFullYear()}</strong>
        <button type="button" className="icon-btn outlined" onClick={() => setOffset(offset + 1)} disabled={offset >= 0} aria-label={translate('Next month')}>
          <Icon name="chevron-right" size={20} />
        </button>
      </div>
      <div className="pcal-grid" role="grid">
        {WEEKDAYS.map((d) => <span key={d} className="pcal-wd">{translate(d)}</span>)}
        {cells.map((date, i) => {
          if (!date) return <span key={`e${i}`} />;
          const key = dayKey(date);
          const on = practised(date);
          const future = date > today && key !== todayKey;
          return (
            <span key={key} role="gridcell" className={`pcal-day${on ? ' on' : ''}${key === todayKey ? ' today' : ''}${future ? ' future' : ''}`} aria-label={on ? translate('Practised on {d}', { d: date.getDate() }) : undefined}>
              {date.getDate()}
            </span>
          );
        })}
      </div>
      <p className="small muted pcal-note">{count === 1 ? translate('Practised on 1 day this month') : translate('Practised on {n} days this month', { n: count })}</p>
    </div>
  );
}
