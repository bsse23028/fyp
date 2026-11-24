// PLAN - turning the therapist's guidance into home practice. "Struggle words" opens its page;
// the other planning tools are still being built and say so (as in the app).

import { useNavigate } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useChild } from '../../context/ChildContext';
import { useLanguage } from '../../context/LanguageContext';
import { translate } from '../../i18n/translate';
import { Page } from '../../layouts/Layouts';
import { Badge, PageHeader } from '../../components/ui';
import { Row } from '../../components/rows';

const TOOLS = [
  { icon: 'bullseye-arrow', tone: 'lilac', title: 'Therapist targets', desc: 'Goals shared by your therapist' },
  { icon: 'file-document-outline', tone: 'sky', title: 'Reading material', desc: 'Upload or type familiar text' },
  { icon: 'alphabetical-variant', tone: 'sun', title: 'Struggle words', to: '/parent/struggle-words', desc: 'Recent words that resurface gently' },
  { icon: 'weather-sunny', tone: 'berry', title: 'Routine builder', desc: 'Morning and after-school routines' },
  { icon: 'view-grid-outline', tone: 'leaf', title: 'AAC symbol editor', desc: 'Update boards and quick phrases' },
];

export default function ParentPlanPage() {
  const { alert } = useUI();
  const { childProfiles } = useChild();
  const navigate = useNavigate();
  useLanguage();

  return (
    <Page>
      <PageHeader title="Plan" subtitle="Turn guidance into manageable home practice." />
      <div className="plan">
        <section className="plan-week">
          <p className="small">{translate('This week')}</p>
          <h2 className="title-lg">{translate('Small steps, repeated gently')}</h2>
          <p>{translate('The therapist gives the plan. KidBuddy helps your family practise it.')}</p>
          <ul className="plan-kids">
            {childProfiles.map((c) => (
              <li key={c.id}>
                <span>{c.name}</span>
                <span className="tiny">{translate('{n} activities switched on', { n: (c.modules || []).length })}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <div className="panel-head"><h2>{translate('Planning tools')}</h2></div>
          <div className="list">
            {TOOLS.map((tool) => (
              <Row
                key={tool.title}
                icon={tool.icon}
                tone={tool.tone}
                title={tool.title}
                copy={tool.desc}
                end={!tool.to && <Badge tone="neutral">{translate('Soon')}</Badge>}
                onClick={() => (tool.to ? navigate(tool.to) : alert({ title: tool.title, message: 'This part is still being built. Check back soon!' }))}
              />
            ))}
          </div>
        </section>
      </div>
    </Page>
  );
}
