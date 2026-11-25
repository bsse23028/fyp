// CHILD HOME - the Figma Child Home, with the mobile app's behaviour:
//   left   the greeting panel ("Good morning, Zara! What shall we practise?", spoken once), the buddy (tap = it
//          talks, "My Buddy" = change it) and today's stars (tap the stars for a small note)
//   right  "What shall we learn?": the six learning GROUPS of the FYP proposal (utils/modules.js), ONLY those with an
//          activity the parent switched on for this child (none on = "No activities yet. Ask a grown-up to switch some on.")
// A tile opens its module (Reading & Writing -> the English hub, Talk -> the AAC board) or its group page. A group with
// nothing built yet wobbles shyly and the buddy says "Coming soon!". There is no quick-start row: every activity has ONE way in.
// Tapping the buddy's speech bubble only reads the greeting aloud. Nothing on this screen is saved.

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import { useLanguage } from '../../context/LanguageContext';
import { translate } from '../../i18n/translate';
import { getGreeting } from '../../utils/misc';
import { starsToday } from '../../utils/progress';
import { groupIsBuilt, groupTarget, visibleGroups } from '../../utils/modules';
import { playSound, speakUi } from '../../services/audio';
import { Mascot, SpeakButton } from '../../components/ui';
import Icon from '../../components/Icon';
import NothingOn from './NothingOn';

export default function ChildHomePage() {
  const { activeChild } = useChild();
  useLanguage();
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [line, setLine] = useState(null);
  const [shy, setShy] = useState({ id: null, key: 0 });
  const [starsOpen, setStarsOpen] = useState(false);
  const timer = useRef(null);

  const name = activeChild ? activeChild.name : 'friend';
  const greeting = getGreeting(now);
  const greetingKey = greeting.text.replace('!', ', {name}!');
  const filled = Math.min(5, starsToday(activeChild, now));
  // Only the groups with an activity the parent switched on for this child (child.modules from the server).
  // built groups first, the "Soon" ones last (R12 of the website audit)
  const groups = [...visibleGroups(activeChild)].sort((a, b) => Number(!groupIsBuilt(a)) - Number(!groupIsBuilt(b)));

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 60000);
    const hello = setTimeout(() => speakUi(greetingKey, { name }), 1200);
    return () => {
      clearInterval(clock);
      clearTimeout(hello);
      clearTimeout(timer.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function openGroup(group) {
    if (!groupIsBuilt(group)) {
      playSound('boing');
      setShy((s) => ({ id: group.id, key: s.key + 1 }));
      setLine('Coming soon!');
      speakUi('Coming soon!');
      return;
    }
    playSound('pop');
    setLine(group.label);
    speakUi(group.label);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => navigate(groupTarget(group)), 250); // a moment later, so the buddy's word is heard
  }

  return (
    <main className="screen child kid-home" id="main" onClick={() => setStarsOpen(false)}>
      <div className="kh-grid">
        <section className="kh-greet">
          <div className="kh-bubble" key={line || 'greeting'}>
            <SpeakButton compact onClick={() => speakUi(line ? line : `${translate(greetingKey, { name })} ${translate('What shall we practise?')}`)} />
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
              setStarsOpen(!starsOpen);
            }}
            aria-label={translate('{n} of {total} stars', { n: filled, total: 5 })}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={n <= filled ? 'lit' : ''} aria-hidden="true">★</span>
            ))}
            <span className="count">{translate('Stars today')}</span>
          </button>
          {starsOpen && <p className="kh-pop" role="status" onClick={(e) => e.stopPropagation()}>{translate('A little glow for every try')}</p>}
        </section>

        <div className="kh-content">
          <h2 className="kh-title">{translate('What shall we learn?')}</h2>
          <div className="kh-modules">
            {groups.length === 0 && <NothingOn />}
            {groups.map((group, i) => {
              const built = groupIsBuilt(group);
              return (
                <button
                  key={group.id + (shy.id === group.id ? shy.key : '')}
                  type="button"
                  className={`kh-module ${group.tone}${built ? '' : ' soon'}${shy.id === group.id ? ' shy' : ''}`}
                  style={{ animationDelay: shy.id === group.id ? '0ms' : `${i * 60}ms` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openGroup(group);
                  }}
                >
                  <span className="kh-module-ico"><Icon name={group.icon} size={42} /></span>
                  <strong>{translate(group.label)}</strong>
                  {!built && <span className="soon-tag">{translate('Soon')}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
