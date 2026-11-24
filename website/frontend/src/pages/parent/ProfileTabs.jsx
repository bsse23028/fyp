// PROFILE TABS - the header shared by a child's profile pages: buddy, name, age, and the tabs
// Overview · Basics · Areas of support · Activities · Stories (each is its own page / URL).

import { NavLink } from 'react-router-dom';
import { translate } from '../../i18n/translate';
import { getAvatar } from '../../data/avatars';
import { ageText } from '../../utils/progress';
import { Button, Mascot } from '../../components/ui';
import Icon from '../../components/Icon';

const TABS = [
  { to: '', label: 'Overview', end: true },
  { to: '/basics', label: 'Basics' },
  { to: '/support', label: 'Areas of support' },
  { to: '/modules', label: 'Activities' },
  { to: '/stories', label: 'Stories' },
];

export default function ProfileTabs({ child }) {
  const base = `/parent/children/${child.id}`;
  return (
    <div className="profile-head">
      <NavLink to="/parent/children" className="crumb">
        <Icon name="arrow-left" size={16} className="ico flip-rtl" />
        {translate('Children')}
      </NavLink>
      <div className="profile-id">
        <span className="profile-art" style={{ background: getAvatar(child.avatar).color }}>
          <Mascot avatar={child.avatar} size={56} alt="" />
        </span>
        <div>
          <h1 className="title-xl">{child.name}</h1>
          <p className="small muted">{translate(ageText(child))} · {child.language === 'ur' ? 'اردو' : 'English'}</p>
        </div>
        <div className="profile-actions">
          <Button variant="secondary" size="sm" icon="chart-line" to={`/parent/progress?child=${child.id}`}>Progress</Button>
        </div>
      </div>
      <nav className="tabs" aria-label={translate('Profile sections')}>
        {TABS.map((t) => (
          <NavLink key={t.label} to={base + t.to} end={t.end}>
            {translate(t.label)}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
