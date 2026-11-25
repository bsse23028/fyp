// ALPHABET LIST - 26 letter tiles with the stars earned for each (the app's AlphabetListScreen).
// The next letter to learn glows; every letter is open. The A / a switch changes how they are drawn.

import { useNavigate } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import { translate } from '../../i18n/translate';
import { ALPHABET } from '../../data/alphabetData';
import { playSound, speak } from '../../services/audio';
import { ChildTitle } from '../../layouts/Layouts';
import { ChildInstruction } from '../../components/ui';
import { CaseToggle, showLetter, useLetterCase } from './common';

export default function AlphabetListPage() {
  const { activeChild, letterStars } = useChild();
  const [caseMode] = useLetterCase();
  const navigate = useNavigate();
  const stars = letterStars(activeChild ? activeChild.id : null);
  const next = ALPHABET.find((item) => !stars[item.letter]);

  return (
    <>
      <ChildTitle title="Alphabets" back="/child/english/activities/3" speakText="Pick a letter">
        <CaseToggle />
      </ChildTitle>
      <ChildInstruction text="Pick a letter" />
      <div className="kid-panel">
        <div className="letter-grid">
          {ALPHABET.map((item) => {
            const count = stars[item.letter] || 0;
            const glow = next && next.letter === item.letter;
            return (
              <button
                key={item.letter}
                type="button"
                className={`letter-tile${glow ? ' glow' : ''}`}
                style={{ background: item.accent.pale, color: item.accent.deep }}
                aria-label={translate('Letter {letter}, {n} of 3 stars', { letter: item.letter, n: count })}
                onClick={() => {
                  playSound('pop');
                  speak(item.nameSpeech);
                  navigate(item.letter);
                }}
              >
                <span className="lt-char">{showLetter(item, caseMode)}</span>
                <span className="lt-stars" aria-hidden="true">
                  {[1, 2, 3].map((n) => (
                    <span key={n} style={{ color: n <= count ? '#8a5a00' : '#4f5870' }}>{n <= count ? '★' : '☆'}</span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
