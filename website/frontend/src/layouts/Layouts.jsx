// LAYOUTS - the frames around the pages.
//   EntryLayout   Welcome + the intro (full-screen split pages with an illustration)
//   AuthLayout    log in / sign up: brand panel + form with a Log in | Create account switch; codes and passwords: the same panel without the switch
//   SetupLayout   first steps after sign-up (permissions, first child) and "Who is learning?"
//   ParentLayout  Parent Mode (Figma ParentShell): sidebar with Open Child Mode, Dashboard, My Children, Plan
//                 (+ Struggle words), Progress, Settings, the language switch and you (a menu: My account, Log out);
//                 a 72px top bar with the breadcrumb and the child switcher; a slide-in drawer under 1024px
//   ChildLayout   Child Mode (Figma ChildShell): Back · Home pills, the buddy's logo in the middle, sound,
//                 language and the 🔒 Parent Exit (PIN); a warm cream page
//   Screen        a page area; ChildTitle + AuthHeading are the shared page headings

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useChild } from '../context/ChildContext';
import { useUI } from '../context/UIContext';
import { getCurrentLanguage, translate } from '../i18n/translate';
import { ageText } from '../utils/progress';
import { previewGuideFor } from '../utils/previewGuides';
import { crumbsFor } from '../utils/crumbs';
import { Avatar, BackButton, BrandLogo, Button, IconButton, Mascot, SpeakButton } from '../components/ui';
import Icon from '../components/Icon';
import PinModal from '../components/PinModal';
import KidScene from '../components/KidScene';
import { isSoundEnabled, onSoundChange, playMusic, setMusicVolume, setSoundEnabled, stopMusic, stopSpeaking } from '../services/audio';

// Pages can show another buddy in the logo (while an avatar is being chosen).
const HeaderContext = createContext({ setLogoAvatar: () => {} });
export const useHeader = () => useContext(HeaderContext);
export function useLogoAvatar(avatar) {
  const { setLogoAvatar } = useHeader();
  useEffect(() => {
    setLogoAvatar(avatar || null);
  }, [avatar, setLogoAvatar]);
}

export function LanguageToggle({ compact = false, block = false }) {
  const { language, setLanguage } = useLanguage();
  return (
    <div className={`lang-switch${compact ? ' compact' : ''}${block ? ' block' : ''}`} role="group" aria-label="Language / زبان">
      <Icon name="translate" size={16} className="ico lang-ico" />
      <button type="button" className={language === 'en' ? 'on' : ''} aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>
        English
      </button>
      <button type="button" className={`ur${language === 'ur' ? ' on' : ''}`} aria-pressed={language === 'ur'} onClick={() => setLanguage('ur')} lang="ur">
        اردو
      </button>
    </div>
  );
}

function SkipLink() {
  return (
    <a href="#main" className="skip-link">
      {translate('Skip to content')}
    </a>
  );
}

/* ---------------- entry (welcome + intro) ---------------- */

// Welcome and the intro are full-screen split pages; they draw their own frame.
export function EntryLayout() {
  useLanguage();
  return (
    <div className="entry">
      <SkipLink />
      <Outlet />
    </div>
  );
}

/* ---------------- auth ---------------- */

// /login and /signup (Option A of the website's Login and Create account redesign): a brand panel on the left
// and the form on the right, with a Log in | Create account switch at the top of the form. The panel and the switch
// stay where they are while the form changes, so moving between the two pages is like flipping a switch.
// Below 1100px the panel folds into a band across the top (logo + the bunny and kitty).
// Code, forgot and reset pages use the same panel and column (no switch).
const SPLIT = {
  '/login': 'Welcome back to your family’s learning space',
  '/signup': 'A little practice goes a long way',
  // the code and password pages use the same panel, without the Log in | Create account switch
  '/verify-email': 'One quick step to go',
  '/forgot-password': 'Let’s get you back in',
  '/reset-code': 'Let’s get you back in',
  '/reset-password': 'Almost there',
};
const WITH_SWITCH = ['/login', '/signup'];
const PROMISES = ['Ad-free', 'Parent-controlled', 'Follows your therapist’s plan'];
// the little "this week" card of the panel: an illustration of the Dashboard's week dots (Mon..Sun), not anyone's data
const WEEK_DAYS = [
  { day: 'Mon', on: true },
  { day: 'Tue', on: true },
  { day: 'Wed', on: false },
  { day: 'Thu', on: true },
  { day: 'Fri', on: true },
  { day: 'Sat', on: false },
  { day: 'Sun', on: false, today: true },
];

function AuthWeekCard() {
  const urdu = getCurrentLanguage() === 'ur';
  return (
    <div className="ap-card" aria-hidden="true">
      <small>{translate('Illustration')}</small>
      <b>{translate('Zara’s week · 4 days practised')}</b>
      <div className="ap-dots">
        {WEEK_DAYS.map((d) => (
          <div key={d.day} className={`${d.on ? 'on' : ''}${d.today ? ' today' : ''}`}>
            <i />
            {urdu ? translate(d.day) : d.day.slice(0, 1)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Log in | Create account: the same place on both pages
function AuthSwitch() {
  return (
    <nav className="auth-tabs" aria-label={translate('Log in or create an account')}>
      <NavLink to="/login">{translate('Log in')}</NavLink>
      <NavLink to="/signup">{translate('Create account')}</NavLink>
    </nav>
  );
}

export function AuthLayout() {
  const { pathname } = useLocation();
  useLanguage();
  const panelTitle = SPLIT[pathname];
  if (!panelTitle) return <Outlet />;
  return (
    <div className="auth-split">
      <SkipLink />
      <aside className="auth-panel">
        <i className="ap-c1" aria-hidden="true" />
        <i className="ap-c2" aria-hidden="true" />
        <Link to="/" className="ap-logo" aria-label="KidBuddy">
          <img src="/media/auth/logo.png" alt="KidBuddy" draggable={false} />
        </Link>
        <div className="ap-copy">
          <h2>{translate(panelTitle)}</h2>
          <p>{translate('Everything your child needs to practise, with the guidance and controls you need as a parent.')}</p>
          <ul className="ap-list">
            {PROMISES.map((text) => (
              <li key={text}>
                <Icon name="check" size={19} />
                {translate(text)}
              </li>
            ))}
          </ul>
        </div>
        <div className="ap-bottom">
          <AuthWeekCard />
          <div className="ap-art" aria-hidden="true">
            <img src="/media/auth/panel-art.png" alt="" draggable={false} />
            <span className="ap-bubble">{translate('Hi, grown-up!')}</span>
          </div>
        </div>
      </aside>
      <main id="main" className="auth-split-main">
        <div className="auth-corner"><LanguageToggle compact /></div>
        <div className="auth-card">
          {WITH_SWITCH.includes(pathname) && <AuthSwitch />}
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// The top of an auth card: an icon tile (code / reset pages) or the logo (log in / sign up), title, one line.
export function AuthHeading({ title, subtitle, params, icon }) {
  return (
    <div className="auth-heading">
      {icon ? (
        <span className="auth-ico"><Icon name={icon} size={22} /></span>
      ) : (
        <span className="auth-logo"><BrandLogo height={46} avatar="rabbit" /></span>
      )}
      <h1>{translate(title)}</h1>
      {subtitle && <p>{translate(subtitle, params)}</p>}
    </div>
  );
}

/* ---------------- setup (after sign-up) ---------------- */

export function SetupLayout() {
  const { logOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [logoAvatar, setLogoAvatar] = useState(null);
  useLanguage();
  const steps = [
    { path: '/permissions', label: 'Permissions' },
    { path: '/children/new', label: 'First child' },
  ];
  const current = steps.findIndex((s) => s.path === pathname);
  return (
    <HeaderContext.Provider value={{ setLogoAvatar }}>
      <div className="setup">
        <SkipLink />
        <header className="setup-top">
          <BrandLogo height={38} avatar={logoAvatar || 'rabbit'} />
          {current >= 0 && (
            <ol className="stepper" aria-label={translate('Setup steps')}>
              <li className="done"><Icon name="check" size={14} />{translate('Account')}</li>
              {steps.map((s, i) => (
                <li key={s.path} className={i < current ? 'done' : i === current ? 'current' : ''} aria-current={i === current ? 'step' : undefined}>
                  {i < current ? <Icon name="check" size={14} /> : <span className="step-num">{i + 2}</span>}
                  {translate(s.label)}
                </li>
              ))}
            </ol>
          )}
          <div className="setup-actions">
            <LanguageToggle compact />
            {pathname !== '/who' && (
            <Button
              variant="ghost"
              size="sm"
              icon="logout"
              onClick={async () => {
                await logOut();
                navigate('/login', { replace: true });
              }}
            >
              Log out
            </Button>
            )}
          </div>
        </header>
        <main id="main" className="setup-main">
          <Outlet />
        </main>
      </div>
    </HeaderContext.Provider>
  );
}

/* ---------------- Parent Mode ---------------- */

const NAV = [
  { to: '/parent', label: 'Dashboard', icon: 'view-dashboard-outline', end: true },
  { to: '/parent/children', label: 'My Children', icon: 'account-group-outline' },
  { to: '/parent/plan', label: 'Plan', icon: 'clipboard-text-outline', sub: [{ to: '/parent/struggle-words', label: 'Struggle words' }] },
  { to: '/parent/progress', label: 'Progress', icon: 'chart-line' },
  { to: '/parent/settings', label: 'Settings', icon: 'cog-outline' },
];

// The child the parent is looking at (dashboard, progress, struggle words), remembered for this tab.
const CURRENT_KEY = 'kb_parent_child';
const ParentChildContext = createContext({ currentId: null, setCurrentId: () => {} });
export const useCurrentChild = () => useContext(ParentChildContext);

function initialsOf(name) {
  return name ? name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() : '?';
}

// You, at the bottom of the sidebar: one button that opens a small menu (My account · Log out).
// It is the only place for your account and Log out in the shell (R4 of the website audit).
function AccountMenu({ user, onNavigate, onLogOut }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);
  return (
    <div className="sb-account" ref={box}>
      {open && (
        <div className="sb-menu" role="menu" aria-label={translate('Account menu')}>
          <Link
            role="menuitem"
            to="/parent/account"
            className="sb-menu-item"
            onClick={() => {
              setOpen(false);
              if (onNavigate) onNavigate();
            }}
          >
            <Icon name="account-outline" size={18} />
            <span>{translate('My account')}</span>
          </Link>
          <button
            role="menuitem"
            type="button"
            className="sb-menu-item danger"
            onClick={() => {
              setOpen(false);
              onLogOut();
            }}
          >
            <Icon name="logout" size={18} />
            <span>{translate('Log out')}</span>
          </button>
        </div>
      )}
      <button type="button" className="sb-user" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="sb-initials">{initialsOf(user && user.name)}</span>
        <span className="sb-user-text">
          <span className="sb-user-name">{user ? user.name : ''}</span>
          <span className="sb-user-mail">{user ? user.email : translate('Parent')}</span>
        </span>
        <Icon name={open ? 'chevron-down' : 'chevron-up'} size={18} className="ico sb-user-caret" />
      </button>
    </div>
  );
}

function Sidebar({ onNavigate }) {
  const { user, logOut } = useAuth();
  const { childProfiles } = useChild();
  const { confirm } = useUI();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const go = () => onNavigate && onNavigate();
  return (
    <div className="sidebar-inner">
      <Link to="/parent" className="sb-logo" onClick={go} aria-label="KidBuddy">
        <BrandLogo height={56} avatar="rabbit" />
      </Link>
      <Button
        block
        onClick={() => {
          go();
          navigate('/who');
        }}
        disabled={childProfiles.length === 0}
      >
        Open Child Mode
      </Button>
      <nav className="sb-nav" aria-label={translate('Parent Mode')}>
        {NAV.map((item) => {
          const open = item.sub && (pathname.startsWith(item.to) || item.sub.some((x) => pathname.startsWith(x.to)));
          return (
            <div key={item.to}>
              <NavLink to={item.to} end={item.end} className="sb-link" onClick={go}>
                <Icon name={item.icon} size={20} />
                <span>{translate(item.label)}</span>
                {item.to === '/parent/children' && childProfiles.length > 0 && <span className="sb-count">{childProfiles.length}</span>}
                {item.sub && <Icon name="chevron-down" size={18} className={`ico sb-caret${open ? ' open' : ''}`} />}
              </NavLink>
              {item.sub && open && (
                <div className="sb-sub">
                  {item.sub.map((x) => (
                    <NavLink key={x.to} to={x.to} className="sb-sublink" onClick={go}>
                      {translate(x.label)}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="sb-footer">
        <LanguageToggle block />
        <AccountMenu
          user={user}
          onNavigate={go}
          onLogOut={async () => {
            if (await confirm({ title: 'Log out?', message: 'You can log back in with your email and password.', confirmLabel: 'Log out', danger: true })) {
              go();
              await logOut();
              navigate('/login', { replace: true });
            }
          }}
        />
      </div>
    </div>
  );
}

// The child shown in the top bar. It appears ONLY on pages about one child (a child's profile pages, Progress, Struggle words),
// and it always shows the child of THAT page (the profile in the address, Progress's ?child=), never a stale one. Choosing another
// child opens the same page for that child. Family pages (Dashboard, My Children, Plan, Settings, Account) have no switcher.
const PROFILE_SECTIONS = ['basics', 'support', 'modules', 'stories'];
function ChildSwitcher() {
  const { childProfiles } = useChild();
  const { currentId, setCurrentId } = useCurrentChild();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const profile = pathname.match(/^\/parent\/children\/([^/]+)(?:\/([^/]+))?\/?$/);
  const onProfile = Boolean(profile) && profile[1] !== 'new';
  const onProgress = pathname === '/parent/progress';
  const onChildPage = onProfile || onProgress || pathname === '/parent/struggle-words';
  const pageId = onProfile ? profile[1] : onProgress ? new URLSearchParams(search).get('child') : null;
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);
  const current = childProfiles.find((c) => c.id === pageId) || childProfiles.find((c) => c.id === currentId) || childProfiles[0];
  if (!onChildPage || !current) return null;
  function pick(id) {
    setCurrentId(id);
    setOpen(false);
    if (onProfile) navigate(`/parent/children/${id}${profile[2] && PROFILE_SECTIONS.includes(profile[2]) ? `/${profile[2]}` : ''}`);
    else if (onProgress) navigate(`/parent/progress?child=${id}`, { replace: true });
  }
  return (
    <div className="child-switch" ref={ref}>
      <button type="button" className="cs-button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Avatar avatar={current.avatar} size={32} />
        <span className="cs-text">
          <span className="cs-name">{current.name}</span>
          <span className="cs-age">{translate(ageText(current))}</span>
        </span>
        <Icon name="chevron-down" size={18} />
      </button>
      {open && (
        <div className="menu cs-menu" role="listbox" aria-label={translate('Choose a child')}>
          {childProfiles.map((c) => (
            <button
              key={c.id}
              type="button"
              role="option"
              aria-selected={c.id === current.id}
              onClick={() => pick(c.id)}
            >
              <Avatar avatar={c.avatar} size={26} />
              {c.name}
              {c.id === current.id && <Icon name="check" size={16} className="ico cs-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ParentLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const { childProfiles } = useChild();
  const [drawer, setDrawer] = useState(false);
  const [logoAvatar, setLogoAvatar] = useState(null);
  const [currentId, setCurrentIdState] = useState(() => {
    try {
      return sessionStorage.getItem(CURRENT_KEY);
    } catch (e) {
      return null;
    }
  });
  useLanguage();
  const validId = childProfiles.some((c) => c.id === currentId) ? currentId : childProfiles[0] ? childProfiles[0].id : null;
  const setCurrentId = useCallback((id) => {
    setCurrentIdState(id);
    try {
      sessionStorage.setItem(CURRENT_KEY, id);
    } catch (e) {
      // private mode: remembered for this page only
    }
  }, []);
  useEffect(() => {
    setDrawer(false);
    setLogoAvatar(null);
  }, [location.pathname]);
  useEffect(() => {
    if (!drawer) return undefined;
    const onKey = (e) => e.key === 'Escape' && setDrawer(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawer]);

  return (
    <HeaderContext.Provider value={{ setLogoAvatar }}>
      <ParentChildContext.Provider value={{ currentId: validId, setCurrentId }}>
        <div className="app">
          <SkipLink />
          <aside className="sidebar">
            <Sidebar />
          </aside>
          {drawer && (
            <div className="drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setDrawer(false)}>
              <aside className="drawer" aria-label={translate('Parent menu')}>
                <Sidebar onNavigate={() => setDrawer(false)} />
              </aside>
            </div>
          )}
          <div className="app-main">
            <header className="topbar">
              <IconButton icon="menu" label="Open menu" className="topbar-menu" onClick={() => setDrawer(true)} />
              <Link to="/parent" className="topbar-logo" aria-label="KidBuddy">
                <BrandLogo height={36} avatar={logoAvatar || 'rabbit'} />
              </Link>
              <nav className="crumbs" aria-label={translate('Breadcrumb')}>
                {crumbsFor(location.pathname, childProfiles).map((c, i, all) => (
                  <span key={i} className="crumb">
                    {c.to ? <Link to={c.to}>{c.raw ? c.label : translate(c.label)}</Link> : <span aria-current="page">{c.raw ? c.label : translate(c.label)}</span>}
                    {i < all.length - 1 && <Icon name="chevron-right" size={16} className="ico flip-rtl" />}
                  </span>
                ))}
              </nav>
              <div className="topbar-spacer" />
              <ChildSwitcher />
            </header>
            <main id="main" className="app-content">
              <Outlet />
            </main>
          </div>
        </div>
      </ParentChildContext.Provider>
    </HeaderContext.Provider>
  );
}

// The content column of a Parent Mode page.
export function Page({ children, narrow = false, className = '' }) {
  return <div className={`page${narrow ? ' narrow' : ''} ${className}`}>{children}</div>;
}

/* ---------------- Child Mode ---------------- */

// The sound switch of Child Mode (R7 of the website audit): a bell with its state written on it ("Sound on").
// Turning sound OFF needs a 0.6 s press-and-hold, so a quick tap can never mute the whole app by accident;
// turning it back ON is one tap. Keyboard: Enter / Space switches straight away.
const HOLD_TO_MUTE_MS = 600;
function SoundSwitch() {
  const [on, setOn] = useState(isSoundEnabled());
  const [holding, setHolding] = useState(false);
  const [hint, setHint] = useState(false);
  const timer = useRef(null);
  const hintTimer = useRef(null);
  const justMuted = useRef(false); // the click that ends a successful hold must not switch sound back on
  useEffect(() => onSoundChange(setOn), []);
  useEffect(() => () => {
    clearTimeout(timer.current);
    clearTimeout(hintTimer.current);
  }, []);
  const label = translate(on ? 'Sound on' : 'Sound off');
  function start(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (!on) return; // off -> on happens on click
    setHolding(true);
    timer.current = setTimeout(() => {
      setHolding(false);
      justMuted.current = true;
      setSoundEnabled(false);
    }, HOLD_TO_MUTE_MS);
  }
  function cancel() {
    if (!holding) return;
    clearTimeout(timer.current);
    setHolding(false);
    setHint(true); // a short tap while on: say how it works, nothing changes
    clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHint(false), 2200);
  }
  return (
    <span className="sound-switch">
      <button
        type="button"
        className={`kid-btn sound-btn${on ? ' on' : ''}${holding ? ' holding' : ''}`}
        aria-pressed={on}
        aria-label={`${label}. ${translate(on ? 'Hold to turn off' : 'Tap to turn on')}`}
        title={translate(on ? 'Hold to turn off' : 'Tap to turn on')}
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onClick={(e) => {
          if (justMuted.current) {
            justMuted.current = false;
            return;
          }
          if (e.detail === 0) setSoundEnabled(!on); // keyboard
          else if (!on) setSoundEnabled(true);
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Icon name={on ? 'bell-outline' : 'bell-off-outline'} size={22} />
        <span className="sound-label">{label}</span>
      </button>
      {hint && <span className="sound-hint" role="status">{translate('Hold to turn off')}</span>}
    </span>
  );
}

export function ChildLayout() {
  const { activeChild, displayAvatar, isPreview, exitChildMode } = useChild();
  const { user, pin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pinOpen, setPinOpen] = useState(false);
  const [logoAvatar, setLogoAvatar] = useState(null);
  useLanguage();

  const inEnglish = location.pathname.startsWith('/child/english');
  const quiet = /\/(alphabet\/|spell\/|read\/|trace\/)/.test(location.pathname);
  useEffect(() => {
    if (inEnglish && !location.pathname.includes('/stories/')) {
      playMusic(quiet ? 0.05 : 0.12);
      setMusicVolume(quiet ? 0.05 : 0.12);
    } else stopMusic();
  }, [inEnglish, quiet, location.pathname]);
  useEffect(() => () => { stopMusic(); stopSpeaking(); }, []);
  useEffect(() => {
    stopSpeaking();
    setLogoAvatar(null);
  }, [location.pathname]);

  // Leaving: a parent goes back to Parent Mode; someone who explored BEFORE signing up goes back to the intro (last step).
  function leave() {
    setPinOpen(false);
    if (!user) {
      // The intro page ends the preview itself (ending it here would make the route guard send us to Log in first).
      navigate('/onboarding', { replace: true, state: { startAtLast: true } });
      return;
    }
    exitChildMode();
    navigate('/parent', { replace: true });
  }
  function askParent() {
    if (isPreview && !pin) leave();
    else setPinOpen(true);
  }
  const isHome = location.pathname === '/child';
  const guide = isPreview ? previewGuideFor(location.pathname) : null; // one sentence for the parent (Preview only)

  return (
    <HeaderContext.Provider value={{ setLogoAvatar }}>
      <div className="kid-app">
        <header className="kid-top">
          <button type="button" className="kid-nav" onClick={() => navigate(-1)} disabled={isHome}>
            <Icon name="arrow-left" size={26} className="ico flip-rtl" />
            <span>{translate('Back')}</span>
          </button>
          <button type="button" className="kid-nav" onClick={() => navigate('/child')}>
            <Icon name="home-outline" size={26} />
            <span>{translate('Home')}</span>
          </button>
          <button type="button" className="kid-brand" onClick={() => navigate('/child/buddy')} aria-label={translate('Change my buddy')}>
            <BrandLogo height={52} avatar={logoAvatar || displayAvatar} />
          </button>
          <div className="kid-top-actions">
            <SoundSwitch />
            <LanguageToggle compact />
            <button type="button" className="kid-parent" onClick={askParent} aria-label={translate('Parent Exit')} title={translate('Parent Exit')}>
              <Icon name="lock-outline" size={26} />
            </button>
          </div>
        </header>
        {isPreview && (
          <div className="preview-banner" role="status">
            <div className="pb-row">
              <Icon name="eye-outline" size={18} />
              <span>{translate('Preview mode - nothing is saved')}</span>
              <button type="button" onClick={askParent}>{translate('Exit preview')}</button>
            </div>
            {guide && (
              <p className="pb-guide">
                <Icon name="information-outline" size={16} />
                {translate(guide)}
              </p>
            )}
          </div>
        )}
        <Outlet />
        {pinOpen && <PinModal onClose={() => setPinOpen(false)} onSuccess={leave} />}
      </div>
    </HeaderContext.Provider>
  );
}

// A page area. kind = 'child' for Child Mode pages; scene = the sky behind the English pages.
export function Screen({ children, kind = 'page', scene, className = '', innerStyle }) {
  return (
    <main className={`screen ${kind}${scene ? ' with-scene' : ''} ${className}`} id="main">
      {scene && <KidScene scene={scene} />}
      <div className="screen-inner" style={innerStyle}>
        {children}
      </div>
    </main>
  );
}

// The title row of a child page: big back button · title · 🔊.
export function ChildTitle({ title, back = -1, speakText, eyebrow, children }) {
  const navigate = useNavigate();
  return (
    <div className="child-title-row">
      {back !== null && <BackButton onClick={() => (typeof back === 'string' ? navigate(back) : navigate(back))} />}
      <h1>
        {eyebrow && <small className="title-eyebrow">{translate(eyebrow)}</small>}
        {translate(title)}
      </h1>
      {children}
      {speakText && <SpeakButton text={speakText} />}
    </div>
  );
}
