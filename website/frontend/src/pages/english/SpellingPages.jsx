// WORDS + SPELLING - (the app's WordsHubScreen, SpellingWordsScreen, SpellingGameScreen + SpellingBoard
// + SentenceBoard)
//   WordsHubPage       Reading Helper · Phonics · Spelling · Writing (only Spelling is built, as in the app)
//   SpellingWordsPage  the word list (picture or the child's buddy)
//   SpellingGamePage   1. drag the loose letters (the app's letter art) onto the grey letter shapes;
//                         wrong place = boing + wiggle home, 2 misses = the slot glows,
//                         3 misses = "Here, let me help." and it is placed for the child
//                      2. the picture pops out, the word is said, then the SENTENCE part:
//                         drag the 2 missing words into the sentence
//                      3. Again · Next word · All words.  Nothing is saved (as in the app).

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import { useUI } from '../../context/UIContext';
import { translate } from '../../i18n/translate';
import { getAlphabetItem } from './spellingHelpers';
import { SPELLING_WORDS, getSpellingWord, letterArt, nextSpellingWord } from '../../data/spellingWords';
import { shuffle } from '../../utils/misc';
import { cheer, playSound, speak, speakAsync } from '../../services/audio';
import { ChildTitle } from '../../layouts/Layouts';
import { Mascot, ChildInstruction } from '../../components/ui';
import Icon from '../../components/Icon';
import { Confetti, useDrag } from './common';

const ITEMS = [
  { title: 'Read Along', icon: '📖', tint: 'var(--blue-pale)', to: '/child/english/read' },
  { title: 'Reading Helper', icon: '👓', tint: 'var(--sage-pale)', to: null },
  { title: 'Phonics', icon: '🔊', tint: 'var(--yellow-pale)', to: null },
  { title: 'Spelling', icon: '🔤', tint: 'var(--purple-pale)', to: '/child/english/spell' },
  { title: 'Writing', icon: '✏️', tint: 'var(--orange-pale)', to: null },
];

// The app's WordsHubScreen: back · "English", "Pick a word activity", a 2-column grid of word activities.
export function WordsHubPage() {
  const navigate = useNavigate();
  const { isPreview } = useChild();
  const { alert } = useUI();
  return (
    <>
      <ChildTitle title="English" back="/child/english" />
      <ChildInstruction text="Pick a word activity" style={{ margin: '15px 0' }} />
      <div className="words-grid">
        {ITEMS.map((item, i) => (
          <button
            key={item.title}
            type="button"
            className="words-tile fade-up"
            style={{ background: item.tint, animationDelay: `${i * 70}ms` }}
            onClick={() => {
              playSound('pop');
              if (item.to) navigate(item.to);
              else alert({ title: item.title, message: 'This part is still being built. Check back soon!' });
            }}
          >
            <span className="emoji bob-few" style={{ fontSize: 44, animationDelay: `${400 + i * 200}ms` }}>{item.icon}</span>
            <span className="words-title">{translate(item.title)}</span>
            {isPreview && !item.to && <span className="soon-tag" style={{ marginTop: 8 }}>{translate('Coming soon')}</span>}
          </button>
        ))}
      </div>
    </>
  );
}

function WordPicture({ word, size = 110 }) {
  const { displayAvatar } = useChild();
  if (word.image) return <img src={word.image} alt="" style={{ height: size, width: size, objectFit: 'contain' }} />;
  if (word.emoji) return <span className="emoji" style={{ fontSize: size * 0.75 }} aria-hidden="true">{word.emoji}</span>;
  return <Mascot avatar={displayAvatar} size={size} alt="" />;
}

export function SpellingWordsPage() {
  const navigate = useNavigate();
  return (
    <>
      <ChildTitle title="Spelling" back="/child/english/words" speakText="Pick a word" />
      <ChildInstruction text="Pick a word" />
      <div className="kid-panel">
        <div className="tile-grid">
          {SPELLING_WORDS.map((word) => (
            <button key={word.id} type="button" className="pastel-tile" style={{ background: 'var(--cloud-white)', alignItems: 'center', minHeight: 170 }} onClick={() => { playSound('pop'); speak(word.sayAs); navigate(word.id); }}>
              <WordPicture word={word} size={90} />
              <span className="pt-title" style={{ fontSize: 22 }}>{word.word}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// One board: pieces (letters or words) to drag into slots. `items` = [{ id, label, art? }],
// `slots` = [{ id, label }] in order. A piece fits a slot with the same label.
function DragBoard({ slots, pieces, renderPiece, onPlaced, onFinished, sayPiece }) {
  const [filled, setFilled] = useState({}); // slotId -> pieceId
  const [misses, setMisses] = useState({}); // pieceId -> count
  const [wiggle, setWiggle] = useState(null);
  const [burstSlot, setBurstSlot] = useState(null);

  const used = Object.values(filled);
  const freeSlotFor = useCallback((piece) => slots.find((s) => s.label === piece.label && !filled[s.id]), [slots, filled]);

  const place = useCallback(
    (piece, slot) => {
      const next = { ...filled, [slot.id]: piece.id };
      setFilled(next);
      setBurstSlot(slot.id);
      playSound('sparkle');
      if (sayPiece) sayPiece(piece);
      if (onPlaced) onPlaced();
      if (Object.keys(next).length === slots.length) setTimeout(onFinished, 600);
    },
    [filled, slots.length, onFinished, onPlaced, sayPiece]
  );

  const drag = useDrag({
    onDrop: (pieceId, slotId) => {
      const piece = pieces.find((p) => p.id === pieceId);
      const slot = slots.find((s) => s.id === slotId);
      if (!piece || !slot || used.includes(pieceId)) return;
      if (!filled[slot.id] && slot.label === piece.label) return place(piece, slot);
      playSound('boing');
      setWiggle(`${pieceId}-${Date.now()}`);
      const count = (misses[pieceId] || 0) + 1;
      setMisses({ ...misses, [pieceId]: count });
      if (count >= 3) {
        const free = freeSlotFor(piece);
        if (free) {
          speak('Here, let me help.');
          setTimeout(() => place(piece, free), 600);
        }
      }
    },
  });

  const hintSlot = (slot) => pieces.some((p) => !used.includes(p.id) && (misses[p.id] || 0) >= 2 && p.label === slot.label && !filled[slot.id]);

  return (
    <>
      <div className="spell-slots" dir="ltr">
        {slots.map((slot) => {
          const pieceId = filled[slot.id];
          const piece = pieceId ? pieces.find((p) => p.id === pieceId) : null;
          return (
            <div key={slot.id} {...drag.targetProps(slot.id)} className={`spell-slot${piece ? ' filled' : ''}${hintSlot(slot) ? ' hint' : ''}${burstSlot === slot.id ? ' burst' : ''}${drag.picked && !piece ? ' ready' : ''}`}>
              {piece ? renderPiece(piece, false) : renderPiece({ ...slot, ghost: true }, true)}
            </div>
          );
        })}
      </div>
      <div className="spell-pieces" dir="ltr">
        {pieces.filter((p) => !used.includes(p.id)).map((piece) => (
          <div key={piece.id} {...drag.pieceProps(piece.id)} className={`spell-piece draggable${drag.picked === piece.id ? ' picked' : ''}${wiggle && wiggle.startsWith(`${piece.id}-`) ? ' wiggle' : ''}`} style={drag.style(piece.id)} aria-label={translate('Drag {letter}', { letter: piece.label })}>
            {renderPiece(piece, false)}
          </div>
        ))}
      </div>
      <p className="small-print center">{translate('Drag it, or tap it and then tap its place.')}</p>
    </>
  );
}

function LetterPiece({ piece, ghost }) {
  const src = letterArt(piece.label);
  if (!src) return <span className="word-piece">{piece.label}</span>;
  return <img src={src} alt={ghost ? '' : piece.label} className={`letter-art${ghost ? ' ghost' : ''}`} draggable={false} />;
}

export function SpellingGamePage() {
  const { wordId } = useParams();
  const navigate = useNavigate();
  const word = getSpellingWord(wordId);
  const [phase, setPhase] = useState('word'); // word | reveal | sentence | done
  const [burst, setBurst] = useState(0);
  const [round, setRound] = useState(0);

  const letterSlots = useMemo(() => word.word.split('').map((ch, i) => ({ id: `s${i}`, label: ch })), [word]);
  const letterPieces = useMemo(() => shuffle(word.word.split('').map((ch, i) => ({ id: `p${i}`, label: ch }))), [word, round]); // eslint-disable-line react-hooks/exhaustive-deps

  const sentenceWords = useMemo(() => word.sentence.text.replace(/\.$/, '').split(' '), [word]);
  const dragWords = word.sentence.drag;
  const sentenceSlots = useMemo(() => sentenceWords.map((w, i) => ({ id: `w${i}`, label: w, blank: dragWords.includes(w) })), [sentenceWords, dragWords]);
  const sentencePieces = useMemo(() => shuffle(dragWords.map((w, i) => ({ id: `d${i}`, label: w }))), [dragWords, round]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPhase('word');
    speakAsync(`Let's spell ${word.sayAs}!`);
  }, [word, round]);

  async function wordDone() {
    setPhase('reveal');
    setBurst((b) => b + 1);
    playSound('tada');
    await speakAsync(word.sayAs, { rate: 0.8 });
    cheer();
    setTimeout(() => {
      setPhase('sentence');
      speakAsync(word.sentence.sayAs || word.sentence.text);
    }, 1400);
  }

  function sentenceDone() {
    setBurst((b) => b + 1);
    playSound('cheerBell');
    speakAsync(word.sentence.sayAs || word.sentence.text).then(() => speak('Yaaay!'));
    setPhase('done');
  }

  const next = nextSpellingWord(word.id);

  return (
    <div className="spell-page">
      <Confetti burstKey={burst} />
      <ChildTitle title="Spelling" back="/child/english/spell" speakText={word.sayAs} />

      <div className={`spell-word-area${phase !== 'word' ? ' small' : ''}`}>
        <div className={`spell-picture${phase === 'reveal' ? ' pop' : ''}`} onClick={() => speak(word.sayAs)} role="button" tabIndex={0} aria-label={translate('Say the word')}>
          <WordPicture word={word} size={phase === 'reveal' ? 170 : 110} />
        </div>
        {phase === 'word' ? (
          <DragBoard
            key={`w${round}`}
            slots={letterSlots}
            pieces={letterPieces}
            renderPiece={(piece, ghost) => <LetterPiece piece={piece} ghost={ghost} />}
            sayPiece={(piece) => {
              const item = getAlphabetItem(piece.label);
              if (item) speak(item.nameSpeech);
            }}
            onFinished={wordDone}
          />
        ) : (
          <div className="spell-solid" dir="ltr" onClick={() => speak(word.sayAs)}>
            {word.word.split('').map((ch, i) => <LetterPiece key={i} piece={{ label: ch }} />)}
          </div>
        )}
      </div>

      {(phase === 'sentence' || phase === 'done') && (
        <div className="sentence-area">
          {phase === 'sentence' ? (
            <SentenceBoard slots={sentenceSlots} pieces={sentencePieces} onFinished={sentenceDone} />
          ) : (
            <p className="sentence-done" dir="ltr">{word.sentence.text}</p>
          )}
        </div>
      )}

      {phase === 'done' && (
        <div className="result-actions">
          <button type="button" className="icon-button big" onClick={() => setRound((r) => r + 1)} aria-label={translate('Play again')}>
            <Icon name="refresh" size={34} />
          </button>
          <button type="button" className="icon-button big" onClick={() => navigate(`/child/english/spell/${next.id}`)} aria-label={translate('Next word')}>
            <Icon name="arrow-right" size={34} />
          </button>
          <button type="button" className="icon-button big" onClick={() => navigate('/child/english/spell')} aria-label={translate('All words')}>
            <Icon name="view-grid" size={34} />
          </button>
        </div>
      )}
    </div>
  );
}

// The sentence with its blanks: fixed words are written, blanks take the dragged words.
function SentenceBoard({ slots, pieces, onFinished }) {
  const blanks = slots.filter((s) => s.blank);
  const [done, setDone] = useState(false);
  return (
    <div className="sentence-board">
      <SentenceInner
        slots={slots}
        blanks={blanks}
        pieces={pieces}
        onFinished={() => {
          if (!done) {
            setDone(true);
            onFinished();
          }
        }}
      />
    </div>
  );
}

function SentenceInner({ slots, blanks, pieces, onFinished }) {
  const [filled, setFilled] = useState({});
  const [misses, setMisses] = useState({});
  const [wiggle, setWiggle] = useState(null);
  const used = Object.values(filled);

  const place = (piece, slot) => {
    const next = { ...filled, [slot.id]: piece.id };
    setFilled(next);
    playSound('sparkle');
    speak(piece.label);
    if (Object.keys(next).length === blanks.length) setTimeout(onFinished, 500);
  };

  const drag = useDrag({
    onDrop: (pieceId, slotId) => {
      const piece = pieces.find((p) => p.id === pieceId);
      const slot = blanks.find((s) => s.id === slotId);
      if (!piece || !slot || used.includes(pieceId)) return;
      if (!filled[slot.id] && slot.label === piece.label) return place(piece, slot);
      playSound('boing');
      setWiggle(`${pieceId}-${Date.now()}`);
      const count = (misses[pieceId] || 0) + 1;
      setMisses({ ...misses, [pieceId]: count });
      if (count >= 3) {
        const free = blanks.find((s) => s.label === piece.label && !filled[s.id]);
        if (free) {
          speak('Here, let me help.');
          setTimeout(() => place(piece, free), 600);
        }
      }
    },
  });

  return (
    <>
      <p className="sentence-line" dir="ltr">
        {slots.map((slot) =>
          slot.blank ? (
            <span key={slot.id} {...drag.targetProps(slot.id)} className={`sentence-blank${filled[slot.id] ? ' filled' : ''}${drag.picked && !filled[slot.id] ? ' ready' : ''}`}>
              {filled[slot.id] ? slot.label : ' '}
            </span>
          ) : (
            <span key={slot.id} className="sentence-word">{slot.label}</span>
          )
        )}
        <span className="sentence-word">.</span>
      </p>
      <div className="spell-pieces" dir="ltr">
        {pieces.filter((p) => !used.includes(p.id)).map((piece) => (
          <div key={piece.id} {...drag.pieceProps(piece.id)} className={`word-piece draggable${drag.picked === piece.id ? ' picked' : ''}${wiggle && wiggle.startsWith(`${piece.id}-`) ? ' wiggle' : ''}`} style={drag.style(piece.id)} aria-label={translate('Drag {letter}', { letter: piece.label })}>
            {piece.label}
          </div>
        ))}
      </div>
    </>
  );
}
