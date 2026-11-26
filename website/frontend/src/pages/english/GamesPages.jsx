// LETTER GAMES - (the app's LetterGamesScreen, BubblePopGameScreen, MatchPairsGameScreen)
//   LetterGamesPage  two tiles: Bubble pop · Match pairs
//   BubblePopPage    7 letter bubbles float up slowly (one that floats away comes back from the bottom); the
//                    buddy says "Find A!" + the letter's sound; a right bubble pops (plop + the letter's sound) and
//                    a new one takes its place, a wrong one only wobbles; 4 pops finish a round; the right ones glow
//                    after 5 s without a find; 3 letters per game, then Play again / Back
//   MatchPairsPage   memory cards, capital <-> small, 4 pairs; the faces peek first (2.6 s), then turn over;
//                    a pair = chime + the letter's sound; a miss turns back softly after 1.3 s; after 3 misses in a
//                    row one pair glows ("Let's look again")
// The numbers are the app's gamesConfig.js (BUBBLE_GAME, MATCH_GAME).
// Both follow the A / a choice. Nothing is saved (as in the app).

import { useEffect, useMemo, useRef, useState } from 'react';
import { translate } from '../../i18n/translate';
import { ALPHABET, pickLetters } from '../../data/alphabetData';
import { shuffle } from '../../utils/misc';
import { cheer, playSound, speakAsync, speakUi, speakUiAsync, stopSpeaking } from '../../services/audio';
import { ChildTitle } from '../../layouts/Layouts';
import { Button, Mascot, ChildInstruction } from '../../components/ui';
import Icon from '../../components/Icon';
import { CaseToggle, Confetti, showLetter, useLetterCase } from './common';

const BUBBLE_GAME = { ROUNDS: 3, POPS_PER_ROUND: 4, BUBBLES: 7, RIGHT_SHARE: 0.45, RISE_MIN_S: 9, RISE_MAX_S: 13, HINT_AFTER_MS: 5000, ROUND_PAUSE_MS: 2400 };
const MATCH_GAME = { PAIRS: 4, PEEK_MS: 2600, MISS_SHOW_MS: 1300, HELP_AFTER_MISSES: 3 };

const random = (min, max) => min + Math.random() * (max - min);
const letterSound = (item) => speakAsync(item.soundSpeech, { rate: 0.75 });
let bubbleId = 0;

// a new bubble: at least 2 right ones are always in the sky, otherwise about 45 % are right
function makeBubble(list, target, others, first = false) {
  const targetsNow = list.filter((b) => b.right && !b.popping).length;
  const right = targetsNow < 2 || Math.random() < BUBBLE_GAME.RIGHT_SHARE;
  return {
    id: bubbleId++,
    item: right ? target : others[Math.floor(Math.random() * others.length)],
    right,
    left: random(2, 84),
    speed: random(BUBBLE_GAME.RISE_MIN_S, BUBBLE_GAME.RISE_MAX_S),
    delay: first ? -random(0, BUBBLE_GAME.RISE_MIN_S * 0.8) : random(0, 0.9),
    popping: false,
  };
}

export function BubblePopPage() {
  const [caseMode] = useLetterCase();
  const [game, setGame] = useState(0);
  const targets = useMemo(() => shuffle(ALPHABET).slice(0, BUBBLE_GAME.ROUNDS), [game]); // eslint-disable-line react-hooks/exhaustive-deps
  const [round, setRound] = useState(0);
  const [bubbles, setBubbles] = useState([]);
  const [pops, setPops] = useState(0);
  const [wobble, setWobble] = useState(null);
  const [glow, setGlow] = useState(false);
  const [burst, setBurst] = useState(0);
  const [finished, setFinished] = useState(false);
  const timers = useRef([]);
  const hintTimer = useRef(null);
  const busy = useRef(false);
  const target = targets[round];
  const others = useMemo(() => (target ? pickLetters(target.letter, 5) : []), [target]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  function restartHint() {
    clearTimeout(hintTimer.current);
    setGlow(false);
    hintTimer.current = setTimeout(() => setGlow(true), BUBBLE_GAME.HINT_AFTER_MS);
  }

  // a new round: a fresh sky, the buddy names the letter, then its sound
  useEffect(() => {
    if (!target || finished) return;
    busy.current = false;
    setPops(0);
    let list = [];
    for (let i = 0; i < BUBBLE_GAME.BUBBLES; i++) list = [...list, makeBubble(list, target, others, true)];
    setBubbles(list);
    later(() => speakUiAsync('Find {letter}!', { letter: target.letter }).then(() => !busy.current && letterSound(target)), 500);
    restartHint();
  }, [round, game]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    clearTimeout(hintTimer.current);
    stopSpeaking();
  }, []);

  function tap(b) {
    if (busy.current || b.popping) return;
    if (!b.right) {
      setWobble(`${b.id}-${Date.now()}`);
      return;
    }
    playSound('bubble');
    later(() => letterSound(target), 120);
    setBubbles((list) => list.map((x) => (x.id === b.id ? { ...x, popping: true } : x)));
    // a popped bubble makes room for a new one
    later(() => setBubbles((list) => {
      const rest = list.filter((x) => x.id !== b.id);
      return busy.current ? rest : [...rest, makeBubble(rest, target, others)];
    }), 350);
    restartHint();
    const count = pops + 1;
    setPops(count);
    if (count < BUBBLE_GAME.POPS_PER_ROUND) return;

    // the round is finished
    busy.current = true;
    clearTimeout(hintTimer.current);
    setGlow(false);
    later(() => {
      setBurst((n) => n + 1);
      playSound('pop');
      cheer();
    }, 600);
    later(() => {
      if (round + 1 < targets.length) setRound(round + 1);
      else {
        setFinished(true);
        setBubbles([]);
        playSound('tada');
        setBurst((n) => n + 1);
        speakUi('Great job!');
      }
    }, BUBBLE_GAME.ROUND_PAUSE_MS);
  }

  function again() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    stopSpeaking();
    setFinished(false);
    setRound(0);
    setGame((g) => g + 1);
  }

  return (
    <>
      <Confetti burstKey={burst} />
      <ChildTitle title="Bubble pop" back="/child/english/activities/4" speakText={finished || !target ? 'Great job!' : `Find ${target.nameSpeech}!`}>
        <CaseToggle />
      </ChildTitle>
      {finished ? (
        <div className="game-done">
          <Mascot size={150} bob />
          <h2 className="page-title">{translate('Great job!')}</h2>
          <div className="form-actions" style={{ justifyContent: 'center' }}>
            <Button variant="secondary" icon="arrow-left" to="/child/english/activities/4">Back</Button>
            <Button icon="refresh" onClick={again}>Play again</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="find-banner">
            {translate('Find')} <span className="find-letter">{showLetter(target, caseMode)}</span>
            <span className="pop-dots" aria-label={`${pops} / ${BUBBLE_GAME.POPS_PER_ROUND}`}>
              {Array.from({ length: BUBBLE_GAME.POPS_PER_ROUND }).map((_, i) => <i key={i} className={i < pops ? 'on' : ''} />)}
            </span>
            <span className="tag">{translate('Round {n} of 3', { n: round + 1 })}</span>
          </div>
          <div className="bubble-sky">
            {bubbles.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`rising-bubble${b.popping ? ' popped' : ''}${wobble && wobble.startsWith(`${b.id}-`) ? ' wiggle' : ''}${glow && b.right ? ' glow' : ''}`}
                style={{ left: `${b.left}%`, animationDelay: `${b.delay}s`, animationDuration: `${b.speed}s` }}
                onClick={() => tap(b)}
                disabled={b.popping}
                aria-label={translate('Bubble {letter}', { letter: b.item.letter })}
              >
                {showLetter(b.item, caseMode)}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function makeDeck() {
  const letters = shuffle(ALPHABET).slice(0, MATCH_GAME.PAIRS);
  return shuffle(letters.flatMap((item) => [
    { id: `${item.letter}-U`, pair: item.letter, char: item.letter, item },
    { id: `${item.letter}-L`, pair: item.letter, char: item.lower, item },
  ]));
}

export function MatchPairsPage() {
  const [game, setGame] = useState(0);
  const deck = useMemo(() => makeDeck(), [game]);
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState([]); // pair letters
  const [peek, setPeek] = useState(true);
  const [helpPair, setHelpPair] = useState(null);
  const [finished, setFinished] = useState(false);
  const [burst, setBurst] = useState(0);
  const misses = useRef(0);
  const lock = useRef(false);
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  // a new game: peek at the faces, then turn them over
  useEffect(() => {
    setPeek(true);
    setOpen([]);
    setMatched([]);
    setHelpPair(null);
    setFinished(false);
    misses.current = 0;
    lock.current = false;
    later(() => speakUi('Find the pairs!'), 600);
    later(() => setPeek(false), MATCH_GAME.PEEK_MS);
  }, [game]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    stopSpeaking();
  }, []);

  function flip(card) {
    if (peek || finished || lock.current || open.includes(card.id) || matched.includes(card.pair)) return;
    playSound('tick');
    const next = [...open, card.id];
    setOpen(next);
    if (next.length < 2) return;
    lock.current = true;
    const [a, b] = next.map((id) => deck.find((c) => c.id === id));
    if (a.pair === b.pair) {
      later(() => {
        playSound('chime');
        letterSound(a.item);
        const done = [...matched, a.pair];
        setMatched(done);
        setOpen([]);
        setHelpPair(null);
        misses.current = 0;
        lock.current = false;
        if (done.length === MATCH_GAME.PAIRS) {
          later(() => {
            setFinished(true);
            playSound('tada');
            setBurst((n) => n + 1);
            cheer();
          }, 900);
        }
      }, 350);
    } else {
      misses.current += 1;
      later(() => {
        setOpen([]);
        lock.current = false;
        if (misses.current >= MATCH_GAME.HELP_AFTER_MISSES) {
          const first = deck.find((c) => !matched.includes(c.pair));
          if (first) setHelpPair(first.pair);
          speakUi("Let's look again");
        }
      }, MATCH_GAME.MISS_SHOW_MS);
    }
  }

  function again() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    stopSpeaking();
    setGame((g) => g + 1);
  }

  return (
    <>
      <Confetti burstKey={burst} />
      <ChildTitle title="Match pairs" back="/child/english/activities/4" speakText="Find the pairs!" />
      {finished ? (
        <div className="game-done">
          <Mascot size={150} bob />
          <h2 className="page-title">{translate('Great job!')}</h2>
          <div className="form-actions" style={{ justifyContent: 'center' }}>
            <Button variant="secondary" icon="arrow-left" to="/child/english/activities/4">Back</Button>
            <Button icon="refresh" onClick={again}>Play again</Button>
          </div>
        </div>
      ) : (
        <div className="memory-grid">
          {deck.map((card) => {
            const isMatched = matched.includes(card.pair);
            const faceUp = peek || open.includes(card.id) || isMatched;
            return (
              <button
                key={card.id}
                type="button"
                className={`memory-card${faceUp ? ' up' : ''}${isMatched ? ' matched' : ''}${helpPair === card.pair && !faceUp ? ' glow' : ''}`}
                onClick={() => flip(card)}
                aria-label={faceUp ? card.char : translate('Hidden card')}
                style={{ '--accent': card.item.accent.pale, '--accent-deep': card.item.accent.deep }}
              >
                <span className="mc-inner">
                  <span className="mc-back"><Icon name="star" size={34} color="#fff" /></span>
                  <span className="mc-face">{card.char}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
