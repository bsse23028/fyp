// PERSONALIZE STORIES - "Personalize my child's stories" (the app's PersonalizeStoriesScreen):
// 5 optional steps (People · Favourite things · Hobbies and interests · Everyday world · Special
// instructions). Every step has Skip; "Save and close" works at any time. Saved as child.story.

import { useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import { translate } from '../../i18n/translate';
import {
  ANIMALS, COLOURS, EVERYDAY_ACTIVITIES, FAMILIAR_PLACES, FOODS, GAMES, HOBBIES, NOTE_IDEAS, PLACES, ROUTINES,
  STORY_TYPES, TOYS, cleanStory, getStory, previewSentence,
} from '../../data/storyOptions';
import { Button, Chip, ProgressBar, TextField } from '../../components/ui';
import { Page } from '../../layouts/Layouts';
import ProfileTabs from './ProfileTabs';
import { ChoiceField, ColorChoice, OptionsGate } from '../../components/forms';

const MAX_SIBLINGS = 5;
const MAX_OTHERS = 3;

const STEPS = [
  { title: 'People in my child’s life', why: 'Helps create stories with familiar people.' },
  { title: 'Favourite things', why: 'Helps choose story topics the child enjoys.' },
  { title: 'Hobbies and interests', why: 'Helps create engaging story events.' },
  { title: 'Everyday world', why: 'Helps make stories relatable to daily life.' },
  { title: 'Special instructions', why: 'Anything else the stories should, or should not, include.' },
];

export default function PersonalizeStoriesPage() {
  const { childId } = useParams();
  const { childProfiles, updateChild, options } = useChild();
  const navigate = useNavigate();
  const { state } = useLocation();
  const child = childProfiles.find((c) => c.id === childId) || null;
  const [story, setStory] = useState(() => getStory(child));
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  if (!child) return <Navigate to="/parent" replace />;

  const { people, favourites, interests, everyday } = story;
  const last = step === STEPS.length - 1;
  const setIn = (section, key, value) => setStory((s) => ({ ...s, [section]: { ...s[section], [key]: value } }));
  const siblings = people.siblings.length > 0 ? people.siblings : [''];
  const others = people.others.length > 0 ? people.others : [{ name: '', relation: '' }];

  function changeStep(n) {
    setStep(n);
    window.scrollTo(0, 0);
  }

  async function save() {
    setSaving(true);
    const ok = await updateChild(child.id, { story: cleanStory(story) });
    setSaving(false);
    if (ok) navigate((state && state.back) || `/parent/children/${child.id}`); // back to where it was opened from (e.g. the setup page)
  }

  const goNext = () => (last ? save() : changeStep(step + 1));
  const text = { maxLength: 100 };

  return (
    <Page>
      <ProfileTabs child={child} />
      <OptionsGate>
      <div className="story-layout">
        <nav className="story-steps" aria-label={translate('Steps')}>
          <p className="small muted">{translate('This helps customise your child’s stories and activities. All optional: fill in only what you know, skip any section, or do it later.')}</p>
          <ol>
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <button type="button" className={i === step ? 'on' : ''} aria-current={i === step ? 'step' : undefined} onClick={() => changeStep(i)}>
                  <span className="step-num">{i + 1}</span>
                  {translate(s.title)}
                </button>
              </li>
            ))}
          </ol>
          <Button variant="secondary" block onClick={save} loading={saving && !last}>Save and close</Button>
        </nav>
      <div className="panel panel-pad story-form">
      <p className="small muted">{translate('Step {n} of 5', { n: step + 1 })}</p>
      <ProgressBar value={((step + 1) / STEPS.length) * 100} label={translate('Step {n} of 5', { n: step + 1 })} />
      <h2 className="title-md" style={{ marginTop: 16 }}>{translate(STEPS[step].title)}</h2>
      <p className="muted">{translate(STEPS[step].why)}</p>

      <div className="form-stack" style={{ marginTop: 20 }}>
        {step === 0 && (
          <>
            <TextField label="Preferred name for stories" value={people.preferredName} onChange={(v) => setIn('people', 'preferredName', v)} placeholder={`e.g. ${child.name}`} {...text} />
            <TextField label="Mother’s name or nickname" value={people.mother} onChange={(v) => setIn('people', 'mother', v)} placeholder="e.g. Ammi" className="field-gap" {...text} />
            <TextField label="Father’s name or nickname" value={people.father} onChange={(v) => setIn('people', 'father', v)} placeholder="e.g. Abbu" className="field-gap" {...text} />
            {siblings.map((name, i) => (
              <div key={i} className="story-list-row">
                <TextField className="grow" label={translate('Sibling {n}', { n: i + 1 })} value={name} onChange={(v) => setIn('people', 'siblings', siblings.map((s, n) => (n === i ? v : s)))} placeholder="Name or nickname" {...text} />
                {(siblings.length > 1 || name) && (
                  <button type="button" className="story-remove" aria-label={translate('Remove')} onClick={() => setIn('people', 'siblings', siblings.filter((s, n) => n !== i))}>✕</button>
                )}
              </div>
            ))}
            {siblings.length < MAX_SIBLINGS && siblings[siblings.length - 1] !== '' && (
              <button type="button" className="link story-add" onClick={() => setIn('people', 'siblings', [...siblings, ''])}>+ {translate('Add a sibling')}</button>
            )}
            <h3 className="story-subtitle">{translate('Other important people')}</h3>
            {others.map((person, i) => (
              <div key={i} className="person-card">
                <TextField label="Name" value={person.name} onChange={(v) => setIn('people', 'others', others.map((o, n) => (n === i ? { ...o, name: v } : o)))} placeholder="e.g. Dadi" {...text} />
                <div>
                  <ChoiceField label="Relationship" options={options.relations} value={person.relation} onChange={(v) => setIn('people', 'others', others.map((o, n) => (n === i ? { ...o, relation: v } : o)))} />
                </div>
                {(others.length > 1 || person.name) && (
                  <button type="button" className="story-remove-person" onClick={() => setIn('people', 'others', others.filter((o, n) => n !== i))}>{translate('Remove')}</button>
                )}
              </div>
            ))}
            {others.length < MAX_OTHERS && others[others.length - 1].name !== '' && (
              <button type="button" className="link story-add" onClick={() => setIn('people', 'others', [...others, { name: '', relation: '' }])}>+ {translate('Add another person')}</button>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <ChoiceField label="Favourite animal" options={ANIMALS} value={favourites.animal} onChange={(v) => setIn('favourites', 'animal', v)} />
            <ChoiceField label="Favourite toy or object" options={TOYS} value={favourites.toy} onChange={(v) => setIn('favourites', 'toy', v)} />
            <ChoiceField label="Favourite food" options={FOODS} value={favourites.food} onChange={(v) => setIn('favourites', 'food', v)} />
            <ColorChoice label="Favourite colour" colours={COLOURS} value={favourites.colour} onChange={(v) => setIn('favourites', 'colour', v)} />
            <TextField label="Favourite cartoon or character" value={favourites.character} onChange={(v) => setIn('favourites', 'character', v)} placeholder="e.g. Peppa Pig, Burka Avenger" {...text} />
            <ChoiceField label="Favourite game or activity" options={GAMES} value={favourites.game} onChange={(v) => setIn('favourites', 'game', v)} />
          </>
        )}

        {step === 2 && (
          <>
            <ChoiceField label="Favourite hobbies" hint="Pick as many as you like." options={HOBBIES} value={interests.hobbies} onChange={(v) => setIn('interests', 'hobbies', v)} multiple otherPlaceholder="Another hobby" />
            <ChoiceField label="Favourite place" options={PLACES} value={interests.place} onChange={(v) => setIn('interests', 'place', v)} />
            <ChoiceField label="Favourite kinds of story" hint="Pick as many as you like." options={STORY_TYPES} value={interests.storyTypes} onChange={(v) => setIn('interests', 'storyTypes', v)} multiple otherPlaceholder="Another kind of story" />
          </>
        )}

        {step === 3 && (
          <>
            <TextField label="Hometown or place you live" value={everyday.hometown} onChange={(v) => setIn('everyday', 'hometown', v)} placeholder="Lahore" {...text} />
            <ChoiceField label="Favourite everyday activity" options={EVERYDAY_ACTIVITIES} value={everyday.activity} onChange={(v) => setIn('everyday', 'activity', v)} />
            <ChoiceField label="Familiar places" hint="Places your child goes to often." options={FAMILIAR_PLACES} value={everyday.places} onChange={(v) => setIn('everyday', 'places', v)} multiple otherPlaceholder="Another place" />
            <ChoiceField label="Favourite routine or family activity" options={ROUTINES} value={everyday.routine} onChange={(v) => setIn('everyday', 'routine', v)} />
          </>
        )}

        {step === 4 && (
          <>
            <TextField label="Special instructions for story generation" multiline value={story.notes} onChange={(v) => setStory((s) => ({ ...s, notes: v }))} placeholder="E.g. use familiar Pakistani settings, include simple daily-life situations, avoid scary animals..." maxLength={1000} />
            <h3 className="story-subtitle">{translate('Tap an idea to add it')}</h3>
            <div className="chip-row" style={{ gap: 8 }}>
              {NOTE_IDEAS.map((idea) => (
                <Chip
                  key={idea}
                  label={idea}
                  selected={story.notes.includes(idea)}
                  onClick={() =>
                    story.notes.includes(idea)
                      ? setStory({ ...story, notes: story.notes.replace(idea, '').replace(/\s{2,}/g, ' ').trim() })
                      : setStory({ ...story, notes: (story.notes ? story.notes.trim() + ' ' : '') + idea })
                  }
                />
              ))}
            </div>
            <div className="story-preview">
              <p className="story-preview-label">{translate('Story preview')}</p>
              <p className="story-preview-text">{previewSentence(child.name, story)}</p>
              <p className="story-preview-note">{translate('A sample of how your answers can be used in a story.')}</p>
            </div>
          </>
        )}
      </div>

      <div className="form-actions" style={{ marginTop: 28 }}>
        {step > 0 && <Button variant="ghost" icon="arrow-left" onClick={() => changeStep(step - 1)} style={{ marginInlineEnd: 'auto' }}>Previous</Button>}
        <Button variant="secondary" onClick={goNext}>Skip</Button>
        <Button onClick={goNext} loading={saving && last}>{last ? 'Save' : 'Next'}</Button>
      </div>
      </div>
      </div>
      </OptionsGate>
    </Page>
  );
}
