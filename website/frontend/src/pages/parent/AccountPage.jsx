// MY ACCOUNT - your name (Save name / Saved), the email (read only), and Security: Change password and the Parent PIN
// (Update PIN, or Create PIN the first time; the same row is in Settings -> Parent PIN and privacy).

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { translate } from '../../i18n/translate';
import { nameError } from '../../utils/validation';
import { Page } from '../../layouts/Layouts';
import { Button, PageHeader, TextField } from '../../components/ui';
import { Row, Section } from '../../components/rows';
import Icon from '../../components/Icon';
import PinModal from '../../components/PinModal';

export default function AccountPage() {
  const { user, updateName, pin } = useAuth();
  const [pinOpen, setPinOpen] = useState(false);
  const { alert } = useUI();
  const navigate = useNavigate();
  const [name, setName] = useState(user ? user.name : '');
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const problem = name.trim().length > 100 ? 'Enter your name (100 characters at most).' : nameError(name);
  const changed = user && name.trim() !== user.name;

  async function handleSave(event) {
    if (event) event.preventDefault();
    setSubmitted(true);
    if (problem) return;
    try {
      await updateName(name);
      setSaved(true);
    } catch (err) {
      alert({ title: 'Could not save', message: err.message });
    }
  }

  return (
    <Page narrow>
      <PageHeader title="My account" subtitle="Your name, password and Parent PIN." />
      <Section id="profile" title="Profile" text="How KidBuddy greets you.">
        <form onSubmit={handleSave} noValidate className="panel panel-pad form-stack">
          <TextField label="Your name" value={name} onChange={(v) => { setName(v); setSaved(false); }} placeholder="Full name" autoComplete="name" error={submitted ? problem : ''} maxLength={100} />
          <div className="field">
            <span className="field-label">{translate('Email address')}</span>
            <div className="field-static"><Icon name="email-outline" size={18} />{user ? user.email : ''}</div>
            <p className="field-hint">{translate('Your email is used to log in and for security codes.')}</p>
          </div>
          <div className="form-actions start">
            <Button type="submit" variant={saved ? 'secondary' : 'primary'} icon={saved ? 'check' : undefined} disabled={!changed && !saved}>
              {saved ? 'Saved' : 'Save name'}
            </Button>
          </div>
        </form>
      </Section>
      <Section id="security" title="Security" text="Changing your password needs proof it is you. The Parent PIN keeps your child in Child Mode.">
        <div className="panel list">
          <Row icon="key-outline" title="Change password" copy="Needs your old password and a code sent to your email." to="/parent/account/password" />
          <Row icon="shield-lock-outline" title={pin ? 'Update PIN' : 'Create PIN'} copy={pin ? 'Required when leaving Child Mode. Needs your old PIN.' : 'Not set yet. Tap to create one.'} onClick={() => (pin ? navigate('/parent/pin') : setPinOpen(true))} />

        </div>
      </Section>
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
