// PLAN - turning the therapist's guidance into home practice:
//   left   a light summary per child: buddy, activities switched on + a link to choose them
//   right  Struggle words, the one tool that works, as a single row with a count; the tools still being built are folded into one
//          "{n} more planning tools are on the way" line that opens a short list (nothing in it is clickable)

import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useChild } from '../../context/ChildContext';
import { useLanguage } from '../../context/LanguageContext';
import { translate } from '../../i18n/translate';
import { Page, useCurrentChild } from '../../layouts/Layouts';
import { Avatar, PageHeader } from '../../components/ui';
import { Row } from '../../components/rows';
import Icon from '../../components/Icon';

// The planning tools, worded after the FYP proposal (the same cards as the app's Plan tab). "Struggle words" is built;
// the others say "Soon". (FR = the proposal's requirement number.)
const TOOLS = [
  { icon: 'bullseye-arrow', tone: 'lilac', title: 'Therapist targets', desc: 'Enter the therapist’s goals: sounds, words, routines' }, // FR-09, FR-11
  { icon: 'file-document-outline', tone: 'sky', title: 'Reading material', desc: 'Add your own text for Reading Assist' }, // FR-23
  { icon: 'alphabetical-variant', tone: 'sun', title: 'Struggle words', to: '/parent/struggle-words', desc: 'Recent words that resurface gently' },
  { icon: 'weather-sunny', tone: 'berry', title: 'Routine builder', desc: 'Morning and bedtime picture routines' }, // FR-50, FR-51
  { icon: 'image-plus', tone: 'leaf', title: 'Talk board pictures', desc: 'Add your child’s own people and things to the AAC board' }, // FR-47
  { icon: 'book-account', tone: 'sky', title: 'Social stories', desc: 'Stories with your child’s own people and places' }, // FR-49
];

export default function ParentPlanPage() {
  const { childProfiles, struggle, fetchStruggleWords } = useChild();
  const { currentId } = useCurrentChild();
  useLanguage();
  const ready = TOOLS.filter((t) => t.to);
  const soon = TOOLS.filter((t) => !t.to);
  const current = childProfiles.find((c) => c.id === currentId) || childProfiles[0] || null;
  useEffect(() => {
    if (current) fetchStruggleWords(current.id);
  }, [current && current.id, fetchStruggleWords]); // eslint-disable-line react-hooks/exhaustive-deps
  const entry = current ? struggle[current.id] : null;
  const wordCount = entry && entry.words ? entry.words.length : null;
  // "3 words Zara found tricky while reading" once it is known; the plain description until then
  const struggleCopy = (tool) =>
    current && wordCount
      ? translate(wordCount === 1 ? '{n} word {name} found tricky while reading' : '{n} words {name} found tricky while reading', { n: wordCount, name: current.name })
      : tool.desc;

  return (
    <Page>
      <PageHeader title="Plan" subtitle="Turn your therapist’s guidance into home practice." />
      <div className="plan">
        <section className="plan-week" aria-label={translate('This week')}>
          <h2>{translate('Small steps, repeated gently')}</h2>
          <p>{translate('The therapist gives the plan. KidBuddy helps your family practise it.')}</p>
          <ul className="plan-kids">
            {childProfiles.map((c) => {
              const n = (c.modules || []).length;
              return (
                <li key={c.id}>
                  <Avatar avatar={c.avatar} size={44} />
                  <span className="pk-id">
                    <strong>{c.name}</strong>
                    <span className="small muted">{translate(n === 1 ? '{n} activity switched on' : '{n} activities switched on', { n })}</span>
                  </span>
                  <Link to={`/parent/children/${c.id}/modules`} className="link small" aria-label={translate('Choose activities for {name}', { name: c.name })}>{translate('Choose')}</Link>
                </li>
              );
            })}
          </ul>
        </section>
        <div className="plan-tools">
          <section className="panel">
            <div className="list">
              {ready.map((tool) => (
                <Row key={tool.title} icon={tool.icon} tone={tool.tone} title={tool.title} copy={struggleCopy(tool)} to={tool.to} />
              ))}
            </div>
          </section>
          <details className="plan-soon">
            <summary>
              <Icon name="information-outline" size={18} />
              <span>{translate('{n} more planning tools are on the way', { n: soon.length })}</span>
              <Icon name="chevron-down" size={18} className="ico ps-caret" />
            </summary>
            <ul>
              {soon.map((tool) => (
                <li key={tool.title}>
                  <strong>{translate(tool.title)}</strong>
                  <span>{translate(tool.desc)}</span>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    </Page>
  );
}
