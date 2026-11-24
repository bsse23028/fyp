// ENGLISH COMMON - small pieces shared by the English pages:
//   CaseToggle      the A / a switch (how letters are drawn; saved in this browser, not in Preview)
//   showLetter()    a letter in the chosen case ('same') or the other case ('opposite')
//   LetterGlyph     a big rounded letter
//   Confetti        a short burst of coloured pieces (one ✨ when animations are off)
//   useDrag         pointer dragging (mouse, touch, pen) with drop targets, for the games

import { useCallback, useEffect, useRef, useState } from 'react';
import { useChild } from '../../context/ChildContext';
import { translate } from '../../i18n/translate';
import { playSound } from '../../services/audio';

export function useLetterCase() {
  const { letterCase, setLetterCase } = useChild();
  return [letterCase, setLetterCase];
}

export function showLetter(item, caseMode, role = 'same') {
  const lowerWanted = role === 'same' ? caseMode === 'lower' : caseMode !== 'lower';
  return lowerWanted ? item.lower : item.letter;
}

export function CaseToggle() {
  const [caseMode, setCase] = useLetterCase();
  return (
    <div className="segmented case-toggle" role="radiogroup" aria-label={translate('Big or small letters')}>
      {['upper', 'lower'].map((mode) => (
        <button
          key={mode}
          type="button"
          role="radio"
          aria-checked={caseMode === mode}
          className={caseMode === mode ? 'on' : ''}
          onClick={() => {
            playSound('tick');
            setCase(mode);
          }}
        >
          {mode === 'upper' ? 'A' : 'a'}
        </button>
      ))}
    </div>
  );
}

export function LetterGlyph({ char, color = 'var(--calm-primary)', size = 160, className = '', style }) {
  return (
    <span className={`letter-glyph ${className}`} style={{ color, fontSize: size, ...style }} aria-hidden="true">
      {char}
    </span>
  );
}

const CONFETTI_COLOURS = ['#F7C744', '#FF7F7F', '#9ED9CF', '#A866E0', '#8EC1EC', '#A9DB8E'];
export function Confetti({ burstKey }) {
  const [pieces, setPieces] = useState([]);
  useEffect(() => {
    if (!burstKey) return undefined;
    const reduced = document.documentElement.classList.contains('motion-off') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setPieces([{ id: 'still', still: true }]);
    } else {
      setPieces(
        Array.from({ length: 24 }).map((_, i) => ({
          id: `${burstKey}-${i}`,
          left: i < 12 ? 4 + Math.random() * 18 : 78 + Math.random() * 18,
          dx: (i < 12 ? 1 : -1) * (40 + Math.random() * 160),
          rot: Math.random() * 720,
          color: CONFETTI_COLOURS[i % CONFETTI_COLOURS.length],
          delay: Math.random() * 120,
        }))
      );
    }
    const t = setTimeout(() => setPieces([]), 1600);
    return () => clearTimeout(t);
  }, [burstKey]);
  if (pieces.length === 0) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) =>
        p.still ? (
          <span key={p.id} className="confetti-still">✨</span>
        ) : (
          <span key={p.id} className="confetti-piece" style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}ms`, '--dx': `${p.dx}px`, '--rot': `${p.rot}deg` }} />
        )
      )}
    </div>
  );
}

// DRAG - move a piece with the mouse / finger / pen and drop it on a target.
//   const drag = useDrag({ onDrop: (pieceId, targetId) => true/false });
//   <div {...drag.pieceProps('A')} style={drag.style('A')} />   <div {...drag.targetProps('apple')} />
// onDrop returns true when the drop is right (the piece then stays put; the page moves it into place).
// onGrab(id) / onRelease(id) (optional) run when a piece is picked up / let go (the spelling hold sound).
// A wrong drop or a drop outside glides the piece home. Keyboard / switch users can TAP a piece
// and then TAP a target instead (the same onDrop is called).
export function useDrag({ onDrop, onGrab, onRelease }) {
  const [active, setActive] = useState(null); // { id, dx, dy }
  const [picked, setPicked] = useState(null); // tap-to-move: the piece chosen first
  const targets = useRef(new Map());
  const start = useRef(null);
  const moved = useRef(false);

  const findTarget = (x, y) => {
    for (const [id, el] of targets.current) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const pad = 24; // a generous magnet around every target
      if (x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad) return id;
    }
    return null;
  };

  const pieceProps = useCallback(
    (id, disabled = false) => ({
      onPointerDown: (e) => {
        if (disabled) return;
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch (err) {
          // not a real pointer (tests) or capture not supported: dragging still works inside the element
        }
        start.current = { id, x: e.clientX, y: e.clientY };
        moved.current = false;
        setActive({ id, dx: 0, dy: 0 });
        if (onGrab) onGrab(id);
      },
      onPointerMove: (e) => {
        if (!start.current || start.current.id !== id) return;
        const dx = e.clientX - start.current.x;
        const dy = e.clientY - start.current.y;
        if (Math.abs(dx) + Math.abs(dy) > 6) moved.current = true;
        setActive({ id, dx, dy });
      },
      onPointerUp: (e) => {
        if (!start.current || start.current.id !== id) return;
        start.current = null;
        setActive(null);
        if (onRelease) onRelease(id);
        if (!moved.current) {
          // a tap: choose this piece, then tap a target
          setPicked((p) => (p === id ? null : id));
          playSound('pop');
          return;
        }
        const target = findTarget(e.clientX, e.clientY);
        if (target) onDrop(id, target);
        else playSound('boing');
      },
      onPointerCancel: () => {
        start.current = null;
        setActive(null);
        if (onRelease) onRelease(id);
      },
      onKeyDown: (e) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setPicked((p) => (p === id ? null : id));
        }
      },
      tabIndex: disabled ? -1 : 0,
      role: 'button',
      'aria-pressed': picked === id,
    }),
    [onDrop, onGrab, onRelease, picked]
  );

  const targetProps = useCallback(
    (id) => ({
      ref: (el) => {
        if (el) targets.current.set(id, el);
        else targets.current.delete(id);
      },
      onClick: () => {
        if (picked) {
          const p = picked;
          setPicked(null);
          onDrop(p, id);
        }
      },
      'data-ready': picked ? 'true' : undefined,
    }),
    [picked, onDrop]
  );

  const style = (id) => (active && active.id === id ? { transform: `translate(${active.dx}px, ${active.dy}px) scale(1.08)`, zIndex: 20, transition: 'none', cursor: 'grabbing' } : undefined);

  return { pieceProps, targetProps, style, dragging: active ? active.id : null, picked, setPicked };
}
