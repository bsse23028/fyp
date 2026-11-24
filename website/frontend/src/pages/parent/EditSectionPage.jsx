// EDIT CHILD SECTION - one part of a child's profile with its own Save:
// basics · support (areas of support) · modules (activities on / off).

import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import { translate } from '../../i18n/translate';
import { toggleInList } from '../../utils/misc';
import { Page, useLogoAvatar } from '../../layouts/Layouts';
import { Button, Chip, SegmentedControl, TextField, Toggle } from '../../components/ui';
import { AvatarPicker, OptionsGate } from '../../components/forms';
import Icon from '../../components/Icon';
import ProfileTabs from './ProfileTabs';

const TITLES = { basics: 'Basics', support: 'Areas of support', modules: 'Activities' };

export default function EditSectionPage() {
  const { childId, section } = useParams();
  const { childProfiles, updateChild, options } = useChild();
  const navigate = useNavigate();
  const child = childProfiles.find((c) => c.id === childId) || null;
  const [name, setName] = useState(child ? child.name : '');
  const [ageBand, setAgeBand] = useState(child ? child.ageBand : '');
  const [avatar, setAvatar] = useState(child ? child.avatar : 'rabbit');
  const [language, setLanguage] = useState(child ? child.language : 'en');
  const [supports, setSupports] = useState((child && child.supports) || []);
  const [modules, setModules] = useState((child && child.modules) || []);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  useLogoAvatar(section === 'basics' ? avatar : child ? child.avatar : null);

  if (!TITLES[section]) return <Navigate to={`/parent/children/${childId}`} replace />;
  if (!child) return <Navigate to="/parent" replace />;

  const nameProblem = name.trim() ? (name.trim().length > 60 ? 'Use at most 60 characters.' : '') : 'Enter your child’s nickname.';
  const ageProblem = ageBand ? '' : 'Choose an age band.';

  async function handleSave(event) {
    event.preventDefault();
    let changes;
    if (section === 'basics') {
      setSubmitted(true);
      if (nameProblem || ageProblem) return;
      changes = { name: name.trim(), ageBand, avatar, language };
    } else if (section === 'support') changes = { supports };
    else changes = { modules };
    setSaving(true);
    const saved = await updateChild(child.id, changes);
    setSaving(false);
    if (saved) navigate(`/parent/children/${child.id}`);
  }

  return (
    <Page>
      <ProfileTabs child={child} />
      <OptionsGate>
      <form onSubmit={handleSave} noValidate className="form-page wide">
        {section === 'basics' && (
          <div className="panel panel-pad form-stack">
            <div className="form-grid">
              <TextField label="Nickname" value={name} onChange={setName} placeholder="e.g. Zara" error={submitted ? nameProblem : ''} maxLength={60} />
              <div className="field">
                <span className="field-label">{translate('Primary language')}</span>
                <SegmentedControl options={options.languages} value={language} onChange={setLanguage} label="Primary language" block />
              </div>
            </div>
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
          </div>
        )}

        {section === 'support' && (
          <div className="panel panel-pad form-stack">
            <div>
              <h2 className="title-md">{translate('Areas of support')}</h2>
              <p className="muted">{translate('Choose anything that would be helpful. This is optional.')}</p>
            </div>
            <div className="callout"><Icon name="information-outline" size={20} /><p className="small">{translate('This does not diagnose anything.')}</p></div>
            <div className="chip-row">
              {options.supports.map((option) => (
                <Chip key={option} label={option} selected={supports.includes(option)} onClick={() => setSupports(toggleInList(supports, option))} />
              ))}
            </div>
          </div>
        )}

        {section === 'modules' && (
          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>{translate('Activities')}</h2>
                <p className="small muted">{translate('Switch activities on or off. You stay in control.')}</p>
              </div>
              <Button variant="secondary" size="sm" icon="auto-fix" onClick={() => setModules(options.suggestModules(child.supports || []))}>
                Suggest from areas of support
              </Button>
            </div>
            <div className="list">
              {options.modules.map((module) => (
                <div key={module.name} className="list-row">
                  <span className="lr-main">
                    <span className="lr-title">{translate(module.name)}</span>
                    {module.sensor && <span className="lr-sub">{translate('Uses: {s}', { s: translate(module.sensor) })}</span>}
                  </span>
                  <Toggle on={modules.includes(module.name)} onClick={() => setModules(toggleInList(modules, module.name))} label={module.name} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-actions sticky-actions">
          <Button variant="secondary" onClick={() => navigate(`/parent/children/${child.id}`)}>Cancel</Button>
          <Button type="submit" loading={saving}>Save changes</Button>
        </div>
      </form>
      </OptionsGate>
    </Page>
  );
}
