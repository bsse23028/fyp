// CHILDREN - every child profile as a card with the same three parts: who (buddy, age, language, last active), this week in one
// line, and the actions (Open Child Mode, then Progress and Edit profile side by side); plus "Add a child". Cards stack on phones.

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
      <PageHeader title="My Children" subtitle="Each child has their own buddy, language, activities and progress." actions={<Button icon="plus" to="/parent/children/new">Add child</Button>} />
      <div className="kids-grid">
        {childProfiles.map((child) => {
          const week = weekTotals(child);
          return (
            <article key={child.id} className="panel kid-card">
              <div className="kc-id">
                <span className="kc-art" style={{ background: getAvatar(child.avatar).color }}>
                  <Mascot avatar={child.avatar} size={52} alt="" />
                </span>
                <div>
                  <h2>{child.name}</h2>
                  <p>
                    {translate(ageText(child))} · {child.language === 'ur' ? 'اردو' : 'English'} · {translate('Active')} {translate(lastActiveText(child)).toLowerCase()}
                  </p>
                </div>
              </div>
              <div className="kc-nums">
                <span><b>{week.sessions}</b> {translate('sessions')}</span>
                <span><b>{week.stars}</b> {translate('stars')}</span>
                <span><b>{streakDays(child)}</b> {translate('day streak')}</span>
              </div>
              <div className="kc-acts">
                <Button block onClick={() => navigate('/who', { state: { childId: child.id } })}>Open Child Mode</Button>
                <div className="kc-acts2">
                  <Button block variant="secondary" to={`/parent/progress?child=${child.id}`}>Progress</Button>
                  <Button block variant="secondary" to={`/parent/children/${child.id}`}>Edit profile</Button>
                </div>
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
