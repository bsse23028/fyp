// PROFILE TABS - the header shared by a child's profile pages: buddy, name, age, and the tabs
// Overview · Basics · Areas of support · Activities · Stories (each is its own page / URL).
// On a phone the five tabs do not fit, so they become a "section picker": one 48px button showing where you are, which opens the list.

import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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

function SectionPicker({ base }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const here = TABS.find((t) => pathname.replace(/\/+$/, '') === base + t.to) || TABS[0];
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);
  return (
    <div className="section-picker" ref={box}>
      <button type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={translate('Profile sections')} onClick={() => setOpen(!open)}>
        <span>{translate(here.label)}</span>
        <Icon name="chevron-down" size={20} />
      </button>
      {open && (
        <div className="sp-list" role="listbox" aria-label={translate('Profile sections')}>
          {TABS.map((t) => (
            <NavLink key={t.label} to={base + t.to} end={t.end} role="option" aria-selected={t === here}>
              {translate(t.label)}
              {t === here && <Icon name="check" size={18} />}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProfileTabs({ child }) {
  const base = `/parent/children/${child.id}`;
  return (
    <div className="profile-head">
      <NavLink to="/parent/children" className="crumb">
        <Icon name="arrow-left" size={16} className="ico flip-rtl" />
        {translate('My Children')}
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
      <SectionPicker base={base} />
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
