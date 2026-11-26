// LETTER LESSON - one letter in 7 small pages, with the same rules as the app's LetterLessonScreen:
//   Look · Listen (picture 1) · Listen (picture 2) · Say · Play · Star Check · Result
// - Forward opens only when the page's small job is done (otherwise the buddy gives a hint).
// - Back is always open, except in Star Check after the first answer and on Result.
// - Pages mount when first reached and STAY mounted (hidden when not current), so a finished page stays
//   finished and going back never re-runs a demo. Only the current page is "active" (talks / animates).
// - Look: the jump-and-say demo plays ONCE by itself but does NOT finish the page: the child must tap.
// - Hints: the buddy says the page's short hint; "Tap the letter!" is only shown, not spoken (SILENT_HINTS).
// - The 🔊 above the forward arrow repeats the last thing the page said.
// - Arrows, the ← → keys and touch swipes move between pages; on Play a swipe only counts from the
//   bottom strip (so dragging a letter never turns the page).
// - Star Check: one try per question (a miss shows the right one); after the 5th a big star waits and
//   the arrow opens the Result. Stars are saved when the check ends (best score only, nothing in Preview).
// Letter sounds use the browser voice (the app's recorded phonics clips may not be published on the web).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import { translate } from '../../i18n/translate';
import { ALPHABET, getLetter, highlightIndex, nextLetter, otherLetters, shuffle } from '../../data/alphabetData';
import buildQuestions, { starsFor } from '../../data/alphabetQuestions';
import { cheer, playSound, say, speak, speakAsync, speakUi, speakUiAsync, stopSpeaking } from '../../services/audio';
import { Mascot, StarRow } from '../../components/ui';
import Icon from '../../components/Icon';
import { CaseToggle, Confetti, LetterGlyph, showLetter, useDrag, useLetterCase } from './common';

const PAGES = [
  { id: 'look', hint: 'Tap the letter!', blocked: 'Tap the letter!' },
  { id: 'listen1', hint: null, blocked: 'Tap the picture!' },
  { id: 'listen2', hint: null, blocked: 'Tap the picture!' },
  { id: 'say', hint: 'Say it with me!', blocked: 'Tap the big button!' },
  { id: 'play', hint: null, blocked: "Let's finish the game!" },
  { id: 'check', hint: null, blocked: 'Pick one!' },
  { id: 'result', hint: null, blocked: null },
];
const SAY = 3;
const PLAY = 4;
const CHECK = 5;
const RESULT = 6;
const STAGES = [
  { icon: 'eye', pages: [0] },
  { icon: 'ear-hearing', pages: [1, 2] },
  { icon: 'microphone', pages: [SAY] },
  { icon: 'gamepad-variant', pages: [PLAY] },
  { icon: 'star', pages: [CHECK] },
];

const SILENT_HINTS = ['Tap the letter!']; // only shown in the bubble, not spoken
const BUDDY_WALK_MS = 900; // the buddy walks in when the lesson opens
const FIRST_HINT_DELAY = 1200; // ms after the walk-in before the first hint
const FIRST_DEMO_DELAY = 4200; // ms before the Look demo on the first page
const RESULT_WAVE_DELAY = 1600; // ms after the Result cheer before the buddy waves
const BUBBLE_MS = 4000; // the buddy's speech bubble hides after this
const SWIPE_MIN = 60; // px a finger must move to turn a page
const PLAY_SWIPE_STRIP = 90; // on Play, swipes only count from this bottom strip (px)

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const CANCELLED = { cancelled: true };

// ONE voice + motion script at a time on a page (the app's useLessonSequence). play() resolves true when the
// script finished, false when it was skipped (already playing) or cancelled (page left / cancel()).
function useSequence(active) {
  const token = useRef(0);
  const running = useRef(false);
  const [playing, setPlaying] = useState(false);

  const cancel = useCallback(() => {
    token.current += 1;
    running.current = false;
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (!active) cancel();
  }, [active, cancel]);

  useEffect(() => () => {
    token.current += 1;
  }, []);

  const play = useCallback(async (script) => {
    if (running.current) return false;
    const mine = ++token.current;
    running.current = true;
    setPlaying(true);
    const guard = (promise) =>
      promise.then((value) => {
        if (mine !== token.current) throw CANCELLED;
        return value;
      });
    const helpers = {
      say: (text, options) => guard(speakAsync(text, options)),
      sound: (item) => guard(speakAsync(item.soundSpeech, { rate: 0.75 })),
      wait: (ms) => guard(wait(ms)),
    };
    try {
      await script(helpers);
      return true;
    } catch (error) {
      if (error !== CANCELLED) throw error;
      return false;
    } finally {
      if (mine === token.current) {
        running.current = false;
        setPlaying(false);
      }
    }
  }, []);

  return { play, cancel, playing };
}

// ---------- 1. LOOK ----------
function LookPage({ item, active, onDone, demoDelay }) {
  const [caseMode] = useLetterCase();
  const sequence = useSequence(active);
  const [motion, setMotion] = useState('');
  const [tapped, setTapped] = useState(false);
  const demoShown = useRef(false);

  async function perform(byChild) {
    const finished = await sequence.play(async ({ say: talk, sound, wait: pause }) => {
      playSound('whistleUp');
      setMotion('jump');
      await Promise.all([talk(item.nameSpeech, { rate: 0.8 }), pause(1100)]);
      for (let i = 0; i < 3; i++) {
        setMotion(`hop${i}`);
        playSound('boing');
        await Promise.all([sound(item), pause(500)]);
      }
    });
    setMotion('');
    if (finished && byChild) onDone();
  }

  useEffect(() => {
    if (!active) {
      setMotion('');
      return undefined;
    }
    if (demoShown.current) return undefined;
    const timer = setTimeout(() => {
      demoShown.current = true;
      perform(false); // a demonstration: it does NOT finish the page
    }, demoDelay);
    return () => clearTimeout(timer);
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  function tap() {
    if (sequence.playing) return; // taps during a sequence are ignored
    setTapped(true);
    perform(true);
  }

  return (
    <div className="lesson-page look-page">
      <button
        type="button"
        className={`look-letter ${motion}${active && !tapped && !sequence.playing ? ' inviting' : ''}`}
        onClick={tap}
        aria-label={translate('Say {letter} again', { letter: item.letter })}
      >
        <LetterGlyph char={showLetter(item, caseMode)} color={item.accent.deep} size={220} />
        <span className="look-shadow" />
      </button>
    </div>
  );
}

// ---------- 2 / 3. LISTEN ----------
// Each time the page appears the picture slides in and the voice says "A for apple!", then the buddy says
// "Tap the picture!". Tap: it dances, the voice says "A says … like apple." and cheers. The first tap finishes the page.
function ListenPage({ item, example, active, voice, onDone, onHint }) {
  const [caseMode] = useLetterCase();
  const sequence = useSequence(active);
  const [dance, setDance] = useState(0);
  const [slide, setSlide] = useState(0);
  const tapped = useRef(false);
  const activeNow = useRef(active);
  activeNow.current = active;
  const idx = highlightIndex(example, item.letter);
  const word = example.word.toLowerCase();

  useEffect(() => {
    if (!active) return;
    setSlide((s) => s + 1);
    const line = `${item.letter} for ${word}!`;
    sequence
      .play(async ({ say: talk, wait: pause }) => {
        await pause(350);
        voice.remember(() => speak(line));
        await talk(line, { pitch: 1.3 });
      })
      .then((finished) => {
        if (finished && !tapped.current) onHint();
      });
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  async function tap() {
    if (sequence.playing) {
      if (tapped.current) return;
      sequence.cancel(); // a tap during the intro starts the tap sequence
      stopSpeaking();
    }
    const first = !tapped.current;
    tapped.current = true;
    setDance((d) => d + 1);
    playSound('xylophone');
    const before = `${item.letter} says`;
    const after = `like ${word}.`;
    voice.remember(async () => {
      await speakAsync(before, { rate: 0.8 });
      if (activeNow.current) await speakAsync(item.soundSpeech, { rate: 0.75 });
      if (activeNow.current) speak(after);
    });
    const finished = await sequence.play(async ({ say: talk, sound, wait: pause }) => {
      const line = async () => {
        await talk(before, { rate: 0.8 });
        await sound(item);
        await talk(after, { rate: 0.8 });
      };
      await Promise.all([line(), pause(1500)]);
      cheer();
    });
    if (finished && first) onDone();
  }

  return (
    <div className="lesson-page listen-page">
      <span className="listen-letter" style={{ background: item.accent.pale }}>
        <LetterGlyph char={showLetter(item, caseMode)} color={item.accent.deep} size={60} />
      </span>
      <button type="button" key={`${slide}-${dance}`} className={`listen-picture${dance ? ' dance' : ' slide-in'}`} onClick={tap} aria-label={translate(example.word)}>
        <span className="emoji" aria-hidden="true">{example.emoji}</span>
      </button>
      <p className="listen-word" dir="ltr">
        {example.word.split('').map((ch, i) => (
          <span key={i} style={i === idx ? { color: item.accent.deep, fontSize: '1.25em' } : undefined}>{ch}</span>
        ))}
      </p>
    </div>
  );
}

// ---------- 4. SAY ----------
// The mic plays the letter sound 3 times (the letter beats with each one). Then a thumbs-up appears:
// tapping it ("I said it") finishes the page. Nothing is recorded.
function SayPage({ item, active, voice, onDone }) {
  const [caseMode] = useLetterCase();
  const sequence = useSequence(active);
  const [phase, setPhase] = useState('ready'); // ready | saying | canSay | done
  const [beat, setBeat] = useState(0);

  async function sayTogether() {
    if (sequence.playing) return;
    playSound('sparkle');
    setPhase((p) => (p === 'ready' ? 'saying' : p));
    voice.remember(() => speakAsync(item.soundSpeech, { rate: 0.75 }));
    const finished = await sequence.play(async ({ sound, wait: pause }) => {
      for (let i = 0; i < 3; i++) {
        setBeat((b) => b + 1);
        await sound(item);
        if (i < 2) await pause(350);
      }
    });
    if (finished) setPhase((p) => (p === 'done' ? p : 'canSay'));
  }

  function saidIt() {
    if (phase === 'done') return;
    setPhase('done');
    onDone();
  }

  return (
    <div className="lesson-page say-page">
      <span key={beat} className={beat ? 'say-beat' : ''}>
        <LetterGlyph char={showLetter(item, caseMode)} color={item.accent.deep} size={120} />
      </span>
      <div className="say-buttons">
        <button type="button" className={`say-mic${active && phase === 'ready' ? ' saying' : ''}`} onClick={sayTogether} aria-label={translate('Say it together')}>
          <Icon name="microphone" size={64} color="#fff" />
        </button>
        {(phase === 'canSay' || phase === 'done') && (
          <button type="button" className={`say-mic done say-thumb${active && phase === 'canSay' ? ' saying' : ''}`} onClick={saidIt} aria-label={translate('I said it')}>
            <Icon name="thumb-up" size={64} color="#fff" />
          </button>
        )}
      </div>
    </div>
  );
}

// ---------- 5. PLAY ----------
// A drag round (the app's DragMatchRound): drag the card onto the right target. Errorless help on wrong drops:
// 1st "Let's try again", 2nd the right one glows ("Look at the glowing one."), 3rd the buddy places it.
function DragRound({ piece, targets, correctKey, renderTarget, instruction, successLine, successSpeech, voice, buddy, onDone }) {
  const attempts = useRef(0);
  const timers = useRef([]);
  const [hint, setHint] = useState(false);
  const [locked, setLocked] = useState(false);
  const [matched, setMatched] = useState(false);
  const [caption, setCaption] = useState(null);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  useEffect(() => {
    voice.ui(instruction.text, instruction.speakParams);
    return () => timers.current.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function succeed() {
    setLocked(true);
    setMatched(true);
    setCaption(successLine);
    playSound('pop');
    buddy.party();
    voice.teach(successSpeech, () => cheer());
    buddy.mood('happy');
    later(onDone, 1700);
  }

  function missed() {
    attempts.current += 1;
    if (attempts.current === 1) buddy.say("Let's try again", 'think');
    else if (attempts.current === 2) {
      setHint(true);
      buddy.say('Look at the glowing one.', 'think');
    } else {
      setHint(true);
      setLocked(true);
      buddy.say('Here, let me help.', 'happy');
      later(succeed, 1300);
    }
  }

  const drag = useDrag({
    onDrop: (pieceId, targetKey) => {
      if (locked) return;
      if (targetKey === correctKey) succeed();
      else missed();
    },
  });

  return (
    <div className="drag-round">
      <div className="drag-targets">
        {targets.map((t) => (
          <div
            key={t.key}
            {...drag.targetProps(t.key)}
            className={`drag-target${hint && t.key === correctKey ? ' hint' : ''}${matched && t.key === correctKey ? ' won' : ''}${drag.picked ? ' ready' : ''}`}
          >
            {renderTarget(t, matched && t.key === correctKey)}
            {matched && t.key === correctKey && <span className="placed-piece">{piece}</span>}
          </div>
        ))}
      </div>
      <p className="drag-caption" dir="ltr">{caption || ' '}</p>
      {!matched && (
        <div className="drag-home">
          <div {...drag.pieceProps('piece', locked)} className={`drag-piece draggable${drag.picked === 'piece' ? ' picked' : ''}`} style={drag.style('piece')} aria-label={translate('Drag {letter}', { letter: piece })}>
            {piece}
          </div>
          <p className="small-print center">{translate('Drag it, or tap it and then tap the picture.')}</p>
        </div>
      )}
    </div>
  );
}

// "Pop every A bubble!": 7 bubbles, 3 with the letter. A wrong tap only wobbles; after 8 s without a tap one
// right bubble glows.
const BUBBLE_TARGETS = 3;
const BUBBLE_COUNT = 7;
const IDLE_HINT_MS = 8000;
function BubblesRound({ item, caseMode, instruction, voice, buddy, onDone }) {
  const bubbles = useMemo(
    () =>
      shuffle([...Array.from({ length: BUBBLE_TARGETS }, () => item), ...otherLetters(item.letter, BUBBLE_COUNT - BUBBLE_TARGETS)]).map((entry, id) => ({
        id,
        item: entry,
        right: entry.letter === item.letter,
      })),
    [item]
  );
  const [popped, setPopped] = useState([]);
  const [wobble, setWobble] = useState(null);
  const [taps, setTaps] = useState(0);
  const [hintId, setHintId] = useState(null);
  const finished = useRef(false);

  useEffect(() => {
    voice.ui(instruction.text, instruction.speakParams);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setHintId(null);
    if (finished.current) return undefined;
    const t = setTimeout(() => {
      const waiting = bubbles.find((b) => b.right && !popped.includes(b.id));
      if (waiting) setHintId(waiting.id);
    }, IDLE_HINT_MS);
    return () => clearTimeout(t);
  }, [taps]); // eslint-disable-line react-hooks/exhaustive-deps

  function tap(b) {
    if (popped.includes(b.id)) return;
    setTaps((n) => n + 1);
    if (!b.right) {
      setWobble(`${b.id}-${Date.now()}`);
      return;
    }
    playSound('bubble');
    const next = [...popped, b.id];
    setPopped(next);
    const allPopped = bubbles.filter((x) => x.right && !next.includes(x.id)).length === 0;
    voice.teach(item.nameSpeech, allPopped ? () => cheer() : undefined);
    if (allPopped) {
      finished.current = true;
      buddy.party();
      buddy.mood('happy');
      setTimeout(onDone, 1400);
    }
  }

  return (
    <div className="bubbles-round">
      <p className="round-title">{translate(instruction.text, instruction.params)}</p>
      <div className="bubble-field seven">
        {bubbles.map((b, i) => (
          <button
            key={b.id}
            type="button"
            className={`letter-bubble${popped.includes(b.id) ? ' popped' : ''}${wobble && wobble.startsWith(`${b.id}-`) ? ' wiggle' : ''}${hintId === b.id ? ' glow' : ''}`}
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

const PLAY_ROUNDS = ['drag', 'pop', 'case'];
// The instruction of a round (the app's playInstruction): shown with the letter as drawn, spoken with its name.
function playInstruction(round, item, caseMode) {
  const lower = caseMode === 'lower';
  let name = PLAY_ROUNDS[round];
  if (name === 'case' && lower) name = 'caseLower';
  const text = {
    drag: 'Drag the letter to its picture.',
    pop: 'Pop every {letter} bubble!',
    case: 'Drag big {letter} to small {lower}.',
    caseLower: 'Drag small {lower} to big {letter}.',
  }[name];
  return {
    text,
    params: { letter: name === 'pop' && lower ? item.lower : item.letter, lower: item.lower },
    speakParams: { letter: item.letter, lower: item.letter }, // the voice always says the letter name
  };
}

function PlayPage({ item, voice, buddy, onDone }) {
  const [caseMode] = useLetterCase();
  const [round, setRound] = useState(0);
  const lower = caseMode === 'lower';
  const example = item.examples[0];

  // shuffled once per letter, so switching A / a never resets a round
  const pictureOrder = useMemo(() => shuffle([example, ...otherLetters(item.letter, 2).map((o) => o.examples[0])]), [item.letter]); // eslint-disable-line react-hooks/exhaustive-deps
  const caseOrder = useMemo(() => shuffle([item, otherLetters(item.letter, 1)[0]]), [item.letter]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => {
    if (round >= PLAY_ROUNDS.length - 1) onDone();
    setRound((r) => r + 1);
  };
  const instruction = playInstruction(round, item, caseMode);

  return (
    <div className="lesson-page play-page">
      <div className="round-dots" aria-label={translate('Round {n} of 3', { n: Math.min(round + 1, 3) })}>
        {PLAY_ROUNDS.map((r, i) => <span key={r} className={i <= round ? 'on' : ''} />)}
      </div>
      {round === 0 && (
        <DragRound
          key="drag"
          piece={showLetter(item, caseMode)}
          targets={pictureOrder.map((e) => ({ key: e.word, example: e }))}
          correctKey={example.word}
          renderTarget={(t, won) => (
            <span className={`drag-picture${won ? ' happy' : ''}`}>
              <span className="emoji" aria-hidden="true">{t.example.emoji}</span>
              <span className="drag-word">{lower ? t.example.word.toLowerCase() : t.example.word}</span>
            </span>
          )}
          instruction={instruction}
          successLine={`${showLetter(item, caseMode)} for ${example.word.toLowerCase()}!`}
          successSpeech={`${item.letter} for ${example.word.toLowerCase()}!`}
          voice={voice}
          buddy={buddy}
          onDone={next}
        />
      )}
      {round === 1 && <BubblesRound key="pop" item={item} caseMode={caseMode} instruction={instruction} voice={voice} buddy={buddy} onDone={next} />}
      {round === 2 && (
        <DragRound
          key="case"
          piece={showLetter(item, caseMode)}
          targets={caseOrder.map((l) => ({ key: l.letter, item: l }))}
          correctKey={item.letter}
          renderTarget={(t) => <span className="target-letter">{showLetter(t.item, caseMode, 'opposite')}</span>}
          instruction={instruction}
          successLine={lower ? `Small ${item.lower}, big ${item.letter}.` : `Big ${item.letter}, small ${item.lower}.`}
          successSpeech={`Big ${item.nameSpeech}, small ${item.nameSpeech}.`}
          voice={voice}
          buddy={buddy}
          onDone={next}
        />
      )}
      {round > 2 && (
        <div className="all-done">
          <span className="emoji" aria-hidden="true">🎉</span>
          <strong>{translate('You did it!')}</strong>
        </div>
      )}
    </div>
  );
}

// ---------- 6. STAR CHECK ----------
// 5 questions, ONE try each: right = a pop + cheer; a miss fades the choice, the right one glows and the buddy
// says "Good try! It was this one." Then it moves on by itself. After the last one a big star waits.
function CheckPage({ item, active, voice, buddy, onChosen, onFinish }) {
  const [caseMode] = useLetterCase();
  const questions = useMemo(() => buildQuestions(item), [item]);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(null);
  const firstTry = useRef(0);
  const timer = useRef(null);
  const finished = index >= questions.length;
  const q = finished ? null : questions[index];

  useEffect(() => {
    if (finished) return undefined;
    const [text, params] = q.prompt(caseMode);
    const spoken = { ...params, letter: item.letter }; // spoken with the letter name
    if (q.say) {
      voice.remember(() => speak(q.say));
      speakUiAsync(text, spoken).then(() => voice.teach(q.say));
    } else voice.ui(text, spoken);
    return () => clearTimeout(timer.current);
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  function choose(option) {
    if (chosen || !active) return;
    setChosen(option.key);
    onChosen();
    const next = (correct) => {
      if (correct) firstTry.current += 1;
      setChosen(null);
      if (index + 1 >= questions.length) onFinish(starsFor(firstTry.current));
      setIndex(index + 1);
    };
    if (option.correct) {
      playSound('pop');
      cheer();
      buddy.mood('happy');
      timer.current = setTimeout(() => next(true), 1500);
    } else {
      buddy.say('Good try! It was this one.', 'think');
      timer.current = setTimeout(() => next(false), 2600);
    }
  }

  function stateOf(option) {
    if (!chosen) return '';
    if (option.key === chosen) return option.correct ? ' right' : ' faded';
    return option.correct ? ' reveal' : '';
  }

  if (finished) {
    return (
      <div className="lesson-page check-page">
        <span className="check-star" aria-label={translate('Great job!')}>⭐</span>
      </div>
    );
  }

  const [text, params] = q.prompt(caseMode);
  return (
    <div className="lesson-page check-page">
      <div className="round-dots" aria-label={`${index + 1} / ${questions.length}`}>
        {questions.map((x, i) => <span key={x.id} className={i <= index ? 'on' : ''} />)}
      </div>
      <div className="check-prompt">
        <span>{translate(text, params)}</span>
        {q.say && (
          <button type="button" className="icon-button" aria-label={translate('Say it again')} onClick={() => speak(q.say)}>
            <Icon name="volume-high" />
          </button>
        )}
      </div>
      {q.showLetter && <LetterGlyph char={showLetter(item, caseMode)} color={item.accent.deep} size={96} />}
      {q.showPicture && <span className="emoji check-picture" aria-label={translate(q.showPicture.word)}>{q.showPicture.emoji}</span>}
      <div className="check-options">
        {q.options.map((option) => (
          <button
            key={option.key}
            type="button"
            className={`answer${stateOf(option)}`}
            onClick={() => choose(option)}
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
// The stars pop in; then play again · next letter (big) · all letters. With 1 star "play again" is the highlighted one.
function ResultPage({ item, stars, onReplay }) {
  const navigate = useNavigate();
  const next = nextLetter(item.letter);
  const low = stars <= 1;
  return (
    <div className="lesson-page result-page">
      <LetterGlyph char={item.letter} color={item.accent.deep} size={110} />
      <div className="result-stars"><StarRow filled={stars} size={56} /></div>
      <div className="result-actions">
        <button type="button" className={`icon-button big${low ? ' main' : ''}`} onClick={onReplay} aria-label={translate('Play again')} title={translate('Play again')}>
          <Icon name="refresh" size={34} />
        </button>
        {next && (
          <button type="button" className={`icon-button big${low ? '' : ' main'}`} onClick={() => navigate(`/child/english/alphabet/${next.letter}`)} aria-label={translate('Next letter')} title={translate('Next letter')}>
            <Icon name="arrow-right" size={34} />
          </button>
        )}
        <button type="button" className="icon-button big" onClick={() => navigate('/child/english/alphabet')} aria-label={translate('All letters')} title={translate('All letters')}>
          <Icon name="view-grid" size={34} />
        </button>
      </div>
    </div>
  );
}

// ---------- the lesson ----------
function Lesson({ item, onReplay }) {
  const navigate = useNavigate();
  const { activeChild, displayAvatar, recordLetterResult } = useChild();
  const [page, setPage] = useState(0);
  const [visited, setVisited] = useState([0]);
  const [done, setDone] = useState(PAGES.map(() => false));
  const [checkStarted, setCheckStarted] = useState(false);
  const [stars, setStars] = useState(1);
  const [buddy, setBuddy] = useState({ mood: 'walk', moodKey: 0, message: null, messageKey: 0 });
  const [burst, setBurst] = useState(0);
  const pageRef = useRef(0);
  const replay = useRef(null);
  const stage = useRef(null);
  const touch = useRef(null);
  const bubbleTimer = useRef(null);

  const buddyMood = useCallback((mood) => setBuddy((b) => ({ ...b, mood, moodKey: b.moodKey + 1 })), []);
  // The buddy says something: a bubble (+ the voice, unless silent). The bubble hides by itself.
  const buddySays = useCallback((message, mood = 'hop', silent = false) => {
    setBuddy((b) => ({ ...b, message, messageKey: b.messageKey + 1, mood, moodKey: b.moodKey + 1 }));
    if (!silent) speakUi(message);
    clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBuddy((b) => ({ ...b, message: null })), BUBBLE_MS);
  }, []);
  const party = useCallback(() => setBurst((n) => n + 1), []);
  const buddyApi = useMemo(() => ({ mood: buddyMood, say: buddySays, party }), [buddyMood, buddySays, party]);

  // what the page says; the 🔊 button repeats the last one
  const voice = useMemo(
    () => ({
      ui(text, params) {
        replay.current = () => speakUi(text, params);
        speakUi(text, params);
      },
      remember(fn) {
        replay.current = fn;
      },
      teach(text, onEnd) {
        replay.current = () => speak(text);
        say(text, { lang: 'en-US', rate: 0.8, onEnd });
      },
    }),
    []
  );

  // the page's short hint; "Tap the letter!" is only shown
  const hint = useCallback(
    (text, mood = 'hop') => {
      if (!text) return;
      replay.current = () => speakUi(text);
      buddySays(text, mood, SILENT_HINTS.includes(text));
    },
    [buddySays]
  );

  const markDone = useCallback((index) => setDone((list) => (list[index] ? list : list.map((v, i) => (i === index ? true : v)))), []);

  // the buddy walks in, then gives the first hint
  useEffect(() => {
    const t = setTimeout(() => {
      buddyMood('idle');
      if (pageRef.current === 0) hint(PAGES[0].hint);
    }, BUDDY_WALK_MS + FIRST_HINT_DELAY);
    return () => {
      clearTimeout(t);
      clearTimeout(bubbleTimer.current);
      stopSpeaking();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const canGoNext = (index) => index < RESULT && done[index];
  const canGoBack = (index) => index > 0 && index !== RESULT && !(index === CHECK && checkStarted);

  function changePage(next) {
    stopSpeaking();
    playSound('whoosh');
    pageRef.current = next;
    setPage(next);
    setVisited((list) => (list.includes(next) ? list : [...list, next]));
    if (next === RESULT) {
      playSound('tada');
      party();
      buddySays('Great job!', 'cheer');
      setTimeout(() => buddyMood('wave'), RESULT_WAVE_DELAY);
    } else if (PAGES[next].hint) hint(PAGES[next].hint);
    else setBuddy((b) => ({ ...b, message: null }));
  }

  const go = (dir) => {
    if (dir > 0) {
      if (canGoNext(page)) changePage(page + 1);
      else if (PAGES[page].blocked) hint(PAGES[page].blocked, 'think');
    } else if (canGoBack(page)) changePage(page - 1);
  };
  const goRef = useRef(go);
  goRef.current = go;

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest && e.target.closest('input, textarea')) return;
      const rtl = document.documentElement.dir === 'rtl';
      if (e.key === 'ArrowRight') goRef.current(rtl ? -1 : 1);
      if (e.key === 'ArrowLeft') goRef.current(rtl ? 1 : -1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // what each page reports back
  const finishLook = useCallback(() => {
    markDone(0);
    playSound('sparkle');
    cheer();
    party();
    buddyMood('happy');
  }, [markDone, party, buddyMood]);
  const finishListen = (index) => {
    markDone(index);
    playSound('sparkle');
    buddyMood('cheer');
  };
  const finishSay = () => {
    markDone(SAY);
    playSound('pop');
    cheer();
    party();
    buddyMood('cheer');
  };
  const finishPlay = () => {
    markDone(PLAY);
    playSound('sparkle');
    buddySays('You did it!', 'cheer');
  };
  const finishCheck = (earned) => {
    setStars(earned);
    markDone(CHECK);
    if (activeChild) recordLetterResult(activeChild.id, item.letter, earned); // nothing is saved in Preview
    playSound('cheerBell');
    buddyMood('cheer');
  };

  function renderPage(index) {
    const active = page === index;
    switch (PAGES[index].id) {
      case 'look':
        return <LookPage item={item} active={active} onDone={finishLook} demoDelay={FIRST_DEMO_DELAY} />;
      case 'listen1':
      case 'listen2':
        return (
          <ListenPage
            item={item}
            example={item.examples[index - 1] || item.examples[0]}
            active={active}
            voice={voice}
            onDone={() => finishListen(index)}
            onHint={() => hint('Tap the picture!')}
          />
        );
      case 'say':
        return <SayPage item={item} active={active} voice={voice} onDone={finishSay} />;
      case 'play':
        return <PlayPage item={item} voice={voice} buddy={buddyApi} onDone={finishPlay} />;
      case 'check':
        return <CheckPage item={item} active={active} voice={voice} buddy={buddyApi} onChosen={() => setCheckStarted(true)} onFinish={finishCheck} />;
      default:
        return <ResultPage item={item} stars={stars} onReplay={onReplay} />;
    }
  }

  const forwardOpen = canGoNext(page);

  return (
    <div
      className="lesson"
      style={{ '--accent': item.accent.pale }}
      onTouchStart={(e) => {
        touch.current = null;
        if (e.target.closest('.draggable')) return;
        const t = e.touches[0];
        if (page === PLAY && stage.current) {
          const r = stage.current.getBoundingClientRect();
          if (t.clientY < r.bottom - PLAY_SWIPE_STRIP) return; // Play: only the bottom strip turns the page
        }
        touch.current = t.clientX;
      }}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        touch.current = null;
        if (Math.abs(dx) < SWIPE_MIN) return;
        const rtl = document.documentElement.dir === 'rtl';
        go((dx < 0) !== rtl ? 1 : -1);
      }}
    >
      <Confetti burstKey={burst} />
      <div className="lesson-top">
        <button type="button" className="back-button" onClick={() => navigate('/child/english/alphabet')} aria-label={translate('All letters')}>
          <Icon name="arrow-left" />
        </button>
        <div className="lesson-dots" aria-label={translate('Step {n} of {total}', { n: page + 1, total: PAGES.length })}>
          {STAGES.map((s) => {
            const current = s.pages.includes(page);
            const passed = s.pages.every((p) => done[p]);
            return (
              <span key={s.icon} className={`lesson-dot${current ? ' current' : ''}${passed && !current ? ' passed' : ''}`}>
                <Icon name={s.icon} size={20} />
              </span>
            );
          })}
        </div>
        <CaseToggle />
      </div>

      <div className="lesson-stage" ref={stage}>
        {PAGES.map((p, index) =>
          visited.includes(index) ? (
            <div key={p.id} className="lesson-slot" hidden={index !== page}>
              {renderPage(index)}
            </div>
          ) : null
        )}
      </div>

      <div className="lesson-bottom">
        <div className="lesson-buddy">
          <span key={buddy.moodKey} className={`buddy-mood ${buddy.mood}`}>
            <Mascot avatar={displayAvatar} size={90} alt="" />
          </span>
          {buddy.message && <div key={buddy.messageKey} className="bubble small" role="status">{translate(buddy.message)}</div>}
        </div>
        <div className="lesson-nav">
          <button type="button" className="icon-button" onClick={() => go(-1)} disabled={!canGoBack(page)} aria-label={translate('Back')}>
            <Icon name="chevron-left" />
          </button>
          {page < RESULT && (
            <div className="lesson-forward">
              <button type="button" className="icon-button lesson-sound" onClick={() => replay.current && replay.current()} aria-label={translate('Say it again')}>
                <Icon name="volume-high" />
              </button>
              <button type="button" className={`arrow-next${forwardOpen ? ' open' : ''}`} onClick={() => go(1)} aria-label={translate('Next')} aria-disabled={!forwardOpen}>
                <Icon name="arrow-right" size={38} color="#fff" />
                {forwardOpen && <span key={page} className="pointer" aria-hidden="true">👉</span>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// A new letter (Next letter) or "Play again" starts a completely fresh lesson, like the app's navigation.replace.
export default function LetterLessonPage() {
  const { letter } = useParams();
  const item = getLetter((letter || 'A').toUpperCase());
  const [run, setRun] = useState(0);
  return <Lesson key={`${item.letter}-${run}`} item={item} onReplay={() => setRun((r) => r + 1)} />;
}

export { ALPHABET };
