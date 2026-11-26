// TALK BOARD (AAC) - "Talk": the child taps pictures to say what they want (AAC = Augmentative and Alternative
// Communication). The same board as the mobile app's Talk module (src/modules/talk), built like the boards speech
// therapists use worldwide (TD Snap Core First, Proloquo2Go, TouchChat WordPower):
//   * top      the SENTENCE STRIP: the picked words in order + Speak, delete-last and clear
//   * quick    yes · no · please · thank you · wait · toilet, ALWAYS on screen
//   * switch   "Core words" | "Topics", and the size switch: BIG buttons (3 pages of 16, arrows / swipe) or ALL words (6 x 8)
//   * board    the CORE words (they never move: motor planning), or the 13 TOPIC folders; a folder opens its 12 pictures
// Every button has its word-type colour (Fitzgerald Key). A tap speaks the word at once and adds it to the strip; Speak says
// the whole sentence. In Urdu the words and the voice are Urdu, but every word keeps its place (the board is not mirrored).
// The size choice is remembered in this browser. Words, colours, pictures: data/aacWords.js. Nothing else is saved.

import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import { activityOn } from '../../utils/modules';
import { translate } from '../../i18n/translate';
import { getCurrentLanguage } from '../../i18n/translate';
import { useLanguage } from '../../context/LanguageContext';
import { say, stopSpeaking } from '../../services/audio';
import { KEYS, loadData, saveData } from '../../utils/misc';
import { BIG_COLUMNS, CORE, CORE_BIG_PAGES, CORE_COLUMNS, FOLDER_COLUMNS, QUICK, TOPICS, TOPIC_COLUMNS, WORD_TYPES, symbolFor } from '../../data/aacWords';
import { SegmentedControl } from '../../components/ui';
import { ChildTitle } from '../../layouts/Layouts';
import Icon from '../../components/Icon';

// every number of the board
const AAC = {
  MAX_WORDS: 12, // the most words the strip keeps (older words are dropped)
  START_BIG: true, // the board opens with BIG buttons (3 pages); the child / parent can switch to all words
  SPEAK_ON_TAP: true, // a word is spoken as soon as it is tapped (most AAC apps do this)
  RATE: 0.8, // speaking speed (1 = normal)
  SWIPE: 50, // pixels a swipe must move to turn a Big page
};

const VIEWS = [
  { id: 'core', label: 'Core words' },
  { id: 'topics', label: 'Topics' },
];

// Say some words in the language the site is in (each word translated on its own).
function sayWords(words) {
  const urdu = getCurrentLanguage() === 'ur';
  say(words.map((item) => translate(item.word)).join(' '), { lang: urdu ? 'ur-PK' : 'en-US', rate: AAC.RATE });
}

function Picture({ item, className }) {
  const src = symbolFor(item);
  if (!src) return <span className={`${className} no-pic`} aria-hidden="true" />;
  return <img className={className} src={src} alt="" draggable={false} loading="lazy" />;
}

function WordButton({ item, big, onPick }) {
  const type = WORD_TYPES[item.type] || WORD_TYPES.people;
  return (
    <button type="button" className={`aac-word${big ? ' big' : ''}`} style={{ background: type.fill, borderColor: type.edge }} onClick={() => onPick(item)}>
      <Picture item={item} className="aac-pic" />
      <span className="aac-label">{translate(item.word)}</span>
    </button>
  );
}

function SentenceStrip({ words, onSpeak, onDeleteLast, onClear }) {
  const end = useRef(null);
  useEffect(() => {
    if (end.current) end.current.scrollLeft = end.current.scrollWidth; // always show the newest word
  }, [words.length]);
  const empty = words.length === 0;
  return (
    <div className="aac-strip">
      <div className="aac-strip-words" ref={end} role="button" tabIndex={0} aria-label={translate('Say the sentence')} onClick={() => !empty && onSpeak()} onKeyDown={(e) => e.key === 'Enter' && !empty && onSpeak()}>
        {empty ? (
          <span className="aac-hint">{translate('Tap pictures to make a sentence')}</span>
        ) : (
          words.map((item, i) => {
            const type = WORD_TYPES[item.type] || WORD_TYPES.people;
            return (
              <span key={`${item.word}-${i}`} className="aac-chip" style={{ background: type.fill, borderColor: type.edge }}>
                <Picture item={item} className="aac-chip-pic" />
                {translate(item.word)}
              </span>
            );
          })
        )}
      </div>
      <div className="aac-strip-small">
        <button type="button" disabled={empty} onClick={onDeleteLast} aria-label={translate('Delete the last word')} title={translate('Delete the last word')}>
          <Icon name="backspace-outline" size={22} />
        </button>
        <button type="button" disabled={empty} onClick={onClear} aria-label={translate('Clear all words')} title={translate('Clear all words')}>
          <Icon name="close" size={22} />
        </button>
      </div>
      <button type="button" className="aac-speak" disabled={empty} onClick={onSpeak} aria-label={translate('Speak')}>
        <Icon name="volume-high" size={30} />
      </button>
    </div>
  );
}

export default function TalkBoardPage() {
  useLanguage();
  const { activeChild } = useChild();
  const allowed = activityOn(activeChild, 9); // the AAC Talk Board must be switched on for this child
  const [sentence, setSentence] = useState([]);
  const [view, setView] = useState('core');
  const [big, setBig] = useState(() => loadData(KEYS.aacBig, AAC.START_BIG));
  const [page, setPage] = useState(0); // the Big core page (0-2)
  const [folder, setFolder] = useState(null); // the open topic folder
  const touchX = useRef(null);

  useEffect(() => () => stopSpeaking(), []); // stop talking when the child leaves the board
  if (!allowed) return <Navigate to="/child" replace />;

  function pick(item) {
    if (AAC.SPEAK_ON_TAP) sayWords([item]);
    setSentence((old) => [...old, item].slice(-AAC.MAX_WORDS));
  }
  function switchSize() {
    setBig(!big);
    saveData(KEYS.aacBig, !big);
  }
  const goToPage = (next) => setPage(Math.max(0, Math.min(CORE_BIG_PAGES.length - 1, next)));
  const swipe = (x) => {
    if (touchX.current === null) return;
    const dx = x - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) >= AAC.SWIPE) goToPage(page + (dx < 0 ? 1 : -1));
  };

  const coreBig = view === 'core' && big;
  let words = null;
  let columns = TOPIC_COLUMNS;
  if (view === 'core') {
    words = big ? CORE_BIG_PAGES[page] : CORE;
    columns = big ? BIG_COLUMNS : CORE_COLUMNS;
  } else if (folder) {
    words = folder.words;
  }

  return (
    <main className="screen child aac" id="main">
      <div className="screen-inner">
        <ChildTitle title="Talk" back="/child" speakText="Talk. Tap pictures to speak." />

        <SentenceStrip
          words={sentence}
          onSpeak={() => sayWords(sentence)}
          onDeleteLast={() => setSentence((old) => old.slice(0, -1))}
          onClear={() => {
            stopSpeaking();
            setSentence([]);
          }}
        />

        <div className="aac-quick" dir="ltr">
          {QUICK.map((item) => (
            <WordButton key={item.word} item={item} onPick={pick} />
          ))}
        </div>

        <div className="aac-switch">
          <SegmentedControl
            options={VIEWS}
            value={view}
            onChange={(id) => {
              setView(id);
              setFolder(null);
            }}
            label="Board"
          />
          {view === 'core' && (
            <button type="button" className="aac-size" onClick={switchSize} aria-label={translate(big ? 'Show all words' : 'Show big buttons')}>
              <Icon name={big ? 'view-grid' : 'magnify-plus-outline'} size={20} />
              {translate(big ? 'All' : 'Big')}
            </button>
          )}
        </div>

        {coreBig && (
          <div className="aac-bar">
            <button type="button" className="aac-round" onClick={() => goToPage(page - 1)} disabled={page === 0} aria-label={translate('Previous page')}>
              <Icon name="chevron-left" size={24} />
            </button>
            <div className="aac-dots" aria-hidden="true">
              {CORE_BIG_PAGES.map((_, i) => (
                <i key={i} className={i === page ? 'on' : ''} />
              ))}
            </div>
            <button type="button" className="aac-round" onClick={() => goToPage(page + 1)} disabled={page === CORE_BIG_PAGES.length - 1} aria-label={translate('Next page')}>
              <Icon name="chevron-right" size={24} />
            </button>
          </div>
        )}
        {view === 'topics' && folder && (
          <div className="aac-bar">
            <button type="button" className="aac-round" onClick={() => setFolder(null)} aria-label={translate('All topics')}>
              <Icon name="arrow-left" size={24} />
            </button>
            <strong className="aac-folder-name">{translate(folder.title)}</strong>
            <span className="aac-round-space" />
          </div>
        )}

        <div
          className={`aac-board${coreBig ? ' paged' : ''}`}
          dir="ltr"
          style={{ '--cols': words ? columns : FOLDER_COLUMNS }}
          onTouchStart={(e) => coreBig && (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => coreBig && swipe(e.changedTouches[0].clientX)}
        >
          {words
            ? words.map((item, i) => <WordButton key={`${item.word}-${i}`} item={item} big={columns <= BIG_COLUMNS} onPick={pick} />)
            : TOPICS.map((topic) => {
                const type = WORD_TYPES[topic.accent] || WORD_TYPES.thing;
                return (
                  <button key={topic.id} type="button" className="aac-folder" style={{ background: type.fill, borderColor: type.edge }} onClick={() => setFolder(topic)}>
                    <Picture item={{ word: topic.title, pic: topic.icon }} className="aac-pic" />
                    <span className="aac-label">{translate(topic.title)}</span>
                  </button>
                );
              })}
        </div>
      </div>
    </main>
  );
}
