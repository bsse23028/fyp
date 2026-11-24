// PARENT PIECES - the building blocks of the Parent Mode pages:
//   <Row icon="lock-outline" title="Update PIN" copy="..." onClick | to />   a list row with a chevron
//   <Section title="..." text="...">...</Section>                           a settings section (label left on desktop)
//   <Stat label="Sessions" value={4} icon="..." tone="sky" />                 one number
//   <WeekChart bars={[{label, value}]} caption="..." />                       the small bar chart
//   <ChildPicker children={...} value={id} onChange />                       which child a page shows
//   <MoreMenu label="..." items={[{label, icon, onClick, danger}]} />        the ⋯ menu
//   PageHeading is the older name of PageHeader, kept for pages that still use it.

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { translate } from '../i18n/translate';
import { Avatar, PageHeader } from './ui';
import Icon from './Icon';

export function Row({ icon, tone = '', title, copy, onClick, to, end, left, translateTitle = true, danger = false }) {
  const inside = (
    <>
      {left}
      {icon && (
        <span className={`ico-tile ${tone}`}>
          <Icon name={icon} size={20} />
        </span>
      )}
      <span className="lr-main">
        <span className="lr-title">{translateTitle ? translate(title) : title}</span>
        {copy && <span className="lr-sub">{typeof copy === 'string' ? translate(copy) : copy}</span>}
      </span>
      <span className="lr-end">
        {end}
        {(onClick || to) && <Icon name="chevron-right" size={20} className="ico flip-rtl" />}
      </span>
    </>
  );
  const cls = `list-row${onClick || to ? ' action' : ''}${danger ? ' danger' : ''}`;
  if (to) return <Link to={to} className={cls}>{inside}</Link>;
  if (onClick) return <button type="button" className={cls} onClick={onClick}>{inside}</button>;
  return <div className={cls}>{inside}</div>;
}

export function Section({ title, text, children, id, hidden }) {
  return (
    <section className="settings-section" id={id} hidden={hidden} aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="ss-head">
        <h2 id={id ? `${id}-title` : undefined}>{translate(title)}</h2>
        {text && <p>{translate(text)}</p>}
      </div>
      <div className="ss-body">{children}</div>
    </section>
  );
}

export function Stat({ label, value, icon, tone = '', hint }) {
  return (
    <div className={`stat ${tone}`}>
      {icon && (
        <span className="stat-ico">
          <Icon name={icon} size={20} />
        </span>
      )}
      <div className="stat-text">
        <span className="stat-label">{translate(label)}</span>
        <span className="stat-value">{value}</span>
        {hint && <span className="stat-hint">{translate(hint)}</span>}
      </div>
    </div>
  );
}

// Seven small bars for one child's week (the Figma "This week" strip on a child card).
export function MiniBars({ days }) {
  const max = Math.max(1, ...days.map((d) => d.value));
  return (
    <span className="mini-bars" aria-hidden="true">
      {days.map((d, i) => (
        <i key={i} className={d.value ? (d.today ? 'today' : 'on') : ''} style={{ height: `${d.value ? 30 + (d.value / max) * 70 : 18}%` }} />
      ))}
    </span>
  );
}

export function WeekChart({ bars, caption, height = 160 }) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  const total = bars.reduce((s, b) => s + b.value, 0);
  return (
    <figure className="chart" aria-label={translate(caption)}>
      <div className="chart-bars" style={{ height }} role="list">
        {bars.map((bar, i) => (
          <div key={i} className="chart-col" role="listitem" aria-label={`${translate(bar.label)}: ${bar.value}`}>
            <span className="chart-val">{bar.value > 0 ? bar.value : ''}</span>
            <span className={`chart-bar${bar.value === 0 ? ' zero' : ''}${bar.today ? ' today' : ''}`} style={{ height: `${Math.max(3, (bar.value / max) * 100)}%` }} />
            <span className="chart-label">{translate(bar.label)}</span>
          </div>
        ))}
      </div>
      <figcaption className="tiny muted">
        {translate(caption)}
        {total === 0 && ` · ${translate('No sessions yet')}`}
      </figcaption>
    </figure>
  );
}

export function ChildPicker({ list, value, onChange, label = 'Choose a child' }) {
  if (!list || list.length < 2) return null;
  return (
    <div className="child-picker" role="radiogroup" aria-label={translate(label)}>
      {list.map((c) => (
        <button key={c.id} type="button" role="radio" aria-checked={c.id === value} className={c.id === value ? 'on' : ''} onClick={() => onChange(c.id)}>
          <Avatar avatar={c.avatar} size={26} />
          <span>{c.name}</span>
        </button>
      ))}
    </div>
  );
}

export function MoreMenu({ label, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div className="more" ref={ref}>
      <button type="button" className="icon-btn" aria-haspopup="menu" aria-expanded={open} aria-label={translate(label)} title={translate(label)} onClick={() => setOpen(!open)}>
        <Icon name="dots-horizontal" size={20} />
      </button>
      {open && (
        <div className="menu" role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={item.danger ? 'danger' : ''}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
            >
              <Icon name={item.icon} size={18} />
              {translate(item.label)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PageHeading({ title, subtitle }) {
  return <PageHeader title={title} subtitle={subtitle} />;
}
