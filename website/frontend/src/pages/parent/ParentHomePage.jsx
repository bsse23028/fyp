// PARENT HOME (Dashboard) - the Figma ParentShell dashboard:
//   header      "Good morning, Sara", today's date, Open Child Mode + Add child
//   stats       sessions + stars this week (all children), the best day streak, letters learned (current child)
//   explore     the big "New here?" card (Explore KidBuddy / Not now) until the parent explored once or hid it
//   children    a card per child: buddy, age, last active, streak, activities, this week's bars, links, ⋯ menu;
//               clicking a child makes it the current child (the same one as the top-bar switcher)
//   side        Open Child Mode for the current child, next steps, struggle words, Explore KidBuddy (preview)
// All numbers come from the server (and the alphabet stars saved in this browser).

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
import { activityOn } from '../../utils/modules';
import { ageText, dayKey, lastActiveText, lastDays, streakDays, weekTotals } from '../../utils/progress';
import { Page, useCurrentChild } from '../../layouts/Layouts';
import { Avatar, Badge, Button, EmptyState, Mascot, PageHeader, Spinner } from '../../components/ui';
import { MiniBars, MoreMenu, Row, Stat } from '../../components/rows';
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
        <div>
          <span className="eyebrow">{translate('Practise gently')}</span>
          <h2>{translate('Struggle words')}</h2>
        </div>
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
  const { childProfiles, deleteChild, startPreview, endPreview, alphabetProgress } = useChild();
  const { confirm, alert } = useUI();
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

  async function confirmDelete(child) {
    const yes = await confirm({
      title: translate('Delete {name}?', { name: child.name }),
      message: 'This deletes the profile and all of its progress from your account. It cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (yes) deleteChild(child.id);
  }

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
      actions={
        <>
          {chosen && <Button variant="secondary" icon="lock-open-variant-outline" onClick={openChildMode}>Open Child Mode</Button>}
          <Button icon="plus" to="/parent/children/new">Add child</Button>
        </>
      }
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

  const letters = alphabetProgress(chosen.id).done;
  const phonicsOn = activityOn(chosen, 3); // the alphabet counts only when Phonics is switched on for this child

  const steps = [
    !pin && { icon: 'shield-lock-outline', title: 'Create your Parent PIN', copy: 'Needed to leave Child Mode.', onClick: () => setPinOpen(true) },
    (chosen.modules || []).length === 0 && { icon: 'target', title: translate('Switch on {name}’s activities', { name: chosen.name }), copy: 'New profiles start with every activity off.', to: `/parent/children/${chosen.id}/modules` },
    (chosen.supports || []).length === 0 && { icon: 'puzzle-outline', title: translate('Add {name}’s areas of support', { name: chosen.name }), copy: 'Activities are suggested from them.', to: `/parent/children/${chosen.id}/support` },
    countStoryDetails(chosen) === 0 && { icon: 'book-open-page-variant-outline', title: 'Personalize stories', copy: 'Familiar names and favourite things.', to: `/parent/children/${chosen.id}/stories` },
    weekTotals(chosen).sessions === 0 && { icon: 'play-circle-outline', title: 'Do a first session together', copy: 'Five minutes of Read Along is a good start.', onClick: openChildMode },
  ].filter(Boolean);

  const bestStreak = Math.max(0, ...childProfiles.map((c) => streakDays(c)));
  const activeDays = (child) => lastDays(child, 7).filter((d) => d.sessions > 0).length;

  return (
    <Page>
      {header}

      {!explored && (
        <section className="explore-welcome">
          <Mascot size={96} avatar="puppy" alt="" />
          <div className="ew-text">
            <span className="ew-tag">{translate('New here?')}</span>
            <h2>{translate('See what your child will see')}</h2>
            <p>{translate('Play as Buddy, our demo child, for a few minutes. Every activity is open and nothing is saved.')}</p>
          </div>
          <div className="ew-actions">
            <Button icon="eye-outline" onClick={exploreNow}>Explore KidBuddy</Button>
            <button type="button" className="link" onClick={hideExplore}>{translate('Not now')}</button>
          </div>
        </section>
      )}

      <div className="stats">
        <Stat label="Sessions this week" value={sessions} icon="calendar-check-outline" tone="lilac" hint={childProfiles.length > 1 ? 'All children' : 'Finished practice sessions'} />
        <Stat label="Day streak" value={translate('{n} days', { n: bestStreak })} icon="fire" tone="leaf" hint="Best across your children" />
        <Stat label="Stars earned this week" value={stars} icon="star-outline" tone="sun" hint="Earned for every try" />
        {phonicsOn ? (
          <Stat label="Letters learned" value={`${letters}/26`} icon="alphabetical" tone="sky" hint={chosen.name} />
        ) : (
          <Stat label="Activities on" value={(chosen.modules || []).length} icon="puzzle-outline" tone="sky" hint={chosen.name} />
        )}
      </div>

      <div className="dash">
        <div className="dash-main">
          <div className="section-heading">
            <div>
              <span className="eyebrow">{translate('Family overview')}</span>
              <h2>{translate('Your children')}</h2>
            </div>
            <Link to="/parent/children" className="link small">
              {translate('View all')} <Icon name="chevron-right" size={16} className="ico flip-rtl" />
            </Link>
          </div>
          <div className="kid-tiles">
            {childProfiles.map((child) => {
              const on = child.id === chosen.id;
              const mods = child.modules || [];
              const streak = streakDays(child);
              return (
                <article key={child.id} className={`panel kid-tile${on ? ' selected' : ''}`}>
                  <div className="kid-tile-top">
                    <button type="button" className="kid-tile-pick" onClick={() => setCurrentId(child.id)} aria-pressed={on} aria-label={translate('Show {name} on the dashboard', { name: child.name })}>
                      <span className="kid-tile-art" style={{ background: getAvatar(child.avatar).color }}>
                        <Mascot avatar={child.avatar} size={40} alt="" />
                      </span>
                      <span className="kid-tile-id">
                        <span className="kid-tile-name">{child.name}</span>
                        <span className="kid-tile-meta">
                          {translate(ageText(child))} · {translate('Active')} {translate(lastActiveText(child)).toLowerCase()}
                        </span>
                      </span>
                    </button>
                    {streak > 0 && (
                      <span className="streak-badge">
                        <Icon name="creation" size={13} />
                        {translate('{n} day streak', { n: streak })}
                      </span>
                    )}
                    <MoreMenu
                      label="More options"
                      items={[
                        { label: 'View progress', icon: 'chart-line', onClick: () => navigate(`/parent/progress?child=${child.id}`) },
                        { label: 'Edit profile', icon: 'pencil-outline', onClick: () => navigate(`/parent/children/${child.id}`) },
                        { label: 'Delete', icon: 'trash-can-outline', danger: true, onClick: () => confirmDelete(child) },
                      ]}
                    />
                  </div>
                  <div className="kid-tile-mods">
                    {mods.slice(0, 4).map((m) => <span key={m} className="module-chip">{translate(m)}</span>)}
                    {mods.length > 4 && <span className="module-chip more">+{mods.length - 4}</span>}
                    {mods.length === 0 && <span className="small muted">{translate('No activities switched on yet')}</span>}
                  </div>
                  <div className="kid-tile-week">
                    <div>
                      <strong>{translate('This week')}</strong>
                      <small>{translate('{n} active days', { n: activeDays(child) })}</small>
                    </div>
                    <MiniBars days={weekBars(child)} />
                  </div>
                  <div className="kid-tile-links">
                    <Link to={`/parent/progress?child=${child.id}`} className="link">
                      {translate('View progress')} <Icon name="chevron-right" size={15} className="ico flip-rtl" />
                    </Link>
                    <Link to={`/parent/children/${child.id}`} className="link muted-link">{translate('Edit profile')}</Link>
                  </div>
                </article>
              );
            })}
          </div>
          <Link to="/parent/children/new" className="add-child">
            <Icon name="plus" size={20} />
            <span>
              <strong>{translate('Add another child')}</strong>
              <small>{translate('Create a personalised practice space')}</small>
            </span>
          </Link>
        </div>

        <aside className="dash-side">
          <section className="panel focus-mini">
            <div className="fm-top">
              <Avatar avatar={chosen.avatar} size={44} />
              <div>
                <span className="eyebrow">{translate('Ready to learn')}</span>
                <h3>{chosen.name}</h3>
              </div>
            </div>
            <Button block icon="lock-open-variant-outline" onClick={openChildMode}>Open Child Mode</Button>
          </section>

          {steps.length > 0 && (
            <section className="panel">
              <div className="panel-head">
                <div>
                  <span className="eyebrow">{translate('For {name}', { name: chosen.name })}</span>
                  <h2>{translate('Next steps')}</h2>
                </div>
                <span className="small muted">{translate('{n} left', { n: steps.length })}</span>
              </div>
              <div className="list">
                {steps.map((s) => (
                  <Row key={s.title} icon={s.icon} title={s.title} copy={s.copy} to={s.to} onClick={s.onClick} />
                ))}
              </div>
            </section>
          )}

          <StruggleCard child={chosen} />

          <button
            type="button"
            className="explore"
            onClick={exploreNow}
          >
            <span>
              <span className="explore-title">{translate('Explore KidBuddy')}</span>
              <span className="explore-copy">{translate('Try every activity as Buddy, our demo child. Nothing is saved.')}</span>
              <span className="explore-cta">
                {translate('Start exploring')} <Icon name="arrow-right" size={16} className="ico flip-rtl" />
              </span>
            </span>
            <Mascot size={86} avatar="bear" alt="" />
          </button>
        </aside>
      </div>

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
