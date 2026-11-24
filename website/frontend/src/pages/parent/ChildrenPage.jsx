// CHILDREN - every child profile as a card: buddy, age, language, this week, activities switched on,
// with Open Child Mode, Progress and Edit; plus "Add a child".

import { useNavigate } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import { useLanguage } from '../../context/LanguageContext';
import { translate } from '../../i18n/translate';
import { getAvatar } from '../../data/avatars';
import { ageText, lastActiveText, streakDays, weekTotals } from '../../utils/progress';
import { Page } from '../../layouts/Layouts';
import { Button, Mascot, PageHeader } from '../../components/ui';
import Icon from '../../components/Icon';

export default function ChildrenPage() {
  const { childProfiles } = useChild();
  useLanguage();
  const navigate = useNavigate();

  return (
    <Page>
      <PageHeader title="Children" subtitle="Each child has their own buddy, language, activities and progress." actions={<Button icon="plus" to="/parent/children/new">Add child</Button>} />
      <div className="kids-grid">
        {childProfiles.map((child) => {
          const week = weekTotals(child);
          return (
            <article key={child.id} className="panel kid-card">
              <div className="kid-card-art" style={{ background: getAvatar(child.avatar).color }}>
                <Mascot avatar={child.avatar} size={104} alt="" />
              </div>
              <div className="kid-card-body">
                <h2 className="title-md">{child.name}</h2>
                <p className="small muted">
                  {translate(ageText(child))} · {child.language === 'ur' ? 'اردو' : 'English'} · {translate('Active')} {translate(lastActiveText(child)).toLowerCase()}
                </p>
                <dl className="kid-card-facts">
                  <div><dt>{translate('Sessions this week')}</dt><dd>{week.sessions}</dd></div>
                  <div><dt>{translate('Stars this week')}</dt><dd>{week.stars}</dd></div>
                  <div><dt>{translate('Day streak')}</dt><dd>{streakDays(child)}</dd></div>
                </dl>
                <p className="tiny muted">{translate('{n} activities switched on', { n: (child.modules || []).length })}</p>
              </div>
              <div className="kid-card-actions">
                <Button size="sm" icon="lock-open-variant-outline" onClick={() => navigate('/who', { state: { childId: child.id } })}>Open Child Mode</Button>
                <Button size="sm" variant="secondary" icon="chart-line" to={`/parent/progress?child=${child.id}`}>Progress</Button>
                <Button size="sm" variant="ghost" icon="pencil-outline" to={`/parent/children/${child.id}`}>Edit</Button>
              </div>
            </article>
          );
        })}
        <button type="button" className="kid-add" onClick={() => navigate('/parent/children/new')}>
          <Icon name="plus" size={28} />
          <span>{translate(childProfiles.length === 0 ? 'Add a child' : 'Add another child')}</span>
          <span className="small muted">{translate('Brothers and sisters each get their own profile.')}</span>
        </button>
      </div>
    </Page>
  );
}
