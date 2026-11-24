// LETTER LESSON - one letter in 7 small pages (the app's LetterLessonScreen + SwipePager):
//   Look · Listen (picture 1) · Listen (picture 2) · Say · Play · Star Check · Result
// The big arrow opens only when the page's small job is done (the buddy gives a hint otherwise).
// Back is always open, except in Star Check after the first answer and on Result.
// Arrows, swipes (touch) and the ← → keys move between pages. Almost no written text: the voice
// says everything. Stars come from first-try Star Check answers and are saved per child (best score
// only, never lowered, nothing in Preview mode).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import { translate } from '../../i18n/translate';
import { ALPHABET, getLetter, highlightIndex, nextLetter, otherLetters, pickLetters, shuffle } from '../../data/alphabetData';
import buildQuestions, { starsFor } from '../../data/alphabetQuestions';
import { cheer, playSound, speak, speakAsync, stopSpeaking } from '../../services/audio';
import { Button, Mascot, StarRow } from '../../components/ui';
import Icon from '../../components/Icon';
import { CaseToggle, Confetti, LetterGlyph, showLetter, useDrag, useLetterCase } from './common';

const STEPS = ['look', 'listen1', 'listen2', 'say', 'play', 'check', 'result'];
const DOTS = [
  { icon: 'eye', steps: ['look'] },
  { icon: 'ear-hearing', steps: ['listen1', 'listen2'] },
  { icon: 'microphone', steps: ['say'] },
  { icon: 'gamepad-variant', steps: ['play'] },
  { icon: 'star', steps: ['check', 'result'] },
];
const HINTS = { look: 'Tap the letter!', listen1: 'Tap the picture!', listen2: 'Tap the picture!', say: 'Tap the microphone!', play: 'Let’s play!', check: 'Pick one!' };

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- 1. LOOK ----------
function LookPage({ item, active, onDone }) {
  const [caseMode] = useLetterCase();
  const [motion, setMotion] = useState('');
  const run = useRef(0);

  const play = useCallback(async () => {
    const id = ++run.current;
    setMotion('jump');
    await speakAsync(item.nameSpeech, { rate: 0.8 });
    for (let i = 0; i < 3; i++) {
      if (run.current !== id) return;
      setMotion(`hop${i}`);
      playSound(i === 0 ? 'whistleUp' : 'boing');
      await speakAsync(item.soundSpeech, { rate: 0.75 });
      await wait(150);
    }
    if (run.current === id) {
      setMotion('');
      onDone();
    }
  }, [item, onDone]);

  useEffect(() => {
    if (!active) return undefined;
    const t = setTimeout(play, 500);
    return () => {
      clearTimeout(t);
      run.current++;
    };
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="lesson-page look-page">
      <button type="button" className={`look-letter ${motion}`} onClick={play} aria-label={translate('Say {letter} again', { letter: item.letter })}>
        <LetterGlyph char={showLetter(item, caseMode)} color={item.accent.deep} size={220} />
        <span className="look-shadow" />
      </button>
    </div>
  );
}

// ---------- 2 / 3. LISTEN ----------
function ListenPage({ item, example, active, onDone }) {
  const [dance, setDance] = useState(0);
  const idx = highlightIndex(example, item.letter);
  const word = example.word;

  useEffect(() => {
    if (!active) return undefined;
    const t = setTimeout(() => speakAsync(`${item.letter} for ${word}!`, { pitch: 1.3 }), 500);
    return () => clearTimeout(t);
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  async function tap() {
    setDance((d) => d + 1);
    playSound('xylophone');
    await speakAsync(`${item.letter} says ${item.soundSpeech}, like ${word}.`, { rate: 0.8 });
    onDone();
  }

  return (
    <div className="lesson-page listen-page">
      <button type="button" key={dance} className={`listen-picture${dance ? ' dance' : ''}`} onClick={tap} aria-label={translate(word)}>
        <span className="emoji" aria-hidden="true">{example.emoji}</span>
      </button>
      <p className="listen-word" dir="ltr">
        {word.split('').map((ch, i) => (
          <span key={i} style={i === idx ? { color: item.accent.deep, fontSize: '1.25em' } : undefined}>{ch}</span>
        ))}
      </p>
    </div>
  );
}

// ---------- 4. SAY ----------
function SayPage({ item, onDone }) {
  const [phase, setPhase] = useState('idle'); // idle | saying | done
  async function start() {
    if (phase === 'saying') return;
    setPhase('saying');
    await speakAsync('Say it with me!', { pitch: 1.3 });
    for (let i = 0; i < 3; i++) {
      await speakAsync(item.soundSpeech, { rate: 0.75 });
      await wait(450);
    }
    setPhase('done');
    cheer();
    onDone();
  }
  return (
    <div className="lesson-page say-page">
      <LetterGlyph char={item.letter} color={item.accent.deep} size={120} />
      <button type="button" className={`say-mic ${phase}`} onClick={start} aria-label={translate('Tap the microphone!')}>
        <Icon name={phase === 'done' ? 'thumb-up' : 'microphone'} size={64} color="#fff" />
      </button>
      <p className="say-hint">{translate(phase === 'done' ? 'Great job!' : phase === 'saying' ? 'Say it with me!' : 'Tap the microphone!')}</p>
    </div>
  );
}

// ---------- 5. PLAY ----------
// A drag round: drag the piece onto the right target. Errorless help: 1st miss "Let's try again",
// 2nd miss the right target glows, 3rd miss the buddy places it.
function DragRound({ piece, targets, correctId, renderTarget, onWin }) {
  const [misses, setMisses] = useState(0);
  const [placed, setPlaced] = useState(false);
  const [shake, setShake] = useState(null);

  const win = useCallback(() => {
    setPlaced(true);
    playSound('sparkle');
    cheer();
    setTimeout(onWin, 1200);
  }, [onWin]);

  const drag = useDrag({
    onDrop: (pieceId, targetId) => {
      if (placed) return;
      if (targetId === correctId) return win();
      playSound('boing');
      setShake(`${targetId}-${Date.now()}`);
      const m = misses + 1;
      setMisses(m);
      if (m === 1) speak('Let’s try again');
      if (m >= 3) {
        speak('Here, let me help.');
        setTimeout(win, 700);
      }
    },
  });

  return (
    <div className="drag-round">
      <div className="drag-targets">
        {targets.map((t) => (
          <div
            key={t.id}
            {...drag.targetProps(t.id)}
            className={`drag-target${misses >= 2 && t.id === correctId ? ' hint' : ''}${placed && t.id === correctId ? ' won' : ''}${shake && shake.startsWith(`${t.id}-`) ? ' wiggle' : ''}${drag.picked ? ' ready' : ''}`}
          >
            {renderTarget(t)}
            {placed && t.id === correctId && <span className="placed-piece">{piece.label}</span>}
          </div>
        ))}
      </div>
      {!placed && (
        <div className="drag-home">
          <div {...drag.pieceProps('piece')} className={`drag-piece draggable${drag.picked === 'piece' ? ' picked' : ''}`} style={drag.style('piece')} aria-label={translate('Drag {letter}', { letter: piece.label })}>
            {piece.label}
          </div>
          <p className="small-print center">{translate('Drag it, or tap it and then tap the picture.')}</p>
        </div>
      )}
    </div>
  );
}

function BubblesRound({ item, caseMode, onWin }) {
  const bubbles = useMemo(() => {
    const others = pickLetters(item.letter, 3);
    return shuffle([
      ...[0, 1, 2].map((i) => ({ id: `t${i}`, item, right: true })),
      ...others.map((o, i) => ({ id: `o${i}`, item: o, right: false })),
    ]);
  }, [item]);
  const [popped, setPopped] = useState([]);
  const [wobble, setWobble] = useState(null);
  const left = bubbles.filter((b) => b.right && !popped.includes(b.id)).length;

  useEffect(() => {
    speakAsync(`Pop the ${item.nameSpeech}!`);
  }, [item]);

  function tap(b) {
    if (popped.includes(b.id)) return;
    if (b.right) {
      playSound('bubble');
      speak(item.nameSpeech);
      const next = [...popped, b.id];
      setPopped(next);
      if (bubbles.filter((x) => x.right && !next.includes(x.id)).length === 0) {
        cheer();
        setTimeout(onWin, 1100);
      }
    } else {
      setWobble(`${b.id}-${Date.now()}`);
    }
  }

  return (
    <div className="bubbles-round">
      <p className="round-title">{translate('Pop the {letter} bubbles!', { letter: showLetter(item, caseMode) })} <span className="tag">{left}</span></p>
      <div className="bubble-field">
        {bubbles.map((b, i) => (
          <button
            key={b.id}
            type="button"
            className={`letter-bubble${popped.includes(b.id) ? ' popped' : ''}${wobble && wobble.startsWith(`${b.id}-`) ? ' wiggle' : ''}`}
            style={{ animationDelay: `${i * 0.4}s` }}
            onClick={() => tap(b)}
            aria-label={translate('Bubble {letter}', { letter: b.item.letter })}
            disabled={popped.includes(b.id)}
          >
            {showLetter(b.item, caseMode)}
          </button>
        ))}
      </div>
    </div>
  );
}

function PlayPage({ item, onDone }) {
  const [caseMode] = useLetterCase();
  const [round, setRound] = useState(0);
  const [burst, setBurst] = useState(0);

  const pictureRound = useMemo(() => {
    const right = item.examples.find((e) => !e.endsWith) || item.examples[0];
    const others = otherLetters(item.letter, 2).map((o) => o.examples[0]);
    return shuffle([{ id: 'right', example: right }, ...others.map((e, i) => ({ id: `o${i}`, example: e }))]);
  }, [item]);
  const caseRound = useMemo(() => {
    const others = pickLetters(item.letter, 2);
    return shuffle([{ id: 'right', item }, ...others.map((o, i) => ({ id: `o${i}`, item: o }))]);
  }, [item]);

  const next = () => {
    setBurst((b) => b + 1);
    if (round >= 2) onDone();
    else setRound(round + 1);
  };

  useEffect(() => {
    if (round === 0) speakAsync(`Drag ${item.nameSpeech} to the ${(item.examples.find((e) => !e.endsWith) || item.examples[0]).word}.`);
    if (round === 2) speakAsync('Big and small! Find the partner.');
  }, [round, item]);

  return (
    <div className="lesson-page play-page">
      <Confetti burstKey={burst} />
      <div className="round-dots" aria-label={translate('Round {n} of 3', { n: Math.min(round + 1, 3) })}>
        {[0, 1, 2].map((r) => <span key={r} className={r <= round ? 'on' : ''} />)}
      </div>
      {round === 0 && (
        <DragRound
          key="r0"
          piece={{ label: showLetter(item, caseMode) }}
          targets={pictureRound}
          correctId="right"
          renderTarget={(t) => <span className="emoji" aria-label={translate(t.example.word)}>{t.example.emoji}</span>}
          onWin={next}
        />
      )}
      {round === 1 && <BubblesRound key="r1" item={item} caseMode={caseMode} onWin={next} />}
      {round === 2 && (
        <DragRound
          key="r2"
          piece={{ label: showLetter(item, caseMode, 'opposite') }}
          targets={caseRound}
          correctId="right"
          renderTarget={(t) => <span className="target-letter">{showLetter(t.item, caseMode)}</span>}
          onWin={next}
        />
      )}
      {round > 2 && <p className="round-title">{translate('Great job!')}</p>}
    </div>
  );
}

// ---------- 6. STAR CHECK ----------
function CheckPage({ item, active, onAnswered, onFinish }) {
  const [caseMode] = useLetterCase();
  const questions = useMemo(() => buildQuestions(item), [item]);
  const [index, setIndex] = useState(0);
  const [tried, setTried] = useState([]);
  const [right, setRight] = useState(null);
  const firstTry = useRef(0);
  const q = questions[index];
  const [text, params] = q.prompt(caseMode);

  useEffect(() => {
    if (!active) return undefined;
    const t = setTimeout(() => {
      if (q.say) speakAsync(`${translate(text, params)} ${q.say}`);
      else speakAsync(translate(text, params));
    }, 300);
    return () => clearTimeout(t);
  }, [active, index]); // eslint-disable-line react-hooks/exhaustive-deps

  function choose(option) {
    if (right) return;
    onAnswered();
    if (option.correct) {
      if (tried.length === 0) firstTry.current += 1;
      setRight(option.key);
      playSound('sparkle');
      cheer();
      setTimeout(() => {
        setRight(null);
        setTried([]);
        if (index + 1 >= questions.length) onFinish(starsFor(firstTry.current));
        else setIndex(index + 1);
      }, 1100);
    } else {
      playSound('boing');
      setTried([...tried, option.key]);
    }
  }

  return (
    <div className="lesson-page check-page">
      <p className="check-count">{index + 1} / {questions.length}</p>
      <div className="check-prompt">
        <span>{translate(text, params)}</span>
        <button type="button" className="icon-button" aria-label={translate('Say it again')} onClick={() => speak(q.say || translate(text, params))}>
          <Icon name="volume-high" />
        </button>
      </div>
      {q.showLetter && <LetterGlyph char={showLetter(item, caseMode)} color={item.accent.deep} size={96} />}
      {q.showPicture && <span className="emoji check-picture" aria-label={translate(q.showPicture.word)}>{q.showPicture.emoji}</span>}
      <div className="check-options">
        {q.options.map((option) => (
          <button
            key={option.key}
            type="button"
            className={`answer${right === option.key ? ' right' : ''}${tried.includes(option.key) ? ' tried wiggle' : ''}`}
            onClick={() => choose(option)}
            disabled={tried.includes(option.key)}
            aria-label={option.kind === 'picture' ? translate(option.example.word) : option.item.letter}
          >
            {option.kind === 'picture' ? <span className="emoji">{option.example.emoji}</span> : showLetter(option.item, caseMode, option.role)}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- 7. RESULT ----------
function ResultPage({ item, stars, onReplay }) {
  const navigate = useNavigate();
  const { activeChild, recordLetterResult } = useChild();
  const next = nextLetter(item.letter);
  const saved = useRef(false);
  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    if (activeChild) recordLetterResult(activeChild.id, item.letter, stars);
    playSound('tada');
    setTimeout(cheer, 600);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="lesson-page result-page">
      <Confetti burstKey={1} />
      <LetterGlyph char={item.letter} color={item.accent.deep} size={110} />
      <div className="result-stars"><StarRow filled={stars} size={56} /></div>
      <div className="result-actions">
        {next && (
          <button type="button" className="icon-button big" onClick={() => navigate(`/child/english/alphabet/${next.letter}`)} aria-label={translate('Next letter')} title={translate('Next letter')}>
            <Icon name="arrow-right" size={34} />
          </button>
        )}
        <button type="button" className="icon-button big" onClick={onReplay} aria-label={translate('Play again')} title={translate('Play again')}>
          <Icon name="refresh" size={34} />
        </button>
        <button type="button" className="icon-button big" onClick={() => navigate('/child/english/alphabet')} aria-label={translate('All letters')} title={translate('All letters')}>
          <Icon name="view-grid" size={34} />
        </button>
      </div>
    </div>
  );
}

// ---------- the lesson ----------
export default function LetterLessonPage() {
  const { letter } = useParams();
  const navigate = useNavigate();
  const { displayAvatar } = useChild();
  const item = getLetter((letter || 'A').toUpperCase());
  const [step, setStep] = useState(0);
  const [done, setDone] = useState({});
  const [answered, setAnswered] = useState(false);
  const [stars, setStars] = useState(1);
  const [hint, setHint] = useState(null);
  const [run, setRun] = useState(0);
  const touchX = useRef(null);

  // a new letter (Next letter) starts fresh
  useEffect(() => {
    setStep(0);
    setDone({});
    setAnswered(false);
    stopSpeaking();
  }, [item.letter]);

  const name = STEPS[step];
  const canForward = Boolean(done[name]) && step < STEPS.length - 2;
  const canBack = step > 0 && !(name === 'check' && answered) && name !== 'result';
  const markDone = useCallback((key) => setDone((d) => (d[key] ? d : { ...d, [key]: true })), []);

  const go = useCallback(
    (dir) => {
      if (dir > 0) {
        if (canForward) {
          stopSpeaking();
          playSound('whoosh');
          setStep((s) => s + 1);
          setHint(null);
        } else if (HINTS[name]) {
          setHint(HINTS[name]);
          speak(translate(HINTS[name]));
        }
      } else if (canBack) {
        stopSpeaking();
        setStep((s) => s - 1);
        setHint(null);
      }
    },
    [canForward, canBack, name]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest('input, textarea')) return;
      const rtl = document.documentElement.dir === 'rtl';
      if (e.key === 'ArrowRight') go(rtl ? -1 : 1);
      if (e.key === 'ArrowLeft') go(rtl ? 1 : -1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [go]);

  function replay() {
    setStep(0);
    setDone({});
    setAnswered(false);
    setRun((r) => r + 1);
  }

  const page = (() => {
    switch (name) {
      case 'look':
        return <LookPage key={`look${run}`} item={item} active onDone={() => markDone('look')} />;
      case 'listen1':
        return <ListenPage key={`l1${run}`} item={item} example={item.examples[0]} active onDone={() => markDone('listen1')} />;
      case 'listen2':
        return <ListenPage key={`l2${run}`} item={item} example={item.examples[1] || item.examples[0]} active onDone={() => markDone('listen2')} />;
      case 'say':
        return <SayPage key={`say${run}`} item={item} onDone={() => markDone('say')} />;
      case 'play':
        return <PlayPage key={`play${run}`} item={item} onDone={() => markDone('play')} />;
      case 'check':
        return (
          <CheckPage
            key={`check${run}`}
            item={item}
            active
            onAnswered={() => setAnswered(true)}
            onFinish={(s) => {
              setStars(s);
              setStep(STEPS.indexOf('result'));
            }}
          />
        );
      default:
        return <ResultPage key={`res${run}`} item={item} stars={stars} onReplay={replay} />;
    }
  })();

  return (
    <div
      className="lesson"
      style={{ '--accent': item.accent.pale }}
      onTouchStart={(e) => {
        if (e.target.closest('.draggable, .drag-round, .bubble-field')) return;
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) < 60) return;
        const rtl = document.documentElement.dir === 'rtl';
        go((dx < 0) !== rtl ? 1 : -1);
      }}
    >
      <div className="lesson-top">
        <button type="button" className="back-button" onClick={() => navigate('/child/english/alphabet')} aria-label={translate('All letters')}>
          <Icon name="arrow-left" />
        </button>
        <div className="lesson-dots" aria-label={translate('Step {n} of {total}', { n: step + 1, total: STEPS.length })}>
          {DOTS.map((dot) => {
            const current = dot.steps.includes(name);
            const passed = dot.steps.every((s) => STEPS.indexOf(s) < step);
            return (
              <span key={dot.icon} className={`lesson-dot${current ? ' current' : ''}${passed ? ' passed' : ''}`}>
                <Icon name={dot.icon} size={20} />
              </span>
            );
          })}
        </div>
        <CaseToggle />
      </div>

      <div className="lesson-stage">{page}</div>

      <div className="lesson-bottom">
        <div className="lesson-buddy">
          <Mascot avatar={displayAvatar} size={90} bob alt="" />
          {hint && <div className="bubble small">{translate(hint)}</div>}
        </div>
        <div className="lesson-nav">
          <button type="button" className="icon-button" onClick={() => go(-1)} disabled={!canBack} aria-label={translate('Back')}>
            <Icon name="chevron-left" />
          </button>
          {name !== 'result' && name !== 'check' && (
            <button type="button" className={`arrow-next${canForward ? ' open' : ''}`} onClick={() => go(1)} aria-label={translate('Next')} aria-disabled={!canForward}>
              <Icon name="arrow-right" size={38} color="#fff" />
              {canForward && <span className="pointer" aria-hidden="true">👉</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export { ALPHABET };
