// EDIT CHILD SECTION - one part of a child's profile with its own Save (the same rules as the mobile app):
//   basics    nickname, age band, buddy, language
//   support   areas of support in 3 groups (Learning, Communication, Everyday life). Each area says what it helps with; its tick
//             box chooses it, and clicking the rest of the card DROPS DOWN its activities (e.g. Reading -> Read-Along, Reading
//             Assist, Phonics, Spelling, each with a short line). Each group has a small guide: "Has your child been diagnosed
//             with...?" (the 7 conditions and Table 1.1 of the FYP proposal; "Choose" ticks the areas). On Save the parent can
//             switch on the matching activities (a chosen diagnosis = exactly its modules; areas ticked by hand = their activities).
//   modules   activities switched on / off: first "Recommended for {name}" (matching the SAVED areas, each saying which area it
//             helps), then the other activities; with no areas a button goes to the areas page.
// The lists (groups, diagnoses, activity lines) are in data/supportGuide.js; the choices come from the server (GET /api/options).
// After Save the page goes back to where it was opened from (location.state.back, e.g. the setup page) or the profile overview.

import { useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import { useUI } from '../../context/UIContext';
import { translate } from '../../i18n/translate';
import { toggleInList } from '../../utils/misc';
import { MODULE_ABOUT, SUPPORT_GROUPS, activitiesToOffer, groupsFor, recommendedFor } from '../../data/supportGuide';
import { Page, useLogoAvatar } from '../../layouts/Layouts';
import { Button, Chip, SegmentedControl, TextField, Toggle } from '../../components/ui';
import { AvatarPicker, OptionsGate } from '../../components/forms';
import Icon from '../../components/Icon';
import ProfileTabs from './ProfileTabs';

// The tone of each support group (its colour on the page).
const TONES = { reading: 'berry', music: 'sky', calm: 'leaf', games: 'sun' };
const toneOfArea = (area) => {
  const group = SUPPORT_GROUPS.find((g) => g.areas.some((a) => a.name === area));
  return TONES[group ? group.color : 'games'];
};
// "Reading · Writing" in the site language
const listText = (names) => names.map((n) => translate(n)).join(' · ');

const TITLES = { basics: 'Basics', support: 'Areas of support', modules: 'Activities' };

export default function EditSectionPage() {
  const { childId, section } = useParams();
  const { childProfiles, updateChild, options } = useChild();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { confirm } = useUI();
  const child = childProfiles.find((c) => c.id === childId) || null;
  const [name, setName] = useState(child ? child.name : '');
  const [ageBand, setAgeBand] = useState(child ? child.ageBand : '');
  const [avatar, setAvatar] = useState(child ? child.avatar : 'rabbit');
  const [language, setLanguage] = useState(child ? child.language : 'en');
  const [supports, setSupports] = useState((child && child.supports) || []);
  const [modules, setModules] = useState((child && child.modules) || []);
  // the diagnoses whose "Choose" was clicked (not saved: only used to offer the proposal's activities on Save)
  const [chosenDiagnoses, setChosenDiagnoses] = useState([]);
  const [openArea, setOpenArea] = useState(null); // the area of support whose activities are shown (drop-down)
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  useLogoAvatar(section === 'basics' ? avatar : child ? child.avatar : null);

  if (!TITLES[section]) return <Navigate to={`/parent/children/${childId}`} replace />;
  if (!child) return <Navigate to="/parent" replace />;

  const nameProblem = name.trim() ? (name.trim().length > 60 ? 'Use at most 60 characters.' : '') : 'Enter your child’s nickname.';
  const ageProblem = ageBand ? '' : 'Choose an age band.';

  const back = (state && state.back) || `/parent/children/${child.id}`;
  // the activities that fit the SAVED areas of support (the Activities page)
  const savedSupports = child.supports || [];
  const recommended = recommendedFor(options.modules, savedSupports);
  const others = options.modules.filter((m) => !recommended.some((r) => r.name === m.name));

  async function save(changes) {
    setSaving(true);
    const saved = await updateChild(child.id, changes); // on the server; if it fails a pop-up explains and we stay here
    setSaving(false);
    if (saved) navigate(back);
  }

  // Areas of support: offer to switch on the activities that match.
  async function saveSupports() {
    const fitting = activitiesToOffer(options.modules, supports, chosenDiagnoses);
    const missing = fitting.filter((m) => !modules.includes(m));
    if (missing.length === 0) return save({ supports });
    const yes = await confirm({
      title: 'Switch on matching activities?',
      message: translate('These activities help with the areas you chose: {list}', { list: listText(missing) }),
      confirmLabel: 'Switch them on',
      cancelLabel: 'Only save areas',
    });
    return save(yes ? { supports, modules: [...modules, ...missing] } : { supports });
  }

  async function handleSave(event) {
    event.preventDefault();
    if (section === 'basics') {
      setSubmitted(true);
      if (nameProblem || ageProblem) return;
      return save({ name: name.trim(), ageBand, avatar, language });
    }
    if (section === 'support') return saveSupports();
    return save({ modules });
  }

  // one activity row: name, a short line, (recommended: which areas it helps), the sensor badge, on / off
  function moduleRow(module, because) {
    return (
      <div key={module.name} className="list-row">
        <span className="lr-main">
          <span className="lr-title">{translate(module.name)}</span>
          {MODULE_ABOUT[module.name] && <span className="lr-sub">{translate(MODULE_ABOUT[module.name])}</span>}
          {because && (
            <span className="for-row">
              {because.map((area) => <span key={area} className={`for-tag ${toneOfArea(area)}`}>{translate(area)}</span>)}
            </span>
          )}
          {module.sensor && <span className="lr-sub">{translate('Uses: {s}', { s: translate(module.sensor) })}</span>}
        </span>
        <Toggle on={modules.includes(module.name)} onClick={() => setModules(toggleInList(modules, module.name))} label={module.name} />
      </div>
    );
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
          <div className="form-stack">
            <div>
              <h2 className="title-md">{translate('Areas of support')}</h2>
              <p className="muted">{translate('Choose the areas where your child needs help. This is optional.')}</p>
            </div>
            <div className="callout">
              <Icon name="information-outline" size={20} />
              <p className="small">{translate('This does not diagnose anything. If your child already has a diagnosis, the guide in each group shows where to start.')}</p>
            </div>

            {groupsFor(options.supports).map((group) => {
              const tone = TONES[group.color] || 'sun';
              return (
                <section key={group.key} className={`support-group ${tone}`}>
                  <h3 className="support-group-head">
                    <span className="ico-tile"><Icon name={group.icon === 'book-open-variant' ? 'book-open-variant' : group.icon === 'chat-processing-outline' ? 'chat-outline' : group.icon === 'calendar-check-outline' ? 'calendar-check-outline' : 'dots-horizontal'} size={20} /></span>
                    {translate(group.title)}
                  </h3>

                  {group.areas.map((area) => {
                    const on = supports.includes(area.name);
                    const open = openArea === area.name;
                    const areaModules = options.modules.filter((m) => (m.supports || []).includes(area.name));
                    return (
                      <div key={area.name} className={`area-card${on ? ' on' : ''}`}>
                        <div className="area-row">
                          <button type="button" role="checkbox" aria-checked={on} aria-label={translate(area.name)} className="area-check" onClick={() => setSupports(toggleInList(supports, area.name))}>
                            {on && <Icon name="check" size={18} />}
                          </button>
                          <button type="button" className="area-open" aria-expanded={open} onClick={() => setOpenArea(open ? null : area.name)}>
                            <span className="area-text">
                              <strong>{translate(area.name)}</strong>
                              {area.about && <small>{translate(area.about)}</small>}
                              <span className="area-count">{translate(open ? 'Hide {n} activities' : 'Show {n} activities', { n: areaModules.length })}</span>
                            </span>
                            <Icon name={open ? 'chevron-up' : 'chevron-down'} size={24} />
                          </button>
                        </div>
                        {open && (
                          <ul className="area-drop">
                            {areaModules.map((module) => (
                              <li key={module.name}>
                                <i className="area-dot" />
                                <span className="area-text">
                                  <strong>{translate(module.name)}</strong>
                                  {MODULE_ABOUT[module.name] && <small>{translate(MODULE_ABOUT[module.name])}</small>}
                                </span>
                                {module.sensor && <span className="badge neutral">{translate(module.sensor)}</span>}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}

                  {group.diagnoses.length > 0 && (
                    <div className="guide">
                      <h4>{translate('Has your child been diagnosed with…')}</h4>
                      {group.diagnoses.map((diagnosis) => {
                        const areas = diagnosis.recommend.filter((a) => options.supports.includes(a));
                        const activities = diagnosis.modules.filter((m) => options.modules.some((x) => x.name === m));
                        const allChosen = chosenDiagnoses.includes(diagnosis.name) && areas.every((a) => supports.includes(a));
                        return (
                          <div key={diagnosis.name} className="diagnosis">
                            <div className="area-text">
                              <strong>{translate(diagnosis.name)}</strong>
                              <small>{translate(diagnosis.about)}</small>
                              <span className="recommend">{translate('We recommend: {list}', { list: listText(areas) })}</span>
                              <span className="recommend soft">{translate('Activities: {list}', { list: listText(activities) })}</span>
                            </div>
                            <Button
                              size="sm"
                              variant={allChosen ? 'primary' : 'secondary'}
                              aria-label={translate('Choose the areas for {name}', { name: translate(diagnosis.name) })}
                              onClick={() => {
                                setSupports([...supports, ...areas.filter((a) => !supports.includes(a))]);
                                if (!chosenDiagnoses.includes(diagnosis.name)) setChosenDiagnoses([...chosenDiagnoses, diagnosis.name]);
                              }}
                            >
                              {allChosen ? 'Chosen' : 'Choose'}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {section === 'modules' && (
          <div className="form-stack">
            <div>
              <h2 className="title-md">{translate('Activities')}</h2>
              <p className="muted">{translate('Switch activities on or off. You stay in control.')}</p>
            </div>
            {recommended.length > 0 ? (
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <h2>{translate('Recommended for {name}', { name: child.name })}</h2>
                    <p className="small muted">{translate('Based on the areas of support: {list}', { list: listText(savedSupports) })}</p>
                  </div>
                  <Button variant="secondary" size="sm" icon="auto-fix" onClick={() => setModules([...modules, ...recommended.map((m) => m.name).filter((m) => !modules.includes(m))])}>
                    Switch on all recommended
                  </Button>
                </div>
                <div className="list">{recommended.map((module) => moduleRow(module, module.because))}</div>
              </div>
            ) : (
              <div className="callout">
                <Icon name="information-outline" size={20} />
                <div>
                  <p className="small">{translate('Choose areas of support to see which activities we recommend.')}</p>
                  <Button variant="secondary" size="sm" style={{ marginTop: 10 }} onClick={() => navigate(`/parent/children/${child.id}/support`, { replace: true, state })}>
                    Choose areas of support
                  </Button>
                </div>
              </div>
            )}
            {others.length > 0 && (
              <div className="panel">
                <div className="panel-head"><h2>{translate(recommended.length > 0 ? 'Other activities' : 'Activities')}</h2></div>
                <div className="list">{others.map((module) => moduleRow(module))}</div>
              </div>
            )}
          </div>
        )}

        <div className="form-actions sticky-actions">
          <Button variant="secondary" onClick={() => navigate(back)}>Cancel</Button>
          <Button type="submit" loading={saving}>Save changes</Button>
        </div>
      </form>
      </OptionsGate>
    </Page>
  );
}
