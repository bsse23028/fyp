// ENTRY SHELL - the one frame of everything before the account exists: Welcome, the 4 intro steps and the
// "page not found" page. It is the Login page's layout (a brand panel on one side, one calm column on the other),
// so the whole first visit looks like one product. Below 1100px the panel folds into a band across the top.
//   theme 0 Welcome / not found (lavender)   1 intro 1 (lavender)   2 intro 2 (peach)   3 intro 3 (mint)   4 intro 4 (sky)
// Also here: BootScreen, the branded loader and connection-error card shown while the saved login is checked.

import { Link } from 'react-router-dom';
import { translate } from '../i18n/translate';
import { LanguageToggle } from '../layouts/Layouts';
import { Button } from './ui';
import Icon from './Icon';

export default function EntryShell({ theme = 0, scene, bunny = false, promises, corner, children, foot }) {
  return (
    <div className={`auth-split es es-t${theme}`}>
      <aside className="auth-panel es-panel">
        <i className="es-sh a" aria-hidden="true" />
        <i className="es-sh b" aria-hidden="true" />
        <i className="es-sh c" aria-hidden="true" />
        <Link to="/" className="ap-logo" aria-label="KidBuddy">
          <img src="/media/auth/logo.png" alt="KidBuddy" draggable={false} />
        </Link>
        {scene && <div className="es-scene" aria-hidden="true">{scene}</div>}
        {promises && (
          <ul className="ap-list es-promises">
            {promises.map((text) => (
              <li key={text}>
                <Icon name="check" size={19} />
                {translate(text)}
              </li>
            ))}
          </ul>
        )}
        {bunny && <img className={`es-bunny b${theme}`} src="/media/auth/bunny.png" alt="" aria-hidden="true" draggable={false} />}
      </aside>
      <main id="main" className="auth-split-main es-main">
        <div className="auth-corner es-corner">
          {corner}
          <LanguageToggle compact />
        </div>
        <div className="es-col">{children}</div>
        {foot && <p className="es-foot">{foot}</p>}
      </main>
    </div>
  );
}

// The bunny and kitty of the Welcome panel (the Login panel's picture)
export function PanelArt() {
  return <img className="es-art" src="/media/auth/panel-art.png" alt="" draggable={false} />;
}

// Intro step 1: Zara's plan (an illustration, not anyone's data)
export function PlanScene() {
  const rows = [
    { label: 'Letter sounds', note: 'Done', done: true },
    { label: 'Matching pairs', note: 'Done', done: true },
    { label: 'Trace A to C', note: 'Today', done: false },
  ];
  return (
    <div className="es-card">
      <small>{translate('Zara’s plan this week')}</small>
      <b>{translate('From her therapist')}</b>
      {rows.map((r) => (
        <div key={r.label} className="es-row">
          <i className={r.done ? 'done' : ''}>{r.done && <Icon name="check" size={13} />}</i>
          {translate(r.label)}
          <em>{translate(r.note)}</em>
        </div>
      ))}
    </div>
  );
}

// Intro step 2: the areas circling the bunny
export function OrbitScene() {
  return (
    <div className="es-orbit">
      <img className="bn" src="/media/auth/bunny.png" alt="" draggable={false} />
      <span className="chip c1"><Icon name="book-open-variant" size="1.5em" /></span>
      <span className="chip c2"><Icon name="chat-outline" size="1.5em" /></span>
      <span className="chip c3"><Icon name="heart-outline" size="1.5em" /></span>
      <span className="chip c4">123</span>
    </div>
  );
}

// Intro step 3: a shield, the safe space
export function ShieldScene() {
  return (
    <div className="es-ring">
      <Icon name="shield-check-outline" size="9em" />
    </div>
  );
}

// Intro step 4: a tablet, try it first
export function TabletScene() {
  return (
    <>
      <span className="es-spark one">✦</span>
      <span className="es-spark two">✦</span>
      <div className="es-tablet">
        <div>
          {translate('Hi, I’m Buddy!')}
          <small>{translate('Tap anywhere to start')}</small>
        </div>
      </div>
    </>
  );
}

// Branded loader (no message) or, when the server cannot be reached, a branded error card with Try again.
// The same markup is in index.html, so the logo is on screen from the very first paint.
export function BootScreen({ error, onRetry }) {
  return (
    <div className="kb-boot" role={error ? 'alert' : 'status'} aria-label={error ? undefined : translate('Loading')}>
      <i className="kb-boot-c1" aria-hidden="true" />
      <i className="kb-boot-c2" aria-hidden="true" />
      {error ? (
        <div className="kb-boot-card">
          <img className="kb-boot-logo small" src="/media/auth/logo.png" alt="KidBuddy" draggable={false} />
          <h1>{translate('We can’t reach KidBuddy')}</h1>
          <p>{translate('Check your internet connection, then try again. Your child’s progress is safe.')}</p>
          {typeof error === 'string' && !/reach|connect/i.test(error) && <small>{translate(error)}</small>}
          {onRetry && (
            <Button size="lg" icon="refresh" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      ) : (
        <>
          <img className="kb-boot-logo" src="/media/auth/logo.png" alt="KidBuddy" draggable={false} />
          <div className="kb-boot-bar" aria-hidden="true"><i /></div>
          <p className="kb-boot-text">{translate('Getting KidBuddy ready…')}</p>
        </>
      )}
    </div>
  );
}
