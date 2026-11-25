// KID TILE - one big tile of a Child Mode hub (the group page, the English hub, an activities page):
// a tinted icon, the title, a short line. Not built yet = a muted tile with a "Soon" badge inside it (R12).
// <KidTile icon="draw" tone="berry" title="Handwriting" subtitle="..." soon onClick />

import { translate } from '../i18n/translate';
import Icon from './Icon';

export default function KidTile({ icon, tone = 'blue', title, subtitle, soon = false, onClick, index = 0 }) {
  return (
    <button type="button" className={`ktile ${tone}${soon ? ' soon' : ''}`} style={{ animationDelay: `${index * 60}ms` }} onClick={onClick}>
      <span className="ktile-ico"><Icon name={icon} size={36} /></span>
      <span className="ktile-text">
        <strong>{translate(title)}</strong>
        {subtitle && <small>{translate(subtitle)}</small>}
        {soon && <span className="soon-tag">{translate('Soon')}</span>}
      </span>
    </button>
  );
}
