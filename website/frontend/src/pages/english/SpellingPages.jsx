// SPELLING - (the app's SpellingWordsScreen, SpellingGameScreen + SpellingBoard + SentenceBoard). Opened from
// Reading & Writing -> Spelling & Letter Sounds -> Spelling.
//   SpellingWordsPage  the word list (picture or the child's buddy)
//   SpellingGamePage   the app's SpellingBoard rules:
//                      1. "Let's spell this word!" + the word. Drag the loose letters onto the grey letter shapes.
//                         Holding a letter plays its sound and repeats it (let go = it stops). A right place
//                         says the letter NAME; a wrong place = boing + wiggle home (no voice), 2 misses = the
//                         slot glows, 3 misses = "Here, let me help." and it goes there by itself
//                      2. every letter in: the letters hop one by one with their names, the picture pops out,
//                         the word is read, the word turns one colour, the picture sits on it, the word bounces
//                         twice + a bell + "Yaaay!"
//                      3. "Now finish the sentence!": drag the 2 missing words in (holding one says it); then
//                         the sentence is read, it bounces, a bell + "Yaaay!"
//                      4. Play again · Next word · All words.  Nothing is saved (as in the app).

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import { getCurrentLanguage, translate } from '../../i18n/translate';
import { getAlphabetItem } from './spellingHelpers';
import { SPELLING_WORDS, getSpellingWord, letterArt, nextSpellingWord } from '../../data/spellingWords';
import { shuffle } from '../../utils/misc';
import { playSound, say, speak, speakAsync, speakUi, speakUiAsync, startHoldSound, stopHoldSound, stopSpeaking } from '../../services/audio';
import { ChildTitle } from '../../layouts/Layouts';
import { Mascot, ChildInstruction } from '../../components/ui';
import Icon from '../../components/Icon';
import { Confetti, useDrag } from './common';

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
      <ChildTitle title="Spelling" back="/child/english/activities/4" speakText="Pick a word" />
      <ChildInstruction text="Pick a word" />
      <div className="kid-panel">
        <div className="tile-grid">
          {SPELLING_WORDS.map((word) => (
            <button key={word.id} type="button" className="pastel-tile" style={{ background: 'var(--surface)', alignItems: 'center', minHeight: 170 }} onClick={() => { playSound('pop'); speak(word.sayAs); navigate(word.id); }}>
              <WordPicture word={word} size={90} />
              <span className="pt-title" style={{ fontSize: 22 }}>{word.word}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// the numbers of the app's spellingConfig.js
const HINT_AFTER_MISSES = 2;
const HELP_AFTER_MISSES = 3;
const HELP_DELAY = 1100;
const HOLD_GAP_MS = 700;
const HOLD_MAX_REPEATS = 8;
const HOLD_WORD_AFTER = 1500; // sentence: a held word is said once more after this long
const FINISH_DELAY = 500;
const LETTER_GAP = 150;
const SOLID_TIME = 380;
const WORD_BOUNCES = 2;
const WORD_BOUNCE_GAP = 520;
const SENTENCE_DELAY = 1500;
const SENTENCE_READ_DELAY = 500;
const BUTTONS_DELAY = 900;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// One board: pieces (letters or words) to drag into slots. A piece fits a FREE slot with the same label.
//   onGrab(piece) / onRelease()  picked up / let go (the hold sound)
//   sayPiece(piece)              said when it lands
//   onFinished()                 every slot is filled
// The parent can make a slot hop (`hop` = slot id + counter) and the whole word bounce (`bounceKey`).
function useBoard({ slots, pieces, sayPiece, onGrab, onRelease, onFinished }) {
  const [filled, setFilled] = useState({}); // slotId -> pieceId
  const [hints, setHints] = useState({}); // slotId -> true
  const [wiggle, setWiggle] = useState(null);
  const [burstSlot, setBurstSlot] = useState(null);
  const [busy, setBusy] = useState(false);
  const filledRef = useRef({});
  const misses = useRef({});
  const timers = useRef([]);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      timers.current.forEach(clearTimeout);
    };
  }, []);
  const later = (fn, ms) => timers.current.push(setTimeout(() => alive.current && fn(), ms));

  const freeSlotFor = (piece) => slots.find((s) => s.label === piece.label && !filledRef.current[s.id]);

  function place(piece, slot) {
    filledRef.current = { ...filledRef.current, [slot.id]: piece.id };
    setFilled(filledRef.current);
    setHints((h) => ({ ...h, [slot.id]: false }));
    setBurstSlot(`${slot.id}-${Date.now()}`);
    playSound('sparkle');
    if (sayPiece) sayPiece(piece);
    if (Object.keys(filledRef.current).length === slots.length) later(onFinished, FINISH_DELAY);
  }

  const drag = useDrag({
    onGrab: (pieceId) => {
      const piece = pieces.find((p) => p.id === pieceId);
      if (piece && onGrab) onGrab(piece);
    },
    onRelease: () => onRelease && onRelease(),
    onDrop: (pieceId, slotId) => {
      if (busy) return;
      const piece = pieces.find((p) => p.id === pieceId);
      const slot = slots.find((s) => s.id === slotId);
      if (!piece || !slot || Object.values(filledRef.current).includes(pieceId) || filledRef.current[slot.id]) return;
      if (slot.label === piece.label) return place(piece, slot);
      // a wrong try: only something to SEE (boing + wiggle); help grows with the tries
      playSound('boing');
      setWiggle(`${pieceId}-${Date.now()}`);
      const tries = (misses.current[pieceId] || 0) + 1;
      misses.current[pieceId] = tries;
      const right = freeSlotFor(piece);
      if (!right) return;
      if (tries >= HINT_AFTER_MISSES) setHints((h) => ({ ...h, [right.id]: true }));
      if (tries >= HELP_AFTER_MISSES) {
        setBusy(true);
        speakUi('Here, let me help.');
        later(() => {
          setBusy(false);
          const free = freeSlotFor(piece);
          if (free) place(piece, free);
        }, HELP_DELAY);
      }
    },
  });

  const used = Object.values(filled);
  return { drag, filled, hints, wiggle, burstSlot, used, left: pieces.filter((p) => !used.includes(p.id)) };
}

function LetterPiece({ piece, ghost }) {
  const src = letterArt(piece.label);
  if (!src) return <span className="word-piece">{piece.label}</span>;
  return <img src={src} alt={ghost ? '' : piece.label} className={`letter-art${ghost ? ' ghost' : ''}`} draggable={false} />;
}

// PART 1: the word
function WordBoard({ word, round, onCelebrate, onWordDone }) {
  const slots = useMemo(() => word.word.split('').map((ch, i) => ({ id: `s${i}`, label: ch, index: i })), [word]);
  const pieces = useMemo(() => shuffle(word.word.split('').map((ch, i) => ({ id: `p${i}`, label: ch }))), [word, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [hop, setHop] = useState(null); // `${slotId}-${n}`
  const [bounce, setBounce] = useState(0);
  const [stage, setStage] = useState('play'); // play | parade | out | solid
  const alive = useRef(true);
  const introPending = useRef(true);

  useEffect(() => {
    alive.current = true;
    // the word is said after the opening line, unless the child already picked up a letter
    speakUiAsync("Let's spell this word!").then(() => {
      if (alive.current && introPending.current) speak(word.sayAs);
      introPending.current = false;
    });
    return () => {
      alive.current = false;
      stopHoldSound();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function finish() {
    setStage('parade');
    for (const slot of slots) {
      if (!alive.current) return;
      setHop(`${slot.id}-${Date.now()}`);
      const item = getAlphabetItem(slot.label);
      await speakAsync(item ? item.nameSpeech : slot.label);
      await wait(LETTER_GAP);
    }
    if (!alive.current) return;
    setHop(null);
    setStage('out'); // the picture pops out of the word
    playSound('tada');
    onCelebrate();
    await speakAsync(word.sayAs, { rate: 0.7 });
    if (!alive.current) return;
    setStage('solid'); // the word turns one colour, the picture sits on it
    await wait(SOLID_TIME);
    if (!alive.current) return;
    for (let n = 0; n < WORD_BOUNCES; n++) setTimeout(() => alive.current && setBounce((b) => b + 1), n * WORD_BOUNCE_GAP);
    playSound('cheerBell');
    onCelebrate();
    say(translate('Yaaay!'), { lang: getCurrentLanguage() === 'ur' ? 'ur-PK' : 'en-US', pitch: 1.5, rate: 0.92 });
    onWordDone();
  }

  const board = useBoard({
    slots,
    pieces,
    sayPiece: (piece) => {
      const item = getAlphabetItem(piece.label);
      if (item) speak(item.nameSpeech);
    },
    onGrab: (piece) => {
      introPending.current = false;
      const item = getAlphabetItem(piece.label);
      startHoldSound(item ? item.soundSpeech : piece.label, { gapMs: HOLD_GAP_MS, maxRepeats: HOLD_MAX_REPEATS });
    },
    onRelease: stopHoldSound,
    onFinished: finish,
  });
  const { drag } = board;

  return (
    <>
      <div className={`spell-picture${stage === 'out' ? ' pop out' : ''}${stage === 'solid' ? ' perched' : ''}`} onClick={() => speak(word.sayAs)} role="button" tabIndex={0} aria-label={translate('Say the word')}>
        {(stage === 'out' || stage === 'solid') && <WordPicture word={word} size={stage === 'out' ? 170 : 90} />}
      </div>
      <div key={bounce} className={`spell-slots${stage === 'solid' ? ' solid' : ''}${bounce ? ' bounce' : ''}`} dir="ltr">
        {slots.map((slot) => {
          const pieceId = board.filled[slot.id];
          const piece = pieceId ? pieces.find((p) => p.id === pieceId) : null;
          const hopping = hop && hop.startsWith(`${slot.id}-`);
          return (
            <div
              key={slot.id}
              {...drag.targetProps(slot.id)}
              className={`spell-slot${piece ? ' filled' : ''}${board.hints[slot.id] ? ' hint' : ''}${board.burstSlot && board.burstSlot.startsWith(`${slot.id}-`) ? ' burst' : ''}${drag.picked && !piece ? ' ready' : ''}${hopping ? ' hop' : ''}`}
              onClick={piece && stage !== 'play' ? () => speak(word.sayAs) : drag.targetProps(slot.id).onClick}
            >
              <span key={hopping ? hop : 'still'} className="spell-slot-in">
                {piece ? <LetterPiece piece={piece} /> : <LetterPiece piece={{ label: slot.label }} ghost />}
              </span>
            </div>
          );
        })}
      </div>
      {stage === 'play' && (
        <>
          <div className="spell-pieces" dir="ltr">
            {board.left.map((piece) => (
              <div key={piece.id} {...drag.pieceProps(piece.id)} className={`spell-piece draggable${drag.picked === piece.id ? ' picked' : ''}${board.wiggle && board.wiggle.startsWith(`${piece.id}-`) ? ' wiggle' : ''}`} style={drag.style(piece.id)} aria-label={translate('Drag {letter}', { letter: piece.label })}>
                <LetterPiece piece={piece} />
              </div>
            ))}
          </div>
          {board.left.length > 0 && <p className="small-print center">{translate('Drag it, or tap it and then tap its place.')}</p>}
        </>
      )}
    </>
  );
}

// PART 2: the sentence with its two missing words
function SentenceBoard({ word, round, onCelebrate, onFinished }) {
  const words = useMemo(() => word.sentence.text.replace(/\.$/, '').split(' '), [word]);
  const slots = useMemo(
    () => words.map((w, i) => ({ id: `w${i}`, label: w, blank: word.sentence.drag.includes(w) })).filter((s) => s.blank),
    [words, word]
  );
  const pieces = useMemo(() => shuffle(word.sentence.drag.map((w, i) => ({ id: `d${i}`, label: w }))), [word, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [bounce, setBounce] = useState(0);
  const [read, setRead] = useState(false);
  const alive = useRef(true);
  const holdTimer = useRef(null);

  useEffect(() => {
    alive.current = true;
    speakUi('Now finish the sentence!');
    return () => {
      alive.current = false;
      clearTimeout(holdTimer.current);
    };
  }, []);

  async function finish() {
    await wait(SENTENCE_READ_DELAY - FINISH_DELAY > 0 ? SENTENCE_READ_DELAY - FINISH_DELAY : 0);
    if (!alive.current) return;
    setRead(true);
    await speakAsync(word.sentence.sayAs || word.sentence.text, { rate: 0.7 });
    if (!alive.current) return;
    for (let n = 0; n < WORD_BOUNCES; n++) setTimeout(() => alive.current && setBounce((b) => b + 1), n * WORD_BOUNCE_GAP);
    playSound('cheerBell');
    onCelebrate();
    say(translate('Yaaay!'), { lang: getCurrentLanguage() === 'ur' ? 'ur-PK' : 'en-US', pitch: 1.5, rate: 0.92 });
    setTimeout(() => alive.current && onFinished(), WORD_BOUNCES * WORD_BOUNCE_GAP + BUTTONS_DELAY);
  }

  const board = useBoard({
    slots,
    pieces,
    sayPiece: (piece) => speak(piece.label),
    // picking a word up says it; holding it says it once more a moment later
    onGrab: (piece) => {
      speak(piece.label);
      clearTimeout(holdTimer.current);
      holdTimer.current = setTimeout(() => speak(piece.label), HOLD_WORD_AFTER);
    },
    onRelease: () => clearTimeout(holdTimer.current),
    onFinished: finish,
  });
  const { drag } = board;
  let blank = 0;

  return (
    <div className="sentence-board">
      <p key={bounce} className={`sentence-line${bounce ? ' bounce' : ''}${read ? ' read' : ''}`} dir="ltr" onClick={read ? () => speak(word.sentence.sayAs || word.sentence.text) : undefined}>
        {words.map((w, i) => {
          if (!word.sentence.drag.includes(w)) return <span key={i} className="sentence-word">{w}</span>;
          const slot = slots[blank++];
          const filled = board.filled[slot.id];
          return (
            <span key={i} {...drag.targetProps(slot.id)} className={`sentence-blank${filled ? ' filled' : ''}${board.hints[slot.id] ? ' hint' : ''}${drag.picked && !filled ? ' ready' : ''}`}>
              {filled ? slot.label : ' '}
            </span>
          );
        })}
        <span className="sentence-word">.</span>
      </p>
      <div className="spell-pieces" dir="ltr">
        {board.left.map((piece) => (
          <div key={piece.id} {...drag.pieceProps(piece.id)} className={`word-piece draggable${drag.picked === piece.id ? ' picked' : ''}${board.wiggle && board.wiggle.startsWith(`${piece.id}-`) ? ' wiggle' : ''}`} style={drag.style(piece.id)} aria-label={translate('Drag {letter}', { letter: piece.label })}>
            {piece.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SpellingGamePage() {
  const { wordId } = useParams();
  const navigate = useNavigate();
  const word = getSpellingWord(wordId);
  const next = nextSpellingWord(word.id);
  const [part, setPart] = useState('word'); // word | sentence
  const [finished, setFinished] = useState(false);
  const [burst, setBurst] = useState(0);
  const [round, setRound] = useState(0);
  const timer = useRef(null);
  const hasSentence = Boolean(word.sentence);

  // a new word or "Play again" starts fresh
  useEffect(() => {
    setPart('word');
    setFinished(false);
    return () => {
      clearTimeout(timer.current);
      stopHoldSound();
      stopSpeaking();
    };
  }, [word.id, round]);

  function wordDone() {
    if (hasSentence) timer.current = setTimeout(() => setPart('sentence'), SENTENCE_DELAY);
    else timer.current = setTimeout(() => setFinished(true), WORD_BOUNCES * WORD_BOUNCE_GAP + BUTTONS_DELAY);
  }

  const key = `${word.id}-${round}`;
  return (
    <div className="spell-page">
      <Confetti burstKey={burst} />
      <ChildTitle title="Spelling" back="/child/english/spell" speakText={word.sayAs} />

      <div className={`spell-word-area${part === 'sentence' ? ' small' : ''}`}>
        <WordBoard key={key} word={word} round={round} onCelebrate={() => setBurst((b) => b + 1)} onWordDone={wordDone} />
      </div>

      {part === 'sentence' && (
        <div className="sentence-area">
          <SentenceBoard key={key} word={word} round={round} onCelebrate={() => setBurst((b) => b + 1)} onFinished={() => setFinished(true)} />
        </div>
      )}

      {finished && (
        <div className="result-actions spell-end">
          <button type="button" className="icon-button big" onClick={() => { stopSpeaking(); setRound((r) => r + 1); }} aria-label={translate('Play again')} title={translate('Play again')}>
            <Icon name="refresh" size={34} />
          </button>
          {next.id !== word.id && (
            <button type="button" className="icon-button big main" onClick={() => { stopSpeaking(); navigate(`/child/english/spell/${next.id}`); }} aria-label={translate('Next word')} title={translate('Next word')}>
              <Icon name="arrow-right" size={34} />
            </button>
          )}
          <button type="button" className="icon-button big" onClick={() => navigate('/child/english/spell')} aria-label={translate('All words')} title={translate('All words')}>
            <Icon name="view-grid" size={34} />
          </button>
        </div>
      )}
    </div>
  );
}
