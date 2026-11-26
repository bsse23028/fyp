// PARENT HOME (Dashboard) - "how is my child doing, and what should I do next?"
//   header      "Good morning, Sara", today's date, Add child (Open Child Mode lives once, in the sidebar)
//   chooser     a pill per child (with 2+ children); the whole page follows the chosen child
//   week card   "Zara practised on 5 of the last 7 days", last practised + streak, Open Child Mode / View progress, the 7 days
//   numbers     sessions, stars, day streak of the chosen child (last 7 days)
//   next steps  what to do next for the chosen child; "Your children" (a short list); Words to practise (struggle words)
//   explore     a slim "New here?" bar at the bottom until the parent explored once or dismissed it
// All numbers come from the server. (Letters learned lives on Progress, where it says it is saved on this device only.)

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChild } from '../../context/ChildContext';
import { useUI } from '../../context/UIContext';
import { useLanguage } from '../../context/LanguageContext';
import { translate } from '../../i18n/translate';
import { getAvatar } from '../../data/avatars';
import { countStoryDetails } from '../../data/storyOptions';
import { KEYS, getGreeting, loadData, saveData } from '../../utils/misc';
import { ageText, dayKey, lastActiveText, lastDays, streakDays, weekTotals } from '../../utils/progress';
import { Page, useCurrentChild } from '../../layouts/Layouts';
import { Button, EmptyState, Mascot, PageHeader, Spinner } from '../../components/ui';
import { ChildPicker, Row, Stat, WeekDots } from '../../components/rows';
import Icon from '../../components/Icon';
import PinModal from '../../components/PinModal';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const dateText = (d) => `${translate(WEEKDAYS[d.getDay()])}, ${d.getDate()} ${translate(MONTHS[d.getMonth()])} ${d.getFullYear()}`;

export function weekBars(child) {
  const today = dayKey();
  return lastDays(child, 7).map((d) => ({ label: d.label, value: d.sessions, today: d.key === today }));
}

function StruggleCard({ child }) {
  const { struggle, fetchStruggleWords } = useChild();
  useEffect(() => {
    fetchStruggleWords(child.id);
  }, [child.id, fetchStruggleWords]);
  const entry = struggle[child.id];
  const words = entry && entry.words ? [...entry.words].sort((a, b) => b.count - a.count).slice(0, 6) : null;
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{translate('Words to practise')}</h2>
        <Link to="/parent/struggle-words" className="link small">{translate('See all')}</Link>
      </div>
      <div className="panel-body">
        {!words && entry && entry.status === 'failed' ? (
          <p className="small muted">{translate(entry.error)}</p>
        ) : !words ? (
          <Spinner />
        ) : words.length === 0 ? (
          <p className="small muted">{translate('No hard words yet. They appear here after {name} reads along.', { name: child.name })}</p>
        ) : (
          <ul className="word-cloud">
            {words.map((w) => (
              <li key={w.word}>
                {w.word}
                <span>{w.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default function ParentHomePage() {
  const { user, pin } = useAuth();
  const { childProfiles, startPreview, endPreview } = useChild();
  const { alert } = useUI();
  useLanguage();
  const navigate = useNavigate();
  const { currentId, setCurrentId } = useCurrentChild();
  const [pinOpen, setPinOpen] = useState(false);
  // the big "New here?" card shows until the parent explored once or tapped "Not now" (remembered in this browser)
  const [explored, setExplored] = useState(() => loadData(KEYS.explored, false));

  useEffect(() => {
    endPreview(); // the dashboard is never part of the preview
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const chosen = childProfiles.find((c) => c.id === currentId) || childProfiles[0] || null;
  const firstName = user && user.name ? user.name.trim().split(' ')[0] : '';
  const now = new Date();

  let sessions = 0;
  let stars = 0;
  childProfiles.forEach((child) => {
    const week = weekTotals(child);
    sessions += week.sessions;
    stars += week.stars;
  });

  function hideExplore() {
    saveData(KEYS.explored, true);
    setExplored(true);
  }
  function exploreNow() {
    hideExplore();
    startPreview();
    navigate('/child');
  }

  const openChildMode = () => navigate('/who', { state: { childId: chosen ? chosen.id : undefined } });

  const header = (
    <PageHeader
      title={`${translate(getGreeting(now).text.replace('!', ''))}${firstName ? `, ${firstName}` : ''}`}
      subtitle={dateText(now)}
      actions={<Button variant="secondary" icon="plus" to="/parent/children/new">Add child</Button>}
    />
  );

  if (!chosen) {
    return (
      <Page>
        {header}
        <div className="panel">
          <EmptyState mascot="rabbit" title="Add your first child" text="A profile takes about a minute: a nickname, an age band and a buddy." action={<Button icon="plus" to="/parent/children/new">Add a child</Button>} />
        </div>
      </Page>
    );
  }

  const steps = [
    !pin && { icon: 'shield-lock-outline', title: 'Create your Parent PIN', copy: 'Needed to leave Child Mode.', onClick: () => setPinOpen(true) },
    (chosen.modules || []).length === 0 && { icon: 'target', title: translate('Switch on {name}’s activities', { name: chosen.name }), copy: 'New profiles start with every activity off.', to: `/parent/children/${chosen.id}/modules` },
    (chosen.supports || []).length === 0 && { icon: 'puzzle-outline', title: translate('Add {name}’s areas of support', { name: chosen.name }), copy: 'Activities are suggested from them.', to: `/parent/children/${chosen.id}/support` },
    countStoryDetails(chosen) === 0 && { icon: 'book-open-page-variant-outline', title: 'Personalize stories', copy: 'Familiar names and favourite things.', to: `/parent/children/${chosen.id}/stories` },
    weekTotals(chosen).sessions === 0 && { icon: 'play-circle-outline', title: 'Do a first session together', copy: 'Five minutes of Read Along is a good start.', onClick: openChildMode },
  ].filter(Boolean);

  const week = weekTotals(chosen);
  const streak = streakDays(chosen);
  const daysPracticed = lastDays(chosen, 7).filter((d) => d.sessions > 0).length;
  const lastActive = `${translate('Last practised: {when}', { when: translate(lastActiveText(chosen)) })}${streak > 0 ? ` · ${translate('{n} day streak', { n: streak })}` : ''}`;
  const openFor = (child) => navigate('/who', { state: { childId: child.id } });

  return (
    <Page>
      {header}

      <ChildPicker list={childProfiles} value={chosen.id} onChange={setCurrentId} showAge />

      <section className="panel week-hero">
        <div className="wh-main">
          <span className="wh-art" style={{ background: getAvatar(chosen.avatar).color }}>
            <Mascot avatar={chosen.avatar} size={72} alt="" />
          </span>
          <div>
            <h2>
              {daysPracticed > 0
                ? translate('{name} practised on {n} of the last 7 days', { name: chosen.name, n: daysPracticed })
                : translate('{name} has not practised in the last 7 days', { name: chosen.name })}
            </h2>
            <p>{lastActive}</p>
            <div className="wh-actions">
              <Button onClick={() => openFor(chosen)}>Open Child Mode</Button>
              <Button variant="secondary" to={`/parent/progress?child=${chosen.id}`}>View progress</Button>
            </div>
          </div>
        </div>
        <WeekDots days={weekBars(chosen)} full />
      </section>

      <div className="stats three">
        <Stat label="Sessions this week" value={week.sessions} icon="calendar-check-outline" tone="lilac" hint={translate('{name} · last 7 days', { name: chosen.name })} />
        <Stat label="Stars this week" value={week.stars} icon="star-outline" tone="leaf" hint="One for every try" />
        <Stat label="Day streak" value={streak} unit={translate(streak === 1 ? 'day' : 'days')} icon="fire" tone="sun" hint={chosen.name} />
      </div>

      <div className="dash">
        <div className="dash-main">
          {steps.length > 0 && (
            <section className="panel">
              <div className="panel-head">
                <h2>{translate('Next steps for {name}', { name: chosen.name })}</h2>
                <span className="small muted">{translate('{n} left', { n: steps.length })}</span>
              </div>
              <div className="list">
                {steps.map((st) => (
                  <Row key={st.title} icon={st.icon} title={st.title} copy={st.copy} to={st.to} onClick={st.onClick} />
                ))}
              </div>
            </section>
          )}

          <section className="panel">
            <div className="panel-head">
              <h2>{translate('Your children')}</h2>
              <Link to="/parent/children" className="link small">
                {translate('View all')} <Icon name="chevron-right" size={16} className="ico flip-rtl" />
              </Link>
            </div>
            <ul className="kid-rows">
              {childProfiles.map((child) => (
                <li key={child.id} className="kr">
                  <span className="kr-art" style={{ background: getAvatar(child.avatar).color }}>
                    <Mascot avatar={child.avatar} size={36} alt="" />
                  </span>
                  <span className="kr-id">
                    <strong>{child.name}</strong>
                    <span>{translate(ageText(child))} · {translate('Active')} {translate(lastActiveText(child)).toLowerCase()}</span>
                  </span>
                  <Button variant="secondary" size="sm" onClick={() => openFor(child)}>Open Child Mode</Button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="dash-side">
          <StruggleCard child={chosen} />
        </aside>
      </div>

      {!explored && (
        <section className="explore-bar">
          <Mascot size={44} avatar="bear" alt="" />
          <p>
            <strong>{translate('New here?')}</strong> {translate('Try KidBuddy as Buddy, our demo child. Nothing is saved.')}
          </p>
          <Button variant="secondary" size="sm" icon="eye-outline" onClick={exploreNow}>Explore KidBuddy</Button>
          <button type="button" className="link muted-link" onClick={hideExplore}>{translate('Dismiss')}</button>
        </section>
      )}

      {pinOpen && (
        <PinModal
          forceCreate
          onClose={() => setPinOpen(false)}
          onSuccess={() => {
            setPinOpen(false);
            alert({ title: 'PIN saved', message: 'Use this PIN to leave Child Mode.' });
          }}
        />
      )}
    </Page>
  );
}
