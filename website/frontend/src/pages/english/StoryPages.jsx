// LETTER STORIES - short videos where a letter comes alive (the app's StoryListScreen + LetterStoryScreen).
// The videos are the app's own Remotion renders (public/media/videos/<letter>.mp4). The ABC song stops
// while a story plays; the video is muted when the sound switch is off.

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { translate } from '../../i18n/translate';
import { ALPHABET, getLetter, nextLetter } from '../../data/alphabetData';
import { isSoundEnabled, onSoundChange, playSound } from '../../services/audio';
import { ChildTitle } from '../../layouts/Layouts';
import { ChildInstruction } from '../../components/ui';
import Icon from '../../components/Icon';

const videoFor = (letter) => `/media/videos/${letter.toLowerCase()}.mp4`;

export function StoryListPage() {
  const navigate = useNavigate();
  return (
    <>
      <ChildTitle title="Letter stories" back="/child/english" speakText="Pick a story" />
      <ChildInstruction text="Pick a story" />
      <div className="kid-panel">
        <div className="letter-grid">
          {ALPHABET.map((item) => (
            <button key={item.letter} type="button" className="letter-tile" style={{ background: item.accent.pale, color: item.accent.deep }} onClick={() => { playSound('pop'); navigate(item.letter); }} aria-label={translate('Story of {letter}', { letter: item.letter })}>
              <span className="lt-char">{item.letter}</span>
              <span className="play-badge"><Icon name="play" size={18} color="#fff" /></span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export function LetterStoryPage() {
  const { letter } = useParams();
  const navigate = useNavigate();
  const item = getLetter((letter || 'A').toUpperCase());
  const next = nextLetter(item.letter);
  const videoRef = useRef(null);
  const [ended, setEnded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [muted, setMuted] = useState(!isSoundEnabled());

  useEffect(() => onSoundChange((on) => setMuted(!on)), []);
  useEffect(() => {
    setEnded(false);
    setFailed(false);
  }, [item.letter]);

  return (
    <>
      <ChildTitle title={translate('Story of {letter}', { letter: item.letter })} back="/child/english/stories" />
      <div className="story-stage">
        {failed ? (
          <div className="load-error">
            <p>{translate('This story could not be played.')}</p>
          </div>
        ) : (
          <video
            key={item.letter}
            ref={videoRef}
            className="story-video"
            src={videoFor(item.letter)}
            controls
            autoPlay
            playsInline
            muted={muted}
            onEnded={() => {
              setEnded(true);
              playSound('cheerBell');
            }}
            onError={() => setFailed(true)}
          />
        )}
        {ended && (
          <div className="result-actions">
            {next && (
              <button type="button" className="icon-button big" onClick={() => navigate(`/child/english/stories/${next.letter}`)} aria-label={translate('Next letter')}>
                <Icon name="arrow-right" size={34} />
              </button>
            )}
            <button type="button" className="icon-button big" onClick={() => { setEnded(false); videoRef.current && videoRef.current.play(); }} aria-label={translate('Play again')}>
              <Icon name="refresh" size={34} />
            </button>
            <button type="button" className="icon-button big" onClick={() => navigate('/child/english/stories')} aria-label={translate('All letters')}>
              <Icon name="view-grid" size={34} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
