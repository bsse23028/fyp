// ENGLISH HUB - exactly like the app's EnglishHubScreen (on the sunny sky): back · "English" · 🔊,
// the buddy asking "What do you want to learn?", and one row tile per section:
// 🔤 Alphabets · ✏️ Trace letters · 🎮 Letter games · 🎬 Letter stories · 🧩 Words · 📖 Sentences.
// Only the sections whose activity the parent switched on for this child are shown (utils/modules.js).

import { useNavigate } from 'react-router-dom';
import { translate } from '../../i18n/translate';
import { playSound, speakUi } from '../../services/audio';
import { ChildTitle } from '../../layouts/Layouts';
import { Mascot } from '../../components/ui';
import { useChild } from '../../context/ChildContext';
import { ENGLISH_SECTIONS, isOn } from '../../utils/modules';
import NothingOn from '../child/NothingOn';

const GREETING = 'What do you want to learn?';
const A = [
  { pale: '#E2F1F1' }, { pale: '#E3F2FA' }, { pale: '#FCE7DF' }, { pale: '#FDF3D6' }, { pale: '#E5F1E3' }, { pale: '#ECE8F8' },
];

export const HUB_SECTIONS = [
  { title: 'Alphabets', subtitle: 'Letters and their sounds', icon: '🔤', to: 'alphabet', accent: A[0] },
  { title: 'Trace letters', subtitle: 'Draw letters with your finger', icon: '✏️', to: 'trace', accent: A[2] },
  { title: 'Letter games', subtitle: 'Bubble pop and matching', icon: '🎮', to: 'games', accent: A[5] },
  { title: 'Letter stories', subtitle: 'Watch a letter come alive', icon: '🎬', to: 'stories', accent: A[3] },
  { title: 'Words', subtitle: 'Read and match words', icon: '🧩', to: 'words', accent: A[3] },
  { title: 'Sentences', subtitle: 'Read Along stories', icon: '📖', to: 'read', accent: A[1] },
];

// One big row tile: a white rounded square with the emoji, then the title + subtitle.
export function HubTile({ icon, title, subtitle, color, onClick, index = 0, soon = false }) {
  return (
    <button type="button" className="hub-tile fade-up" style={{ '--tint': color, animationDelay: `${(index + 1) * 70}ms` }} onClick={onClick}>
      <span className="hub-icon">
        <span className="emoji bob-few" style={{ animationDelay: `${500 + index * 250}ms` }}>{icon}</span>
      </span>
      <span className="hub-text">
        <span className="hub-title">{translate(title)}</span>
        <span className="hub-subtitle">{translate(subtitle)}</span>
        {soon && <span className="soon-tag" style={{ marginTop: 6 }}>{translate('Coming soon')}</span>}
      </span>
    </button>
  );
}

export default function EnglishHubPage() {
  const navigate = useNavigate();
  const { activeChild } = useChild();
  const sections = HUB_SECTIONS.filter((section) => isOn(activeChild, ENGLISH_SECTIONS[section.to] || []));
  return (
    <>
      <ChildTitle title="English" back="/child" speakText={GREETING} />
      <div className="buddy-ask">
        <Mascot size={84} bob alt="" />
        <div className="buddy-ask-bubble">{translate(GREETING)}</div>
      </div>
      {sections.length === 0 && <NothingOn />}
      {sections.map((section, i) => (
        <HubTile
          key={section.title}
          index={i}
          icon={section.icon}
          title={section.title}
          subtitle={section.subtitle}
          color={section.accent.pale}
          onClick={() => {
            playSound('pop');
            speakUi(section.title);
            navigate(section.to);
          }}
        />
      ))}
    </>
  );
}
