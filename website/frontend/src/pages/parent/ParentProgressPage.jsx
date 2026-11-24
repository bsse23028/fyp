// PROGRESS - one child at a time (?child=<id>), the same rules as the app's Progress tab. ONLY what the child is enrolled in
// (switched on in Profile -> Activities) is shown:
//   stats        sessions · stars · day streak, and letters learned (out of 26, only when Phonics is on, else the activities on)
//   Badges and stickers   (Coming soon, proposal FR-16)
//   nothing on   "No activities yet" + "Choose activities" (-> the Activities tab of the profile)
//   Alphabet     best stars per letter (saved in this browser), only when Phonics (module 3) is on
//   Read Along   a month calendar, practised days are circled, only when Read-Along (module 1) is on
//   Other activities   every other switched-on activity ("In Child Mode" or "Coming soon")
//   Share report with therapist (Coming soon)

import { useSearchParams } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import { useUI } from '../../context/UIContext';
import { useLanguage } from '../../context/LanguageContext';
import { translate } from '../../i18n/translate';
import { ACTIVITY_BY_NO, BUILT_ACTIVITIES, activityOn } from '../../utils/modules';
import { allTimeTotals, lastActiveText, streakDays } from '../../utils/progress';
import { Page, useCurrentChild } from '../../layouts/Layouts';
import { Badge, Button, EmptyState, PageHeader } from '../../components/ui';
import { ChildPicker, Row, Stat } from '../../components/rows';
import PracticeCalendar from '../../components/PracticeCalendar';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function ParentProgressPage() {
  const { childProfiles, letterStars } = useChild();
  const { alert } = useUI();
  useLanguage();
  const [params, setParams] = useSearchParams();
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
  const modules = child.modules || [];
  const nothingOn = modules.length === 0;
  const phonicsOn = activityOn(child, 3);
  const readAlongOn = activityOn(child, 1);
  const otherModules = modules.filter((name) => name !== ACTIVITY_BY_NO[1]);

  return (
    <Page>
      <PageHeader
        title="Progress"
        subtitle="Encouraging patterns, never labels."
        actions={<Button variant="secondary" icon="export-variant" onClick={() => alert({ title: 'Export report', message: 'This part is still being built. Check back soon!' })}>Share report with therapist</Button>}
      />
      <ChildPicker
        list={childProfiles}
        value={child.id}
        onChange={(id) => {
          setCurrentId(id);
          setParams({ child: id });
        }}
      />

      <div className="stats">
        <Stat label="Sessions" value={totals.sessions} icon="calendar-check-outline" tone="sky" hint="All time" />
        <Stat label="Stars" value={totals.stars} icon="star-outline" tone="sun" hint="All time" />
        <Stat label="Day streak" value={streakDays(child)} icon="fire" tone="berry" hint={translate('Last practised: {when}', { when: translate(lastActiveText(child)) })} />
        {phonicsOn ? <Stat label="Letters learned" value={`${learned}/26`} icon="alphabetical" tone="leaf" /> : <Stat label="Activities on" value={modules.length} icon="puzzle-outline" tone="leaf" hint={`${modules.length} of 11`} />}
      </div>

      <div className="dash">
        <div className="dash-main">
          {nothingOn && (
            <section className="panel">
              <EmptyState
                icon="puzzle-outline"
                title="No activities yet"
                text="Switch activities on in the profile to see their progress here."
                action={<Button variant="secondary" to={`/parent/children/${child.id}/modules`}>Choose activities</Button>}
              />
            </section>
          )}

          {readAlongOn && (
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>{translate('Read Along')}</h2>
                  <p className="small muted">{translate('Practised days are circled.')}</p>
                </div>
              </div>
              <div className="panel-body"><PracticeCalendar activity={child.activity || {}} /></div>
            </section>
          )}

          {phonicsOn && (
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
          )}
        </div>

        <aside className="dash-side">
          <section className="panel">
            <Row icon="medal" tone="sun" title="Badges and stickers" copy="Rewards your child collects across all activities" end={<Badge tone="neutral">{translate('Soon')}</Badge>} />
          </section>
          <section className="panel">
            <div className="panel-head"><div><h2>{translate('Other activities')}</h2><p className="small muted">{translate('Switched on for {name}', { name: child.name })}</p></div></div>
            <div className="list">
              {otherModules.length === 0 && <p className="panel-pad small muted">{translate('No other activities switched on.')}</p>}
              {otherModules.map((name) => (
                <div key={name} className="list-row">
                  <span className="lr-main"><span className="lr-title">{translate(name)}</span></span>
                  <span className="lr-end">
                    {BUILT_ACTIVITIES.includes(name) ? <Badge tone="leaf">{translate('In Child Mode')}</Badge> : <Badge tone="neutral">{translate('Coming soon')}</Badge>}
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
