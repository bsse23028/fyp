// LAYOUTS - the frames around the pages.
//   EntryLayout   Welcome + the intro (full-screen split pages with an illustration)
//   AuthLayout    log in / sign up: value panel + form card; codes and passwords: one centred card
//   SetupLayout   first steps after sign-up (permissions, first child) and "Who is learning?"
//   ParentLayout  Parent Mode (Figma ParentShell): sidebar with Open Child Mode, Dashboard, My Children, Plan
//                 (+ Struggle words), Progress, Settings, the language switch, you and Log Out; a 72px top bar
//                 with the breadcrumb, the child switcher and your initials; a slide-in drawer under 1024px
//   ChildLayout   Child Mode (Figma ChildShell): Back · Home pills, the buddy's logo in the middle, sound,
//                 language and the 🔒 Parent Exit (PIN); a warm cream page
//   Screen        a page area; ChildTitle + AuthHeading are the shared page headings

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useChild } from '../context/ChildContext';
import { useUI } from '../context/UIContext';
import { translate } from '../i18n/translate';
import { ageText } from '../utils/progress';
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

// /login and /signup: the value panel on the left, the form card on the right.
// Code, forgot and reset pages: one centred card on a soft background.
const SPLIT = {
  '/login': 'Welcome back to your family’s learning space',
  '/signup': 'A little practice goes a long way',
};
const VALUES = [
  { icon: 'check', title: 'Therapist-aligned', text: 'Keep home practice focused on the right goals.' },
  { icon: 'shield-check-outline', title: 'Private by design', text: 'No advertising, feeds or open-ended chat.' },
  { icon: 'creation', title: 'Made for your child', text: 'Personalised activities that celebrate progress.' },
];

export function AuthLayout() {
  const { pathname } = useLocation();
  useLanguage();
  const panelTitle = SPLIT[pathname];
  if (!panelTitle) {
    return (
      <div className="auth-centered">
        <SkipLink />
        <div className="auth-corner"><LanguageToggle compact /></div>
        <main id="main" className="auth-centered-main">
          <div className="auth-card compact">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }
  return (
    <div className="auth-split">
      <SkipLink />
      <aside className="value-panel">
        <Link to="/" className="vp-logo" aria-label="KidBuddy">
          <BrandLogo height={52} avatar="rabbit" />
        </Link>
        <div className="vp-copy">
          <span className="kicker">{translate('Welcome to KidBuddy')}</span>
          <h2>{translate(panelTitle)}</h2>
          <p>{translate('Everything your child needs to practise, with the guidance and controls you need as a parent.')}</p>
        </div>
        <ul className="vp-list">
          {VALUES.map((v) => (
            <li key={v.title}>
              <span><Icon name={v.icon} size={16} /></span>
              <div>
                <strong>{translate(v.title)}</strong>
                <small>{translate(v.text)}</small>
              </div>
            </li>
          ))}
        </ul>
        <div className="vp-mascot" aria-hidden="true"><Mascot avatar="rabbit" size={150} alt="" /></div>
      </aside>
      <main id="main" className="auth-split-main">
        <div className="auth-corner"><LanguageToggle compact /></div>
        <div className="auth-card">
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

// The breadcrumb label of each Parent Mode page.
function crumbFor(pathname) {
  if (pathname === '/parent') return 'Dashboard';
  if (pathname.startsWith('/parent/struggle-words')) return 'Struggle words';
  if (pathname.startsWith('/parent/plan')) return 'Plan';
  if (pathname.startsWith('/parent/progress')) return 'Progress';
  if (pathname === '/parent/children/new') return 'Add a child';
  if (pathname.startsWith('/parent/children')) return 'My Children';
  if (pathname.startsWith('/parent/account/password')) return 'Change password';
  if (pathname.startsWith('/parent/account')) return 'My account';
  if (pathname.startsWith('/parent/pin')) return 'Update PIN';
  return 'Settings';
}

// The child the parent is looking at (dashboard, progress, struggle words), remembered for this tab.
const CURRENT_KEY = 'kb_parent_child';
const ParentChildContext = createContext({ currentId: null, setCurrentId: () => {} });
export const useCurrentChild = () => useContext(ParentChildContext);

function initialsOf(name) {
  return name ? name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() : '?';
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
        icon="lock-open-variant-outline"
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
        <NavLink to="/parent/account" className="sb-user" onClick={go}>
          <span className="sb-initials">{initialsOf(user && user.name)}</span>
          <span className="sb-user-text">
            <span className="sb-user-name">{user ? user.name : ''}</span>
            <span className="sb-user-mail">{translate('Parent')}</span>
          </span>
        </NavLink>
        <button
          type="button"
          className="sb-link sb-logout"
          onClick={async () => {
            if (await confirm({ title: 'Log out?', message: 'You can log back in with your email and password.', confirmLabel: 'Log out', danger: true })) {
              go();
              await logOut();
              navigate('/login', { replace: true });
            }
          }}
        >
          <Icon name="logout" size={20} />
          <span>{translate('Log Out')}</span>
        </button>
      </div>
    </div>
  );
}

function ChildSwitcher() {
  const { childProfiles } = useChild();
  const { currentId, setCurrentId } = useCurrentChild();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
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
  const current = childProfiles.find((c) => c.id === currentId) || childProfiles[0];
  if (!current) return null;
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
              onClick={() => {
                setCurrentId(c.id);
                setOpen(false);
              }}
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
                <Link to="/parent">{translate('Home')}</Link>
                <Icon name="chevron-right" size={16} className="ico flip-rtl" />
                <span aria-current="page">{translate(crumbFor(location.pathname))}</span>
              </nav>
              <div className="topbar-spacer" />
              <ChildSwitcher />
              <Link to="/parent/account" className="topbar-me" aria-label={translate('My account')} title={user ? user.name : ''}>
                {initialsOf(user && user.name)}
              </Link>
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

function SoundSwitch() {
  const [on, setOn] = useState(isSoundEnabled());
  useEffect(() => onSoundChange(setOn), []);
  return (
    <button type="button" className="kid-btn" aria-pressed={on} aria-label={translate(on ? 'Sound on' : 'Sound off')} title={translate(on ? 'Sound on' : 'Sound off')} onClick={() => setSoundEnabled(!on)}>
      <Icon name={on ? 'volume-high' : 'volume-off'} size={24} />
    </button>
  );
}

export function ChildLayout() {
  const { activeChild, displayAvatar, isPreview, exitChildMode } = useChild();
  const { pin } = useAuth();
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

  function leave() {
    setPinOpen(false);
    exitChildMode();
    navigate('/parent', { replace: true });
  }
  function askParent() {
    if (isPreview && !pin) leave();
    else setPinOpen(true);
  }
  const isHome = location.pathname === '/child';

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
            <Icon name="eye-outline" size={18} />
            <span>{translate('Preview mode - nothing is saved')}</span>
            <button type="button" onClick={askParent}>{translate('Exit preview')}</button>
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
export function ChildTitle({ title, back = -1, speakText, children }) {
  const navigate = useNavigate();
  return (
    <div className="child-title-row">
      {back !== null && <BackButton onClick={() => (typeof back === 'string' ? navigate(back) : navigate(back))} />}
      <h1>{translate(title)}</h1>
      {children}
      {speakText && <SpeakButton text={speakText} />}
    </div>
  );
}
