// SETTINGS - the Figma two-pane settings: a section list on the left, the chosen section on the right
// (#account, #children, #language, #safety, #calm, #session in the address). Sections: Account, Children, Language, Safety and privacy (PIN, permissions,
// notifications, share), Sound and motion (this browser), Session (Log Out, credits).

import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChild } from '../../context/ChildContext';
import { useLanguage } from '../../context/LanguageContext';
import { useUI } from '../../context/UIContext';
import { translate } from '../../i18n/translate';
import { ageText } from '../../utils/progress';
import { KEYS, loadData, saveData } from '../../utils/misc';
import { isSoundEnabled, onSoundChange, setSoundEnabled } from '../../services/audio';
import { Page } from '../../layouts/Layouts';
import { Avatar, Badge, Button, PageHeader, SegmentedControl, Toggle } from '../../components/ui';
import { Row, Section } from '../../components/rows';
import Icon from '../../components/Icon';
import PinModal from '../../components/PinModal';
import { askBrowserPermissions } from './PermissionsPage';

const TABS = [
  { id: 'account', label: 'Account', icon: 'account-outline' },
  { id: 'children', label: 'Children', icon: 'account-group-outline' },
  { id: 'language', label: 'Language', icon: 'translate' },
  { id: 'safety', label: 'Parent PIN and privacy', icon: 'shield-lock-outline' },
  { id: 'therapist', label: 'Therapist', icon: 'handshake-outline' },
  { id: 'calm', label: 'Sound and motion', icon: 'volume-high' },
  { id: 'session', label: 'Log Out', icon: 'logout' },
];

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
  const { hash } = useLocation();
  const tab = TABS.some((t) => `#${t.id}` === hash) ? hash.slice(1) : 'account';
  const openTab = (id) => navigate({ hash: id }, { replace: true });
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
  const comingSoon = (title) => alert({ title, message: 'This part is still being built. Check back soon!' });

  return (
    <Page>
      <PageHeader title="Settings" subtitle="Manage your family’s language, privacy, safety and account preferences." />
      <div className="settings-layout">
        <nav className="settings-nav panel" aria-label={translate('Settings sections')}>
          {TABS.map((t) => (
            <button key={t.id} type="button" className={tab === t.id ? 'on' : ''} aria-current={tab === t.id ? 'page' : undefined} onClick={() => openTab(t.id)}>
              <span className="ico-tile"><Icon name={t.icon} size={18} /></span>
              <span>{translate(t.label)}</span>
              <Icon name="chevron-right" size={18} className="ico flip-rtl" />
            </button>
          ))}
        </nav>
        <div className="settings-panes">

      <Section id="account" hidden={tab !== 'account'} title="Account" text="Your name, email, password and PIN.">
        <div className="panel">
          <Link to="/parent/account" className="list-row action">
            <span className="sb-initials">{initials}</span>
            <span className="lr-main">
              <span className="lr-title">{user ? user.name : translate('Parent')}</span>
              <span className="lr-sub">{user ? user.email : ''}</span>
            </span>
            <span className="lr-end"><span className="small link">{translate('Edit my account')}</span><Icon name="chevron-right" size={20} className="ico flip-rtl" /></span>
          </Link>
        </div>
      </Section>

      <Section id="children" hidden={tab !== 'children'} title="Children" text="Each child’s profile, buddy and activities.">
        <div className="panel list">
          {childProfiles.map((child) => (
            <Row
              key={child.id}
              translateTitle={false}
              left={<Avatar avatar={child.avatar} size={40} />}
              title={translate('{name}’s profile', { name: child.name })}
              copy={`${translate(ageText(child))} · ${child.language === 'ur' ? 'اردو' : 'English'}`}
              to={`/parent/children/${child.id}`}
            />
          ))}
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
          <Row icon="timer-outline" title="Daily time limit" copy="How long your child can use KidBuddy each day" end={<Badge tone="neutral">{translate('Soon')}</Badge>} onClick={() => comingSoon('Daily time limit')} />
          <Row icon="bell-outline" title="Notifications" copy="Practice reminders and weekly summaries" end={<Badge tone="neutral">{translate('Soon')}</Badge>} onClick={() => comingSoon('Notifications')} />
        </div>
      </Section>

      <Section id="therapist" hidden={tab !== 'therapist'} title="Therapist" text="KidBuddy supports home practice. It is not a replacement for your therapist.">
        <div className="panel list">
          <Row icon="account-plus-outline" title="Invite your therapist" copy="Link a therapist to your child, so they can set goals and exercises" end={<Badge tone="neutral">{translate('Soon')}</Badge>} onClick={() => comingSoon('Invite your therapist')} />
          <Row icon="export-variant" title="Share with therapist" copy="Export a progress summary to discuss together" end={<Badge tone="neutral">{translate('Soon')}</Badge>} onClick={() => comingSoon('Share with therapist')} />
        </div>
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

      <Section id="session" hidden={tab !== 'session'} title="Session" text="Log out of KidBuddy on this browser.">
        <Button variant="danger" icon="logout" onClick={confirmLogOut}>Log Out</Button>
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
