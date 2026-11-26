// PROGRESS - one child at a time (?child=<id>), the same rules as the app's Progress tab. ONLY what the child is enrolled in
// (switched on in Profile -> Activities) is shown:
//   chooser      one child chooser (the top bar follows it)
//   numbers      sessions · stars · day streak (all time)
//   Read Along   a month calendar, practised days are circled, only when Read-Along (module 1) is on
//   side         "Activities {name} can use" (the built ones: In Child Mode) · Letters (only when Phonics is on; the stars are saved in THIS
//                browser, so it says "This device only" and shows the 26 letters only when something is saved) · one "On the way" line
//                (unfinished activities, badges, a therapist report) · how to read this
//   nothing on   "No activities yet" + "Choose activities" (-> the Activities tab of the profile)

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import { useLanguage } from '../../context/LanguageContext';
import { translate } from '../../i18n/translate';
import { ACTIVITY_BY_NO, BUILT_ACTIVITIES, activityOn } from '../../utils/modules';
import { allTimeTotals, lastActiveText, streakDays } from '../../utils/progress';
import { Page, useCurrentChild } from '../../layouts/Layouts';
import { Badge, Button, EmptyState, PageHeader } from '../../components/ui';
import { ChildPicker, Stat } from '../../components/rows';
import Icon from '../../components/Icon';
import PracticeCalendar from '../../components/PracticeCalendar';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function ParentProgressPage() {
  const { childProfiles, letterStars } = useChild();
  useLanguage();
  const [params, setParams] = useSearchParams();
  const { currentId, setCurrentId } = useCurrentChild();
  const child = childProfiles.find((c) => c.id === params.get('child')) || childProfiles.find((c) => c.id === currentId) || childProfiles[0] || null;

  // arriving with ?child= (a link from the Dashboard): that child is now the current one everywhere
  useEffect(() => {
    if (child && child.id !== currentId) setCurrentId(child.id);
  }, [child && child.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const builtModules = otherModules.filter((name) => BUILT_ACTIVITIES.includes(name));
  // what is still being built: activities switched on that do not work yet, then badges and the therapist report
  const onTheWay = [...otherModules.filter((name) => !BUILT_ACTIVITIES.includes(name)).map((name) => translate(name)), translate('badges'), translate('a report for your therapist')];

  return (
    <Page>
      <PageHeader
        title="Progress"
        subtitle={translate('How {name}’s practice is going.', { name: child.name })}
      />
      <ChildPicker
        showAge
        list={childProfiles}
        value={child.id}
        onChange={(id) => {
          setCurrentId(id);
          setParams({ child: id });
        }}
      />

      <div className="stats three">
        <Stat label="Sessions" value={totals.sessions} icon="calendar-check-outline" tone="lilac" hint="All time" />
        <Stat label="Stars" value={totals.stars} icon="star-outline" tone="leaf" hint="All time" />
        <Stat label="Day streak" value={streakDays(child)} unit={translate(streakDays(child) === 1 ? 'day' : 'days')} icon="fire" tone="sun" hint={translate('Last practised: {when}', { when: translate(lastActiveText(child)) })} />
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

        </div>

        <aside className="dash-side">
          <section className="panel">
            <div className="panel-head"><div><h2>{translate('Activities {name} can use', { name: child.name })}</h2><p className="small muted">{translate('Switched on in {name}’s profile', { name: child.name })}</p></div></div>
            <div className="list">
              {builtModules.length === 0 && <p className="panel-pad small muted">{translate('No other activities switched on.')}</p>}
              {builtModules.map((name) => (
                <div key={name} className="list-row">
                  <span className="lr-main"><span className="lr-title">{translate(name)}</span></span>
                  <span className="lr-end"><Badge tone="leaf">{translate('In Child Mode')}</Badge></span>
                </div>
              ))}
            </div>
          </section>
          {phonicsOn && (
            <section className="panel panel-pad letters-card">
              <div className="lc-head">
                <h3>{translate('Letters')}</h3>
                <Badge tone="neutral">{translate('This device only')}</Badge>
              </div>
              <p className="small muted">
                {translate('Letter stars are saved in this browser, not in your account.')}{' '}
                {learned > 0 ? translate('{n} of 26 learned', { n: learned }) : translate('Nothing recorded on this device yet.')}
              </p>
              {learned > 0 && (
                <ul className="abc-grid">
                  {LETTERS.map((l) => {
                    const st = stars[l] || 0;
                    return (
                      <li key={l} className={`s${st}`} aria-label={translate('{l}: {n} of {total} stars', { l, n: st, total: 3 })}>
                        <span className="abc-l">{l}</span>
                        <span className="abc-s" aria-hidden="true">{'★'.repeat(st)}{'☆'.repeat(3 - st)}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}
          <p className="on-the-way">
            <Icon name="information-outline" size={18} />
            <span>{translate('On the way: {list}', { list: onTheWay.join(', ') })}</span>
          </p>
          <section className="panel panel-pad note">
            <h3>{translate('How to read this')}</h3>
            <p className="small muted">{translate('A session is one finished Read Along story. Stars are earned for trying, not for being right. Quiet weeks are normal.')}</p>
          </section>
        </aside>
      </div>
    </Page>
  );
}
