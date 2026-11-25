// SETTINGS - the Figma two-pane settings: a section list on the left, the chosen section on the right
// (#account, #children, #language, #safety, #therapist, #calm, #about in the address).
// Up to 900px wide (phone, small tablet) it is a grouped list instead (R2 of the website audit): Family · Safety ·
// About, each row with its current value; a row opens that section as its own screen with "← Settings", and
// Log out is a button under the list. On a wide screen Log out lives in the sidebar's account menu (R4).
// Account shows your real rows (name, email, password) and Children points to My Children (R22).

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChild } from '../../context/ChildContext';
import { useLanguage } from '../../context/LanguageContext';
import { useUI } from '../../context/UIContext';
import { translate } from '../../i18n/translate';
import { KEYS, loadData, saveData } from '../../utils/misc';
import { isSoundEnabled, onSoundChange, setSoundEnabled } from '../../services/audio';
import { Page } from '../../layouts/Layouts';
import { Badge, Button, PageHeader, SegmentedControl, Toggle } from '../../components/ui';
import { Row, Section } from '../../components/rows';
import Icon from '../../components/Icon';
import PinModal from '../../components/PinModal';
import { askBrowserPermissions } from './PermissionsPage';

const TABS = [
  { id: 'account', label: 'Account', icon: 'account-outline', group: 'Family' },
  { id: 'children', label: 'Children', icon: 'account-group-outline', group: 'Family' },
  { id: 'language', label: 'Language', icon: 'translate', group: 'Family' },
  { id: 'safety', label: 'Parent PIN and privacy', icon: 'shield-lock-outline', group: 'Safety' },
  { id: 'calm', label: 'Sound and motion', icon: 'volume-high', group: 'Safety' },
  { id: 'about', label: 'About and credits', icon: 'information-outline', group: 'About' },
];
const GROUPS = ['Family', 'Safety', 'About'];
const NARROW = '(max-width: 900px)';

// true while the screen is narrow (the grouped list instead of two panes)
function useNarrow() {
  const query = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(NARROW) : null;
  const [narrow, setNarrow] = useState(query ? query.matches : false);
  useEffect(() => {
    if (!query) return undefined;
    const change = () => setNarrow(query.matches);
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return narrow;
}

// the features that are not built yet, as ONE quiet line instead of a row each
function OnTheWay() {
  return (
    <p className="on-the-way">
      <Icon name="information-outline" size={18} />
      <span>{translate('Therapist link, time limit and reminders are on the way')}</span>
    </p>
  );
}

const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'ur', label: 'اردو' },
];

export default function ParentSettingsPage() {
  const { user, logOut, pin } = useAuth();
  const { childProfiles } = useChild();
  const { language, setLanguage } = useLanguage();
  const { confirm, alert } = useUI();
  const navigate = useNavigate();
  const { hash, state } = useLocation();
  const narrow = useNarrow();
  const chosen = TABS.some((t) => `#${t.id}` === hash) ? hash.slice(1) : null;
  const tab = chosen || 'account';
  // wide: switching panes replaces the address; narrow: a section is its own screen (Back returns to the list)
  const openTab = (id) => navigate({ hash: id }, { replace: !narrow, state: narrow ? { fromList: true } : undefined });
  // "← Settings": step back when we came from the list, so the browser's Back button stays in step
  const backToList = () => (state && state.fromList ? navigate(-1) : navigate({ hash: '' }, { replace: true }));
  const showList = narrow && !chosen;
  const [pinOpen, setPinOpen] = useState(false);
  const [permissions, setPermissions] = useState(() => loadData(KEYS.permissions, { camera: false, microphone: false }));
  const [sound, setSound] = useState(isSoundEnabled());
  const [motion, setMotion] = useState(() => loadData(KEYS.motion, true));

  useEffect(() => onSoundChange(setSound), []);
  useEffect(() => {
    document.documentElement.classList.toggle('motion-off', !motion);
  }, [motion]);

  async function handlePermissions() {
    const result = await askBrowserPermissions();
    saveData(KEYS.permissions, result);
    setPermissions(result);
    if (!result.camera || !result.microphone) {
      alert({ title: 'Permissions', message: 'Camera or microphone is off. Allow it in your browser’s site settings (the lock icon next to the address).' });
    }
  }

  async function confirmLogOut() {
    if (await confirm({ title: 'Log out?', message: 'You can log back in with your email and password.', confirmLabel: 'Log out', danger: true })) {
      await logOut();
      navigate('/login', { replace: true });
    }
  }

  const permissionText = permissions.camera && permissions.microphone ? 'Camera and microphone are allowed. Tap to ask the browser again.' : 'Camera or microphone is off. Tap to ask the browser again.';
  const initials = user && user.name ? user.name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() : '?';
  // what each row shows as its current value in the narrow list
  const valueOf = {
    account: user ? user.email : '',
    children: translate(childProfiles.length === 1 ? '{n} profile' : '{n} profiles', { n: childProfiles.length }),
    language: language === 'ur' ? 'اردو' : 'English',
    safety: translate(pin ? 'PIN is on' : 'PIN not set'),
    calm: translate(sound ? 'Sound on' : 'Sound off'),
    about: translate('Credits'),
  };

  return (
    <Page>
      {narrow && chosen ? (
        <button type="button" className="settings-back" onClick={backToList}>
          <Icon name="arrow-left" size={18} className="ico flip-rtl" />
          <span>{translate('Settings')}</span>
        </button>
      ) : (
        <PageHeader title="Settings" subtitle="Manage your family’s language, privacy, safety and account preferences." />
      )}

      {showList && (
        <div className="settings-list">
          {GROUPS.map((group) => (
            <section key={group} className="panel settings-group" aria-label={translate(group)}>
              <h2 className="settings-group-title">{translate(group)}</h2>
              {TABS.filter((t) => t.group === group).map((t) => (
                <button key={t.id} type="button" className="settings-row" onClick={() => openTab(t.id)}>
                  <span className="ico-tile"><Icon name={t.icon} size={18} /></span>
                  <span className="sr-text">
                    <span className="sr-title">{translate(t.label)}</span>
                    <span className="sr-value">{valueOf[t.id]}</span>
                  </span>
                  <Icon name="chevron-right" size={18} className="ico flip-rtl" />
                </button>
              ))}
            </section>
          ))}
          <OnTheWay />
          <Button variant="secondary" block icon="logout" className="settings-logout" onClick={confirmLogOut}>Log out</Button>
        </div>
      )}

      <div className="settings-layout" hidden={showList}>
        {!narrow && (
          <nav className="settings-nav panel" aria-label={translate('Settings sections')}>
            {TABS.map((t) => (
              <button key={t.id} type="button" className={tab === t.id ? 'on' : ''} aria-current={tab === t.id ? 'page' : undefined} onClick={() => openTab(t.id)}>
                <span className="ico-tile"><Icon name={t.icon} size={18} /></span>
                <span>{translate(t.label)}</span>
                <Icon name="chevron-right" size={18} className="ico flip-rtl" />
              </button>
            ))}
          </nav>
        )}
        <div className="settings-panes">

      <Section id="account" hidden={tab !== 'account'} title="Account" text="Your name, email, password and PIN.">
        <div className="panel list">
          <div className="list-row">
            <span className="sb-initials">{initials}</span>
            <span className="lr-main">
              <span className="lr-title">{translate('Name')}</span>
              <span className="lr-sub">{user ? user.name : ''}</span>
            </span>
            <Button variant="secondary" size="sm" to="/parent/account">Edit</Button>
          </div>
          <div className="list-row">
            <span className="ico-tile"><Icon name="email-outline" size={20} /></span>
            <span className="lr-main">
              <span className="lr-title">{translate('Email')}</span>
              <span className="lr-sub">{user ? user.email : ''}</span>
            </span>
          </div>
          <div className="list-row">
            <span className="ico-tile"><Icon name="key-outline" size={20} /></span>
            <span className="lr-main">
              <span className="lr-title">{translate('Password')}</span>
              <span className="lr-sub" aria-label={translate('Hidden')}>••••••••</span>
            </span>
            <Button variant="secondary" size="sm" to="/parent/account/password">Change</Button>
          </div>
          <div className="list-row">
            <span className="ico-tile"><Icon name="shield-lock-outline" size={20} /></span>
            <span className="lr-main">
              <span className="lr-title">{translate('Parent PIN')}</span>
              <span className="lr-sub">{translate(pin ? 'PIN is on' : 'PIN not set')}</span>
            </span>
            <Button variant="secondary" size="sm" onClick={() => (pin ? navigate('/parent/pin') : setPinOpen(true))}>{pin ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Section>

      <Section id="children" hidden={tab !== 'children'} title="Children" text="Profiles, buddies, activities and stories are managed in My Children.">
        <div className="panel list">
          <Row icon="account-group-outline" title="Open My Children" copy={valueOf.children} to="/parent/children" />
          <Row icon="plus" title="Add a child" to="/parent/children/new" />
        </div>
      </Section>

      <Section id="language" hidden={tab !== 'language'} title="Language" text="Each child also has their own language, set in their profile.">
        <SegmentedControl options={LANGUAGES} value={language} onChange={setLanguage} label="Language" />
      </Section>

      <Section id="safety" hidden={tab !== 'safety'} title="Safety and privacy" text="What keeps Child Mode and Parent Mode apart.">
        <div className="panel list">
          <Row
            icon="shield-lock-outline"
            title={pin ? 'Update PIN' : 'Create PIN'}
            copy={pin ? 'Required when leaving Child Mode. Needs your old PIN.' : 'Not set yet. Tap to create one.'}
            end={!pin && <Badge tone="sun">{translate('Not set')}</Badge>}
            onClick={() => (pin ? navigate('/parent/pin') : setPinOpen(true))}
          />
          <Row icon="microphone-outline" title="Permissions" copy={permissionText} onClick={handlePermissions} end={<Badge tone={permissions.camera && permissions.microphone ? 'leaf' : 'neutral'}>{translate(permissions.camera && permissions.microphone ? 'Allowed' : 'Off')}</Badge>} />
        </div>
        <OnTheWay />
      </Section>

      <Section id="calm" hidden={tab !== 'calm'} title="Sound and motion" text="Applies to this browser.">
        <div className="panel list">
          <div className="list-row">
            <span className="ico-tile"><Icon name="volume-high" size={20} /></span>
            <span className="lr-main">
              <span className="lr-title">{translate('Sound and voice')}</span>
              <span className="lr-sub">{translate('Buddy’s voice, effects and the ABC song')}</span>
            </span>
            <Toggle on={sound} onClick={() => setSoundEnabled(!sound)} label="Sound and voice" />
          </div>
          <div className="list-row">
            <span className="ico-tile"><Icon name="motion-outline" size={20} /></span>
            <span className="lr-main">
              <span className="lr-title">{translate('Animations')}</span>
              <span className="lr-sub">{translate('Turn off for a calmer, still screen')}</span>
            </span>
            <Toggle on={motion} onClick={() => { setMotion(!motion); saveData(KEYS.motion, !motion); }} label="Animations" />
          </div>
        </div>
      </Section>

      <Section id="about" hidden={tab !== 'about'} title="About and credits" text="KidBuddy supports home practice. It is not a replacement for your therapist.">
        <div className="credits">
          <p className="tiny muted">{translate('Credits')}</p>
          <p className="tiny muted">{translate('Phonics sounds: Phonicademy (phonicademy.com)')}</p>
          <p className="tiny muted">{translate('Talk board pictures: ARASAAC (arasaac.org), by Sergio Palao, licence CC BY-NC-SA, owner Government of Aragón')}</p>
        </div>
      </Section>

        </div>
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
