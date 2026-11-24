// TRACE LETTERS - (the app's TraceListScreen + LetterTraceScreen + TraceCanvas)
//   TraceListPage   26 tiles with the letter art; tap one to trace it
//   LetterTracePage the capital, then the small letter, then the picture friend says "A for apple!"
// The canvas draws a soft "road" in the shape of the letter, a dashed guide with arrows for the
// stroke to do now and numbered badges. The colour line only grows ALONG the road, so tracing is
// never "wrong": a finger (or mouse) that wanders off simply does nothing. Nothing is saved.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { translate } from '../../i18n/translate';
import { ALPHABET, getLetter, nextLetter } from '../../data/alphabetData';
import { strokesFor, TRACE_BOX } from '../../data/traceStrokes';
import { letterArt } from '../../data/spellingWords';
import { cheer, playSound, speakAsync, speakUi, speakUiAsync, stopSpeaking } from '../../services/audio';
import { ChildTitle } from '../../layouts/Layouts';
import { ChildInstruction } from '../../components/ui';
import Icon from '../../components/Icon';
import { Confetti } from './common';

const TRACE = { STEP: 1.5, TOLERANCE: 14, LOOK_AHEAD: 16, FINISH_AT: 0.93, DOT_TOLERANCE: 16, ARROW_EVERY: 26 };
const LETTER_CELEBRATE_MS = 2600; // celebration time after a letter (the app's traceConfig)
const BADGE_COLORS = ['#E85A64', '#F08A4B', '#8A33CF', '#2F7F73'];

function resample(points) {
  const out = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i - 1];
    const [x2, y2] = points[i];
    const count = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / TRACE.STEP));
    for (let k = 1; k <= count; k++) out.push([x1 + ((x2 - x1) * k) / count, y1 + ((y2 - y1) * k) / count]);
  }
  return out;
}
const pathData = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');

function strokeCue(stroke) {
  if (stroke.dot) return 'Tap the dot!';
  if (stroke.points.length > 5) return 'Round and round!';
  const [x1, y1] = stroke.points[0];
  const [x2, y2] = stroke.points[1];
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (Math.abs(dy) > Math.abs(dx) * 2) return dy > 0 ? 'Down!' : 'Up!';
  if (Math.abs(dx) > Math.abs(dy) * 2) return 'Across!';
  return dy > 0 ? 'Slide down!' : 'Slide up!';
}

function arrowsAlong(dense) {
  const arrows = [];
  let travelled = 0;
  for (let i = 1; i < dense.length - 2; i++) {
    const [x1, y1] = dense[i - 1];
    const [x2, y2] = dense[i];
    travelled += Math.hypot(x2 - x1, y2 - y1);
    if (travelled >= TRACE.ARROW_EVERY) {
      travelled = 0;
      arrows.push({ x: x2, y: y2, a: Math.atan2(y2 - y1, x2 - x1) });
    }
  }
  return arrows;
}
const arrowPath = ({ x, y, a }, s = 3.2) => {
  const b = a + Math.PI;
  return `M${x + Math.cos(b - 0.6) * s} ${y + Math.sin(b - 0.6) * s} L${x} ${y} L${x + Math.cos(b + 0.6) * s} ${y + Math.sin(b + 0.6) * s}`;
};

export function TraceCanvas({ char, color, intro = { text: "Let's trace {letter}!", params: { letter: char.toUpperCase() }, delay: 900 }, onCue, onDone }) {
  const strokes = useMemo(() => strokesFor(char), [char]);
  const dense = useMemo(() => strokes.map((s) => resample(s.points)), [strokes]);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const svgRef = useRef(null);
  const drawing = useRef(false);
  const busy = useRef(false);

  useEffect(() => {
    setIndex(0);
    setProgress(0);
    setDoneCount(0);
    busy.current = false;
    if (!strokes[0]) return undefined;
    // the first stroke: the intro first ("Let's trace A!" / "Now small A!"), then the stroke's cue (like the app)
    let alive = true;
    const cue = strokeCue(strokes[0]);
    if (onCue) onCue(cue);
    const t = setTimeout(() => {
      speakUiAsync(intro.text, intro.params).then(() => alive && speakUi(cue));
    }, intro.delay);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [char, strokes]); // eslint-disable-line react-hooks/exhaustive-deps

  const finishStroke = useCallback(() => {
    busy.current = true;
    playSound('chime');
    const next = index + 1;
    setDoneCount(next);
    setTimeout(() => {
      if (next >= strokes.length) {
        onDone();
      } else {
        setIndex(next);
        setProgress(0);
        busy.current = false;
        const cue = strokeCue(strokes[next]);
        if (onCue) onCue(cue);
        speakUi(cue);
      }
    }, 450);
  }, [index, strokes, onDone, onCue]);

  function toGrid(e) {
    const r = svgRef.current.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * TRACE_BOX.width, ((e.clientY - r.top) / r.height) * TRACE_BOX.height];
  }

  function follow(e) {
    if (busy.current || index >= strokes.length) return;
    const [x, y] = toGrid(e);
    const stroke = strokes[index];
    const road = dense[index];
    if (stroke.dot) {
      const [dx, dy] = stroke.points[0];
      if (Math.hypot(x - dx, y - dy) <= TRACE.DOT_TOLERANCE) finishStroke();
      return;
    }
    let best = progress;
    const limit = Math.min(road.length - 1, progress + TRACE.LOOK_AHEAD);
    for (let i = progress; i <= limit; i++) {
      if (Math.hypot(road[i][0] - x, road[i][1] - y) <= TRACE.TOLERANCE) best = i;
    }
    if (best !== progress) {
      setProgress(best);
      if (best >= (road.length - 1) * TRACE.FINISH_AT) finishStroke();
    }
  }

  const current = strokes[index];
  const currentRoad = dense[index] || [];

  return (
    <svg
      ref={svgRef}
      className="trace-canvas"
      viewBox={`0 0 ${TRACE_BOX.width} ${TRACE_BOX.height}`}
      role="img"
      aria-label={translate('Trace the letter {letter}', { letter: char })}
      onPointerDown={(e) => {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch (err) {
          // not a real pointer (tests) or capture not supported: dragging still works inside the element
        }
        drawing.current = true;
        follow(e);
      }}
      onPointerMove={(e) => drawing.current && follow(e)}
      onPointerUp={() => (drawing.current = false)}
      onPointerCancel={() => (drawing.current = false)}
    >
      {/* the road */}
      {dense.map((road, i) =>
        strokes[i].dot ? (
          <circle key={`e${i}`} cx={road[0][0]} cy={road[0][1]} r={8} fill="#DDD0F5" />
        ) : (
          <path key={`e${i}`} d={pathData(road)} stroke="#DDD0F5" strokeWidth={19} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        )
      )}
      {dense.map((road, i) =>
        strokes[i].dot ? (
          <circle key={`r${i}`} cx={road[0][0]} cy={road[0][1]} r={6} fill="#fff" />
        ) : (
          <path key={`r${i}`} d={pathData(road)} stroke="#fff" strokeWidth={15} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        )
      )}
      {/* finished strokes */}
      {dense.slice(0, doneCount).map((road, i) =>
        strokes[i].dot ? (
          <circle key={`d${i}`} cx={road[0][0]} cy={road[0][1]} r={5} fill={color} />
        ) : (
          <path key={`d${i}`} d={pathData(road)} stroke={color} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        )
      )}
      {/* the stroke being drawn */}
      {current && !current.dot && index >= doneCount && (
        <>
          <path d={pathData(currentRoad)} stroke="#A38FBF" strokeWidth={1.3} strokeDasharray="1.6 3.2" fill="none" />
          {arrowsAlong(currentRoad).map((a, i) => (
            <path key={i} d={arrowPath(a)} stroke="#A38FBF" strokeWidth={1.3} fill="none" strokeLinecap="round" />
          ))}
          <circle cx={currentRoad[currentRoad.length - 1][0]} cy={currentRoad[currentRoad.length - 1][1]} r={3.6} stroke="#A38FBF" strokeWidth={1} strokeDasharray="1.5 1.5" fill="none" />
          {progress > 0 && <path d={pathData(currentRoad.slice(0, progress + 1))} stroke={color} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
        </>
      )}
      {/* number badges */}
      {strokes.map((s, i) => (
        <g key={`b${i}`} opacity={i === index ? 1 : 0.5} className={i === index && i >= doneCount ? 'badge-pulse' : undefined}>
          <circle cx={s.points[0][0]} cy={s.points[0][1]} r={6} fill={BADGE_COLORS[i % BADGE_COLORS.length]} />
          <text x={s.points[0][0]} y={s.points[0][1] + 2.6} textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#fff" fontFamily="Nunito, sans-serif">{i + 1}</text>
        </g>
      ))}
    </svg>
  );
}

export function TraceListPage() {
  const navigate = useNavigate();
  return (
    <>
      <ChildTitle title="Trace letters" back="/child/english" speakText="Pick a letter to trace" />
      <ChildInstruction text="Pick a letter to trace" />
      <div className="kid-panel">
        <div className="letter-grid">
          {ALPHABET.map((item) => (
            <button
              key={item.letter}
              type="button"
              className="letter-tile art"
              style={{ background: item.accent.pale }}
              onClick={() => {
                playSound('pop');
                navigate(item.letter);
              }}
              aria-label={translate('Trace {letter}', { letter: item.letter })}
            >
              <img src={letterArt(item.letter)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export function LetterTracePage() {
  const { letter } = useParams();
  const navigate = useNavigate();
  const item = getLetter((letter || 'A').toUpperCase());
  const example = item.examples[0];
  const [phase, setPhase] = useState('upper'); // upper | lower | done
  const [attempt, setAttempt] = useState(0);
  const [burst, setBurst] = useState(0);
  const lastCue = useRef(null);
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const friendLine = () => speakUi('{letter} for {word}!', { letter: item.letter, word: example.word.toLowerCase() });

  useEffect(() => {
    setPhase('upper');
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      stopSpeaking();
    };
  }, [item, attempt]);

  // a letter is traced: its sound, then a popper + a cheer; then the small letter, or the picture friend
  const handleDone = useCallback(() => {
    speakAsync(item.soundSpeech, { rate: 0.75 });
    later(() => {
      playSound('pop');
      setBurst((b) => b + 1);
      cheer();
    }, 700);
    later(() => {
      if (phase === 'upper') setPhase('lower');
      else {
        setPhase('done');
        playSound('tada');
        setBurst((b) => b + 1);
        friendLine();
      }
    }, LETTER_CELEBRATE_MS);
  }, [phase, item]); // eslint-disable-line react-hooks/exhaustive-deps

  function again() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    stopSpeaking();
    setAttempt((a) => a + 1);
  }

  const next = nextLetter(item.letter);
  // the voice always says the letter NAME (a small "a" would be read as the word "a")
  const intro = phase === 'lower' ? { text: 'Now small {letter}!', params: { letter: item.letter }, delay: 200 } : { text: "Let's trace {letter}!", params: { letter: item.letter }, delay: 900 };

  return (
    <div className="trace-page">
      <Confetti burstKey={burst} />
      <ChildTitle title={translate('Trace {letter}', { letter: phase === 'lower' ? item.lower : item.letter })} back="/child/english/trace" speakText={`Trace ${item.nameSpeech}`} />
      {phase !== 'done' ? (
        <>
          <div className="trace-stage">
            <div className="trace-sample">
              <img src={letterArt(phase === 'lower' ? item.lower : item.letter)} alt="" />
            </div>
            <TraceCanvas
              key={`${phase}-${attempt}`}
              char={phase === 'lower' ? item.lower : item.letter}
              color={item.accent.main}
              intro={intro}
              onCue={(cue) => (lastCue.current = cue)}
              onDone={handleDone}
            />
          </div>
          <div className="result-actions trace-tools">
            <button type="button" className="icon-button" onClick={() => lastCue.current && speakUi(lastCue.current)} aria-label={translate('Say it again')} title={translate('Say it again')}>
              <Icon name="volume-high" />
            </button>
            <button type="button" className="icon-button" onClick={again} aria-label={translate('Start again')} title={translate('Start again')}>
              <Icon name="refresh" />
            </button>
          </div>
        </>
      ) : (
        <div className="trace-done">
          <button type="button" className="listen-picture dance" onClick={friendLine} aria-label={translate(example.word)}>
            <span className="emoji">{example.emoji}</span>
          </button>
          <p className="listen-word">{example.word}</p>
          <div className="result-actions">
            <button type="button" className="icon-button big" onClick={again} aria-label={translate('Play again')} title={translate('Play again')}>
              <Icon name="refresh" size={34} />
            </button>
            {next && (
              <button type="button" className="icon-button big main" onClick={() => navigate(`/child/english/trace/${next.letter}`)} aria-label={translate('Next letter')} title={translate('Next letter')}>
                <Icon name="arrow-right" size={34} />
              </button>
            )}
            <button type="button" className="icon-button big" onClick={() => navigate('/child/english/trace')} aria-label={translate('All letters')} title={translate('All letters')}>
              <Icon name="view-grid" size={34} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
