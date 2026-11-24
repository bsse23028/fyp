// PROGRESS - one child at a time (?child=<id>): totals, the Read Along chart (7 days / 4 weeks),
// the alphabet (stars per letter, saved in this browser), the other activities, and the export button.
// "Encouraging patterns, never labels."

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import { useUI } from '../../context/UIContext';
import { useLanguage } from '../../context/LanguageContext';
import { translate } from '../../i18n/translate';
import { BUILT } from '../../utils/modules';
import { allTimeTotals, dayKey, lastActiveText, lastDays, streakDays } from '../../utils/progress';
import { Page, useCurrentChild } from '../../layouts/Layouts';
import { Badge, Button, EmptyState, PageHeader, SegmentedControl } from '../../components/ui';
import { ChildPicker, Stat, WeekChart } from '../../components/rows';

const RANGES = [
  { id: '7D', label: '7 days' },
  { id: '4W', label: '4 weeks' },
];
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function buildBars(child, range) {
  const today = dayKey();
  if (range === '7D') return lastDays(child, 7).map((d) => ({ label: d.label, value: d.sessions, today: d.key === today }));
  const days = lastDays(child, 28);
  return [0, 1, 2, 3].map((week) => ({ label: `W${week + 1}`, value: days.slice(week * 7, week * 7 + 7).reduce((sum, d) => sum + d.sessions, 0), today: week === 3 }));
}

export default function ParentProgressPage() {
  const { childProfiles, letterStars } = useChild();
  const { alert } = useUI();
  useLanguage();
  const [params, setParams] = useSearchParams();
  const [range, setRange] = useState('7D');
  const { currentId, setCurrentId } = useCurrentChild();
  const child = childProfiles.find((c) => c.id === params.get('child')) || childProfiles.find((c) => c.id === currentId) || childProfiles[0] || null;

  if (!child) {
    return (
      <Page>
        <PageHeader title="Progress" subtitle="Encouraging patterns, never labels." />
        <div className="panel"><EmptyState mascot="rabbit" title="No progress yet" text="Add a child profile on Home to see progress here." action={<Button to="/parent/children/new" icon="plus">Add a child</Button>} /></div>
      </Page>
    );
  }

  const totals = allTimeTotals(child);
  const stars = letterStars(child.id);
  const learned = LETTERS.filter((l) => stars[l] > 0).length;
  const otherModules = (child.modules || []).filter((name) => name !== 'Read-Along');

  return (
    <Page>
      <PageHeader
        title="Progress"
        subtitle="Encouraging patterns, never labels."
        actions={<Button variant="secondary" icon="export-variant" onClick={() => alert({ title: 'Export report', message: 'This part is still being built. Check back soon!' })}>Share report with therapist</Button>}
      />
      <ChildPicker list={childProfiles} value={child.id} onChange={(id) => {
          setCurrentId(id);
          setParams({ child: id });
        }} />

      <div className="stats">
        <Stat label="Sessions" value={totals.sessions} icon="calendar-check-outline" tone="sky" hint="All time" />
        <Stat label="Stars" value={totals.stars} icon="star-outline" tone="sun" hint="All time" />
        <Stat label="Day streak" value={streakDays(child)} icon="fire" tone="berry" />
        <Stat label="Letters learned" value={`${learned}/26`} icon="alphabetical" tone="leaf" />
      </div>

      <div className="dash">
        <div className="dash-main">
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>{translate('Read Along')}</h2>
                <p className="small muted">{translate('Last practised: {when}', { when: translate(lastActiveText(child)) })}</p>
              </div>
              <SegmentedControl options={RANGES} value={range} onChange={setRange} label="Range" />
            </div>
            <div className="panel-body">
              <WeekChart bars={buildBars(child, range)} caption={range === '7D' ? 'Reading sessions per day' : 'Reading sessions per week'} height={200} />
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>{translate('Alphabet')}</h2>
                <p className="small muted">{translate('Best stars per letter, from this browser.')}</p>
              </div>
              <Badge tone="leaf">{translate('{n} of 26', { n: learned })}</Badge>
            </div>
            <div className="panel-body">
              <ul className="abc-grid">
                {LETTERS.map((l) => {
                  const s = stars[l] || 0;
                  return (
                    <li key={l} className={`s${s}`} aria-label={translate('{l}: {n} of {total} stars', { l, n: s, total: 3 })}>
                      <span className="abc-l">{l}</span>
                      <span className="abc-s" aria-hidden="true">{'★'.repeat(s)}{'☆'.repeat(3 - s)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        </div>

        <aside className="dash-side">
          <section className="panel">
            <div className="panel-head"><div><h2>{translate('Other activities')}</h2><p className="small muted">{translate('Switched on for {name}', { name: child.name })}</p></div></div>
            <div className="list">
              {otherModules.length === 0 && <p className="panel-pad small muted">{translate('No other activities switched on.')}</p>}
              {otherModules.map((name) => (
                <div key={name} className="list-row">
                  <span className="lr-main"><span className="lr-title">{translate(name)}</span></span>
                  <span className="lr-end">
                    {BUILT.includes(name) ? <Badge tone="leaf">{translate('In Child Mode')}</Badge> : <Badge tone="neutral">{translate('Coming soon')}</Badge>}
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section className="panel panel-pad note">
            <h3>{translate('How to read this')}</h3>
            <p className="small muted">{translate('A session is one finished Read Along story. Stars are earned for trying, not for being right. Quiet weeks are normal.')}</p>
          </section>
        </aside>
      </div>
    </Page>
  );
}
