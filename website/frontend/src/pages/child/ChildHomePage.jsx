// CHILD HOME - the Figma Child Home: on the left the greeting panel ("Good morning, Zara! What shall we
// practise?", spoken once), the buddy (tap = it talks, "My Buddy" = change it) and today's stars; on the right
// six big module tiles and the quick-start row: Alphabets (glows while letters are in progress), Words,
// Sentences. Only English is built; the others wobble and the buddy says "Coming soon!".

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import { useLanguage } from '../../context/LanguageContext';
import { translate } from '../../i18n/translate';
import { getGreeting } from '../../utils/misc';
import { starsToday } from '../../utils/progress';
import { playSound, speakUi } from '../../services/audio';
import { Mascot, SpeakButton } from '../../components/ui';
import Icon from '../../components/Icon';
import { ENGLISH_SECTIONS, HOME_AREAS, isOn } from '../../utils/modules';
import NothingOn from './NothingOn';

const MODULES = [
  { id: 'english', label: 'English', tone: 'blue', icon: 'book-open-variant', path: '/child/english' },
  { id: 'numbers', label: 'Numbers', tone: 'gold', icon: 'numeric', path: null },
  { id: 'feelings', label: 'Feelings', tone: 'coral', icon: 'heart-outline', path: null },
  { id: 'talk', label: 'Talk', tone: 'sage', icon: 'chat-outline', path: null },
  { id: 'myday', label: 'My Day', tone: 'purple', icon: 'format-list-checks', path: null },
  { id: 'sounds', label: 'Sounds', tone: 'sky', icon: 'volume-high', path: null },
];

const QUICK_START = [
  { id: 'alphabets', section: 'alphabet', label: 'Alphabets', area: 'English', icon: 'alphabetical', path: '/child/english/alphabet' },
  { id: 'words', section: 'words', label: 'Words', area: 'English', icon: 'format-letter-case', path: '/child/english/words' },
  { id: 'sentences', section: 'read', label: 'Sentences', area: 'Read Along', icon: 'book-open-page-variant-outline', path: '/child/english/read' },
];

export default function ChildHomePage() {
  const { activeChild, alphabetProgress } = useChild();
  useLanguage();
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [line, setLine] = useState(null);
  const [shy, setShy] = useState({ id: null, key: 0 });
  const [openCard, setOpenCard] = useState(null);
  const [hop, setHop] = useState(null);
  const timer = useRef(null);

  const name = activeChild ? activeChild.name : 'friend';
  const greeting = getGreeting(now);
  const greetingKey = greeting.text.replace('!', ', {name}!');
  const filled = Math.min(5, starsToday(activeChild, now));
  const letters = alphabetProgress(activeChild ? activeChild.id : null).done;
  // Only what the parent switched on for this child (child.modules from the server).
  const modules = MODULES.filter((m) => isOn(activeChild, HOME_AREAS[m.id]));
  const quick = QUICK_START.filter((q) => isOn(activeChild, ENGLISH_SECTIONS[q.section]));

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 60000);
    const hello = setTimeout(() => speakUi(greetingKey, { name }), 1200);
    return () => {
      clearInterval(clock);
      clearTimeout(hello);
      clearTimeout(timer.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function go(path, delay, label) {
    playSound('pop');
    if (label) {
      setLine(label);
      speakUi(label);
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => navigate(path), delay);
  }

  function openModule(module) {
    if (!module.path) {
      playSound('boing');
      setShy((s) => ({ id: module.id, key: s.key + 1 }));
      setLine('Coming soon!');
      speakUi('Coming soon!');
      return;
    }
    go(module.path, 250, module.label);
  }

  return (
    <main className="screen child kid-home" id="main" onClick={() => setOpenCard(null)}>
      <div className="kh-grid">
        <section className="kh-greet">
          <div className="kh-bubble" key={line || 'greeting'}>
            <SpeakButton compact onClick={() => speakUi(line ? translate(line) : `${translate(greetingKey, { name })} ${translate('What shall we practise?')}`)} />
            <h1>{line ? translate(line) : translate(greetingKey, { name })}</h1>
            {!line && <p>{translate('What shall we practise?')}</p>}
          </div>
          <button
            type="button"
            className="kh-buddy"
            onClick={(e) => {
              e.stopPropagation();
              playSound('giggle');
              setLine('Hey! I am your buddy!');
              speakUi('Hey! I am your buddy!');
            }}
            onDoubleClick={() => navigate('/child/buddy')}
            aria-label={translate('My Buddy')}
          >
            <Mascot size={190} bob alt="" />
          </button>
          <button type="button" className="kh-buddy-label" onClick={() => navigate('/child/buddy')}>{translate('My Buddy')}</button>
          <button
            type="button"
            className="kh-stars"
            onClick={(e) => {
              e.stopPropagation();
              setOpenCard(openCard === 'stars' ? null : 'stars');
            }}
            aria-label={translate('{n} of {total} stars', { n: filled, total: 5 })}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={n <= filled ? 'lit' : ''} aria-hidden="true">★</span>
            ))}
            <span className="count">{translate('Stars today')}</span>
          </button>
          {openCard === 'stars' && (
            <p className="kh-pop" role="status" onClick={(e) => e.stopPropagation()}>{translate('A little glow for every try')}</p>
          )}
        </section>

        <div className="kh-content">
          <div className="kh-modules">
            {modules.length === 0 && <NothingOn />}
            {modules.map((module, i) => (
              <button
                key={module.id + (shy.id === module.id ? shy.key : '')}
                type="button"
                className={`kh-module ${module.tone}${module.path ? '' : ' soon'}${shy.id === module.id ? ' shy' : ''}`}
                style={{ animationDelay: shy.id === module.id ? '0ms' : `${i * 60}ms` }}
                onClick={(e) => {
                  e.stopPropagation();
                  openModule(module);
                }}
              >
                <span className="kh-module-ico"><Icon name={module.icon} size={42} /></span>
                <strong>{translate(module.label)}</strong>
                {!module.path && <span className="soon-tag">{translate('Coming soon')}</span>}
              </button>
            ))}
          </div>

          {quick.length > 0 && (
          <section className="kh-picks">
            <h2><Icon name="star" size={22} />{translate('Quick start')}</h2>
            <div>
              {quick.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${item.id === 'alphabets' && letters > 0 && letters < 26 ? 'glow' : ''}${hop === item.id ? ' hop-once' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setHop(item.id);
                    go(item.path, 220);
                  }}
                >
                  <span><Icon name={item.icon} size={28} /></span>
                  <div>
                    <small>{translate(item.area)}</small>
                    <strong>{translate(item.label)}</strong>
                  </div>
                  <Icon name="chevron-right" size={24} className="ico flip-rtl" />
                </button>
              ))}
            </div>
          </section>
          )}
        </div>
      </div>
    </main>
  );
}
