// LETTER GAMES - (the app's LetterGamesScreen, BubblePopGameScreen, MatchPairsGameScreen)
//   LetterGamesPage  two tiles: Bubble pop · Match pairs
//   BubblePopPage    letter bubbles float up slowly; "Find A!" + the letter; right = pop + sparkle,
//                    wrong = a wobble only; the right ones glow after 5 s; 3 rounds
//   MatchPairsPage   memory cards, capital <-> small, 4 pairs; the faces peek first, then flip;
//                    a miss turns back softly; a helping glow after 3 misses
// Both follow the A / a choice. Nothing is saved (as in the app).

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { translate } from '../../i18n/translate';
import { ALPHABET, pickLetters } from '../../data/alphabetData';
import { shuffle } from '../../utils/misc';
import { cheer, playSound, speak, speakAsync } from '../../services/audio';
import { ChildTitle } from '../../layouts/Layouts';
import { Button, Mascot, StarRow, ChildInstruction } from '../../components/ui';
import { HubTile } from './EnglishHubPage';
import Icon from '../../components/Icon';
import { CaseToggle, Confetti, showLetter, useLetterCase } from './common';

const ROUNDS = 3;
const BUBBLES_PER_ROUND = 6;
const TARGETS_PER_ROUND = 3;
const GLOW_AFTER_MS = 5000;

export function LetterGamesPage() {
  const navigate = useNavigate();
  return (
    <>
      <ChildTitle title="Letter games" back="/child/english" speakText="Pick a game" />
      <ChildInstruction text="Pick a game" />
      <HubTile index={0} icon="🎈" title="Bubble Pop" subtitle="Pop the letter bubbles" color="#E3F2FA" onClick={() => { playSound('bubble'); navigate('bubbles'); }} />
      <HubTile index={1} icon="🧩" title="Match Pairs" subtitle="Find big and small letters" color="#E5F1E3" onClick={() => { playSound('pop'); navigate('pairs'); }} />
    </>
  );
}

function makeRound() {
  const target = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  const others = pickLetters(target.letter, BUBBLES_PER_ROUND - TARGETS_PER_ROUND);
  const bubbles = shuffle([
    ...Array.from({ length: TARGETS_PER_ROUND }).map((_, i) => ({ id: `t${i}`, item: target, right: true })),
    ...others.map((o, i) => ({ id: `o${i}`, item: o, right: false })),
  ]).map((b, i) => ({ ...b, left: 4 + ((i * 53) % 80), delay: (i * 1.3) % 5, speed: 10 + (i % 3) * 2 }));
  return { target, bubbles };
}

export function BubblePopPage() {
  const [caseMode] = useLetterCase();
  const [round, setRound] = useState(0);
  const [data, setData] = useState(() => makeRound());
  const [popped, setPopped] = useState([]);
  const [wobble, setWobble] = useState(null);
  const [glow, setGlow] = useState(false);
  const [burst, setBurst] = useState(0);
  const finished = round >= ROUNDS;

  useEffect(() => {
    if (finished) return undefined;
    setPopped([]);
    setGlow(false);
    const say = setTimeout(() => speakAsync(`Find ${data.target.nameSpeech}!`), 400);
    const glowTimer = setTimeout(() => setGlow(true), GLOW_AFTER_MS);
    return () => {
      clearTimeout(say);
      clearTimeout(glowTimer);
    };
  }, [data, finished]);

  useEffect(() => {
    if (finished) {
      playSound('tada');
      cheer();
    }
  }, [finished]);

  function tap(b) {
    if (popped.includes(b.id)) return;
    if (!b.right) {
      setWobble(`${b.id}-${Date.now()}`);
      return;
    }
    playSound('bubble');
    speak(b.item.nameSpeech);
    const next = [...popped, b.id];
    setPopped(next);
    if (data.bubbles.filter((x) => x.right && !next.includes(x.id)).length === 0) {
      setBurst((n) => n + 1);
      cheer();
      setTimeout(() => {
        setRound((r) => r + 1);
        setData(makeRound());
      }, 1300);
    }
  }

  return (
    <>
      <Confetti burstKey={burst} />
      <ChildTitle title="Bubble pop" back="/child/english/games" speakText={finished ? 'Great job!' : `Find ${data.target.nameSpeech}!`}>
        <CaseToggle />
      </ChildTitle>
      {finished ? (
        <div className="game-done">
          <Mascot size={150} bob />
          <h2 className="page-title">{translate('Great job!')}</h2>
          <StarRow filled={3} size={50} />
          <div className="form-actions" style={{ justifyContent: 'center' }}>
            <Button variant="secondary" to="/child/english/games">All games</Button>
            <Button onClick={() => { setRound(0); setData(makeRound()); }}>Play again</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="find-banner">
            {translate('Find')} <span className="find-letter">{showLetter(data.target, caseMode)}</span>
            <span className="tag">{translate('Round {n} of 3', { n: round + 1 })}</span>
          </div>
          <div className="bubble-sky">
            {data.bubbles.map((b) => (
              <button
                key={`${round}-${b.id}`}
                type="button"
                className={`rising-bubble${popped.includes(b.id) ? ' popped' : ''}${wobble && wobble.startsWith(`${b.id}-`) ? ' wiggle' : ''}${glow && b.right ? ' glow' : ''}`}
                style={{ left: `${b.left}%`, animationDelay: `-${b.delay * 2 + 1}s`, animationDuration: `${b.speed}s` }}
                onClick={() => tap(b)}
                disabled={popped.includes(b.id)}
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
  const letters = shuffle(ALPHABET).slice(0, 4);
  return shuffle(letters.flatMap((item) => [
    { id: `${item.letter}-U`, pair: item.letter, char: item.letter, item },
    { id: `${item.letter}-L`, pair: item.letter, char: item.lower, item },
  ]));
}

export function MatchPairsPage() {
  const [deck, setDeck] = useState(() => makeDeck());
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState([]);
  const [peek, setPeek] = useState(true);
  const [misses, setMisses] = useState(0);
  const [burst, setBurst] = useState(0);
  const lock = useRef(false);
  const done = matched.length === deck.length;

  useEffect(() => {
    setPeek(true);
    speakAsync('Find the big and small letters!');
    const t = setTimeout(() => setPeek(false), 2200);
    return () => clearTimeout(t);
  }, [deck]);

  useEffect(() => {
    if (done) {
      playSound('tada');
      cheer();
      setBurst((b) => b + 1);
    }
  }, [done]);

  const helpPair = useMemo(() => {
    if (misses < 3) return null;
    const left = deck.filter((c) => !matched.includes(c.id));
    return left.length ? left[0].pair : null;
  }, [misses, deck, matched]);

  function flip(card) {
    if (peek || lock.current || open.includes(card.id) || matched.includes(card.id)) return;
    playSound('tick');
    speak(card.item.nameSpeech);
    const next = [...open, card.id];
    setOpen(next);
    if (next.length === 2) {
      lock.current = true;
      const [a, b] = next.map((id) => deck.find((c) => c.id === id));
      if (a.pair === b.pair) {
        setTimeout(() => {
          playSound('sparkle');
          setMatched((m) => [...m, a.id, b.id]);
          setOpen([]);
          setMisses(0);
          lock.current = false;
        }, 500);
      } else {
        setTimeout(() => {
          setOpen([]);
          setMisses((m) => m + 1);
          lock.current = false;
        }, 1100);
      }
    }
  }

  return (
    <>
      <Confetti burstKey={burst} />
      <ChildTitle title="Match pairs" back="/child/english/games" speakText="Find the big and small letters!" />
      {done ? (
        <div className="game-done">
          <Mascot size={150} bob />
          <h2 className="page-title">{translate('Great job!')}</h2>
          <StarRow filled={3} size={50} />
          <div className="form-actions" style={{ justifyContent: 'center' }}>
            <Button variant="secondary" to="/child/english/games">All games</Button>
            <Button onClick={() => { setDeck(makeDeck()); setMatched([]); setOpen([]); setMisses(0); }}>Play again</Button>
          </div>
        </div>
      ) : (
        <div className="memory-grid">
          {deck.map((card) => {
            const faceUp = peek || open.includes(card.id) || matched.includes(card.id);
            return (
              <button
                key={card.id}
                type="button"
                className={`memory-card${faceUp ? ' up' : ''}${matched.includes(card.id) ? ' matched' : ''}${helpPair === card.pair && !faceUp ? ' glow' : ''}`}
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
