// CREATE CHILD PROFILE - one quick form (nickname, age band, buddy, language) next to a live preview of
// how the child will look in Child Mode. Used for the first child (setup) and "Add another child".
// A new child starts with ALL activities switched OFF (NEW_CHILD_ACTIVITIES_ON in data/childOptions.js); "Create profile"
// then opens the optional setup page (areas of support, activities, personalize stories) with "Skip for now".

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import { translate } from '../../i18n/translate';
import { EMPTY_STORY } from '../../data/storyOptions';
import { NEW_CHILD_ACTIVITIES_ON } from '../../data/childOptions';
import { DEFAULT_AVATAR, getAvatar } from '../../data/avatars';
import { Page, useLogoAvatar } from '../../layouts/Layouts';
import { Button, Chip, Mascot, PageHeader, SegmentedControl, TextField } from '../../components/ui';
import { AvatarPicker, OptionsGate } from '../../components/forms';

export default function CreateChildPage({ embedded = false }) {
  const { addChild, options, childProfiles } = useChild();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [ageBand, setAgeBand] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [language, setLanguage] = useState('en');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  useLogoAvatar(avatar);

  const nameProblem = name.trim() ? (name.trim().length > 60 ? 'Use at most 60 characters.' : '') : 'Enter your child’s nickname.';
  const ageProblem = ageBand ? '' : 'Choose an age band.';

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    if (nameProblem || ageProblem) return;
    setSaving(true);
    const child = await addChild({ name: name.trim(), ageBand, avatar, language, supports: [], modules: NEW_CHILD_ACTIVITIES_ON ? options.defaultModules() : [], story: EMPTY_STORY });
    setSaving(false);
    // next: the OPTIONAL extras (areas of support, activities, stories). In Preview nothing is saved (no id): Dashboard.
    if (child) navigate(child.id ? `/parent/children/${child.id}/setup` : '/parent', { replace: true });
  }

  const canGoBack = embedded || childProfiles.length > 0;
  const buddy = getAvatar(avatar);
  const form = (
    <form onSubmit={handleSubmit} noValidate className="create-child">
      <div className="panel panel-pad form-stack">
        <TextField label="Nickname" value={name} onChange={setName} placeholder="e.g. Zara" error={submitted ? nameProblem : ''} maxLength={60} autoFocus hint="What your child is called at home. No surname needed." />
        <fieldset className="choice-field">
          <legend className="field-label">{translate('Age band')}</legend>
          <div className="chip-row">
            {options.ageBands.map((band) => (
              <Chip key={band} label={band} selected={ageBand === band} onClick={() => setAgeBand(band)} />
            ))}
          </div>
          {submitted && ageProblem && <p className="field-error">{translate(ageProblem)}</p>}
        </fieldset>
        <fieldset className="choice-field">
          <legend className="field-label">{translate('Choose an avatar')}</legend>
          <AvatarPicker selectedId={avatar} onSelect={setAvatar} />
        </fieldset>
        <div className="field">
          <span className="field-label">{translate('Primary language')}</span>
          <SegmentedControl options={options.languages} value={language} onChange={setLanguage} label="Primary language" />
        </div>
        <div className="form-actions">
          {canGoBack && <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>}
          <Button type="submit" loading={saving}>Create profile</Button>
        </div>
      </div>
      <aside className="cc-preview" aria-live="polite">
        <div className="cc-card">
          <span className="cc-art" style={{ background: buddy.color }}>
            <Mascot avatar={avatar} size={140} bob alt="" />
          </span>
          <p className="cc-name">{name.trim() || translate('Your child')}</p>
          <p className="small muted">{[ageBand ? translate(ageBand) : '', language === 'ur' ? 'اردو' : 'English'].filter(Boolean).join(' · ')}</p>
        </div>
        <p className="tiny muted">{translate('This is how {name} will see themself in Child Mode.', { name: name.trim() || translate('your child') })}</p>
        <p className="tiny muted">{translate('Areas of support, activities and story details can be added later.')}</p>
      </aside>
    </form>
  );

  if (embedded) {
    return (
      <Page>
        <PageHeader title="Create child profile" subtitle="Just a few quick details. Next you can add more if you like (optional)." />
        <OptionsGate>{form}</OptionsGate>
      </Page>
    );
  }
  return (
    <div className="setup-page">
      <PageHeader title="Create child profile" subtitle="Just a few quick details. Next you can add more if you like (optional)." />
      <OptionsGate>{form}</OptionsGate>
    </div>
  );
}
