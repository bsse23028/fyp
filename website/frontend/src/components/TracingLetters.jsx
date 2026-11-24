// TRACING LETTERS - the website's signature artwork: big letters drawn as dashed tracing guides
// (the same thing a child follows on a worksheet), with start dots and one letter being "drawn" in ink.
//   <TracingLetters />                          the decorative panel used on the auth pages
//   <TraceLetter letter="b" drawn={n} onClick /> one tappable letter (landing page hero)

export default function TracingLetters() {
  return (
    <svg className="tracing-art" viewBox="0 0 520 360" role="presentation" focusable="false">
      <g className="trace-lines">
        <line x1="0" x2="520" y1="86" y2="86" />
        <line x1="0" x2="520" y1="178" y2="178" className="mid" />
        <line x1="0" x2="520" y1="270" y2="270" />
      </g>
      <text x="18" y="270" className="trace-guide">A</text>
      <text x="18" y="270" className="trace-ink">A</text>
      <text x="230" y="270" className="trace-guide">a</text>
      <text x="370" y="270" className="trace-guide soft">b</text>
      <circle cx="104" cy="98" r="9" className="trace-dot" />
      <circle cx="292" cy="196" r="9" className="trace-dot" />
      <circle cx="394" cy="98" r="9" className="trace-dot soft" />
    </svg>
  );
}

export function TraceLetter({ letter, drawing, onClick, label }) {
  return (
    <button type="button" className={`trace-letter${drawing ? ' drawing' : ''}`} onClick={onClick} aria-label={label}>
      <svg viewBox="0 0 300 300" aria-hidden="true" focusable="false">
        <g className="trace-lines">
          <line x1="0" x2="300" y1="70" y2="70" />
          <line x1="0" x2="300" y1="160" y2="160" className="mid" />
          <line x1="0" x2="300" y1="250" y2="250" />
        </g>
        <text x="150" y="250" textAnchor="middle" className="trace-guide">{letter}</text>
        <text key={`${letter}-${drawing}`} x="150" y="250" textAnchor="middle" className="trace-ink live">{letter}</text>
      </svg>
    </button>
  );
}
