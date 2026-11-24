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
import { cheer, playSound, speak, speakAsync } from '../../services/audio';
import { ChildTitle } from '../../layouts/Layouts';
import { ChildInstruction } from '../../components/ui';
import Icon from '../../components/Icon';
import { Confetti } from './common';

const TRACE = { STEP: 1.5, TOLERANCE: 14, LOOK_AHEAD: 16, FINISH_AT: 0.93, DOT_TOLERANCE: 16, ARROW_EVERY: 26 };
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

export function TraceCanvas({ char, color, onDone }) {
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
    if (strokes[0]) setTimeout(() => speak(strokeCue(strokes[0])), 500);
  }, [char, strokes]);

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
        speak(strokeCue(strokes[next]));
      }
    }, 450);
  }, [index, strokes, onDone]);

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
  const [phase, setPhase] = useState('upper'); // upper | lower | done
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    setPhase('upper');
    speakAsync(`Let's trace ${item.nameSpeech}!`);
  }, [item]);

  const handleDone = useCallback(() => {
    setBurst((b) => b + 1);
    cheer();
    if (phase === 'upper') setTimeout(() => setPhase('lower'), 1600);
    else {
      setTimeout(() => {
        setPhase('done');
        playSound('tada');
        speakAsync(`${item.letter} for ${item.examples[0].word}!`, { pitch: 1.3 });
      }, 1200);
    }
  }, [phase, item]);

  const next = nextLetter(item.letter);

  return (
    <div className="trace-page">
      <Confetti burstKey={burst} />
      <ChildTitle title={translate('Trace {letter}', { letter: phase === 'lower' ? item.lower : item.letter })} back="/child/english/trace" speakText={`Trace ${item.nameSpeech}`} />
      {phase !== 'done' ? (
        <div className="trace-stage">
          <div className="trace-sample">
            <img src={letterArt(phase === 'lower' ? item.lower : item.letter)} alt="" />
          </div>
          <TraceCanvas key={phase} char={phase === 'lower' ? item.lower : item.letter} color={item.accent.main} onDone={handleDone} />
        </div>
      ) : (
        <div className="trace-done">
          <button type="button" className="listen-picture dance" onClick={() => speak(`${item.letter} for ${item.examples[0].word}!`)} aria-label={translate(item.examples[0].word)}>
            <span className="emoji">{item.examples[0].emoji}</span>
          </button>
          <p className="listen-word">{item.examples[0].word}</p>
          <div className="result-actions">
            {next && (
              <button type="button" className="icon-button big" onClick={() => navigate(`/child/english/trace/${next.letter}`)} aria-label={translate('Next letter')}>
                <Icon name="arrow-right" size={34} />
              </button>
            )}
            <button type="button" className="icon-button big" onClick={() => setPhase('upper')} aria-label={translate('Play again')}>
              <Icon name="refresh" size={34} />
            </button>
            <button type="button" className="icon-button big" onClick={() => navigate('/child/english/trace')} aria-label={translate('All letters')}>
              <Icon name="view-grid" size={34} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
