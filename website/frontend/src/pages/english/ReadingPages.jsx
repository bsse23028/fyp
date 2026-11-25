// READ ALONG - English > Sentences (the app's ReadingTopics, ReadingLevel, ReadingAlong, ReadingYourTurn
// and ReadingSummary screens). The topics, levels and sentences come from the DATABASE for the active
// child (built-in topics + the child's own custom topics); Preview mode uses the built-in file.
//
//   topics -> level -> Reading Time (the buddy reads, each word lights up with the voice; 🎤 = your turn)
//   -> Your turn (say the glowing word, "I said it"; "That was tricky" saves it as a struggle word)
//   -> next sentence ... -> Nice reading! (3 stars, saved ONCE on the server with a unique session id,
//   so a retry never counts the stars twice; the totals then show on Child Home and in Parent Progress)

import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import NothingOn from '../child/NothingOn';
import { useLanguage } from '../../context/LanguageContext';
import { useUI } from '../../context/UIContext';
import { translate } from '../../i18n/translate';
import { STARS_PER_SESSION, TINTS, findSentences, getSentence } from '../../data/readingData';
import { dayKey } from '../../utils/progress';
import { makeUuid } from '../../utils/misc';
import { cheer, playSound, say, speak, stopSpeaking } from '../../services/audio';
import { ChildTitle } from '../../layouts/Layouts';
import { Button, LoadError, Mascot, SpeakButton, Spinner, StarRow, ChildInstruction } from '../../components/ui';
import Icon from '../../components/Icon';
import { Confetti } from './common';

const SPEECH_RATE = 0.85;
const MS_PER_LETTER = 62;
const MS_PER_WORD = 80;
const WAVE_BARS = [3, 6, 14, 22, 30, 26, 18, 24, 16, 8, 4, 10, 6, 3];
const BASE = '/child/english/read';

function useReadingContent() {
  const { activeChild, topics, levels, readingState, fetchReadingContent } = useChild();
  const childId = activeChild ? activeChild.id : null;
  useEffect(() => {
    if (childId) fetchReadingContent(childId);
  }, [childId, fetchReadingContent]);
  return { topics, levels, ...readingState, retry: () => fetchReadingContent(childId, true) };
}

export function ReadingTopicsPage() {
  const navigate = useNavigate();
  const { topics, loading, error, retry } = useReadingContent();
  useLanguage();
  return (
    <>
      <ChildTitle title="Pick a topic" back="/child/english" speakText="Pick a topic. What do you want to read about?" />
      <ChildInstruction text="What do you want to read about?" />
      {loading && <div className="center"><Spinner /></div>}
      {error && <LoadError message={error} onRetry={retry} />}
      {!loading && !error && topics.length === 0 && <NothingOn />}
      {!loading && !error && topics.length > 0 && (
        <div className="tile-grid">
          {topics.map((topic) => (
            <button key={topic.id} type="button" className="pastel-tile topic-tile" style={{ background: TINTS[topic.tint] || TINTS.bluePale }} onClick={() => { playSound('pop'); navigate(`${BASE}/${topic.id}`); }}>
              <span className="emoji" style={{ fontSize: 54 }} aria-hidden="true">{topic.icon}</span>
              <span className="pt-title">{translate(topic.title)}</span>
              {topic.isCustom && <span className="soon-tag">{translate('Just for you')}</span>}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export function ReadingLevelPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { topics, levels, loading } = useReadingContent();
  const topic = topics.find((t) => t.id === topicId);
  if (loading) return <div className="center"><Spinner /></div>;
  if (!topic) return <Navigate to={BASE} replace />;

  return (
    <>
      <ChildTitle title="Pick a level" back={BASE} speakText="Pick a level. Easy, medium or hard." />
      <ChildInstruction text="How hard should it be?" />
      <div className="topic-row">
        <span className="emoji" aria-hidden="true">{topic.icon}</span>
        <strong>{translate(topic.title)}</strong>
      </div>
      <div className="level-list">
        {levels.map((level) => {
          const count = topic.levels[level.id] ? topic.levels[level.id].length : 0;
          return (
            <button key={level.id} type="button" className="level-card" style={{ background: TINTS[level.tint] }} disabled={count === 0} onClick={() => { playSound('pop'); navigate(`${BASE}/${topic.id}/${level.id}/0`); }}>
              <span className="level-stars" style={{ background: TINTS[level.color] }}>{'★'.repeat(level.stars)}</span>
              <span className="level-text">
                <strong>{translate(level.label)}</strong>
                <span>{translate(count === 1 ? '{n} sentence' : '{n} sentences', { n: count })}</span>
              </span>
              <span className="chevron">›</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function useSentence() {
  const { topicId, level, index } = useParams();
  const { language } = useLanguage();
  const { topics, loading } = useReadingContent();
  const sentences = findSentences(topics, topicId, level);
  const i = Math.max(0, Number(index) || 0);
  const topic = topics.find((t) => t.id === topicId);
  return { topicId, level, index: i, sentences, sentence: getSentence(sentences, i, language), language, loading, topic };
}

export function ReadingAlongPage() {
  const navigate = useNavigate();
  const { alert } = useUI();
  const { topicId, level, index, sentences, sentence, language, loading } = useSentence();
  const [lit, setLit] = useState(-1);
  const [reading, setReading] = useState(false);
  const runId = useRef(0);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  function stopReading() {
    runId.current += 1;
    clearTimers();
    stopSpeaking();
    setReading(false);
    setLit(-1);
  }

  function startReading() {
    stopReading();
    const id = runId.current;
    const words = sentence.words;
    const text = words.join(' ');
    const starts = [];
    let at = 0;
    words.forEach((w) => {
      starts.push(at);
      at += w.length + 1;
    });
    const times = words.map((w) => (w.replace(/[.,!?;:،؛؟۔"'()]/g, '').length * MS_PER_LETTER + MS_PER_WORD) / SPEECH_RATE);
    let followingVoice = false;
    let begun = false;
    const isCurrent = () => runId.current === id;

    const finish = () => {
      if (!isCurrent()) return;
      clearTimers();
      setReading(false);
      setLit(-1);
    };
    const begin = () => {
      if (begun || !isCurrent()) return;
      begun = true;
      setLit(0);
      let elapsed = 0;
      for (let i = 1; i < words.length; i++) {
        elapsed += times[i - 1];
        timers.current.push(setTimeout(() => isCurrent() && !followingVoice && setLit(i), elapsed));
      }
      timers.current.push(setTimeout(finish, elapsed + times[words.length - 1] + 2500));
    };

    setReading(true);
    say(text, {
      lang: language === 'ur' ? 'ur-PK' : 'en-US',
      rate: SPEECH_RATE,
      onStart: begin,
      onBoundary: (e) => {
        if (!isCurrent() || typeof e.charIndex !== 'number') return;
        begin();
        followingVoice = true;
        let w = 0;
        starts.forEach((s, i) => {
          if (s <= e.charIndex) w = i;
        });
        setLit(w);
      },
      onEnd: finish,
    });
    timers.current.push(setTimeout(begin, 450)); // some browsers never send onstart
  }

  useEffect(() => {
    if (loading || sentence.words.length === 0) return undefined;
    const t = setTimeout(startReading, 500);
    return () => {
      clearTimeout(t);
      runId.current += 1;
      clearTimers();
      stopSpeaking();
    };
  }, [index, language, loading, sentence.words.join(' ')]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="center"><Spinner /></div>;
  if (sentences.length === 0) return <Navigate to={BASE} replace />;

  async function handleSpeak() {
    stopReading();
    // Ask for the microphone the first time (the browser shows its own prompt).
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      } catch (e) {
        await alert({ title: 'Microphone is off', message: 'Your turn still works: say the word out loud, then tap “I said it”. A parent can allow the microphone in the browser’s site settings.' });
      }
    }
    navigate(`${BASE}/${topicId}/${level}/${index}/turn`);
  }

  // Next sentence: skip the child's turn for this one (the turn page is still the way to say the word and mark it tricky)
  function nextSentence() {
    stopReading();
    if (index >= sentences.length - 1) navigate(`${BASE}/${topicId}/${level}/done`, { replace: true });
    else navigate(`${BASE}/${topicId}/${level}/${index + 1}`);
  }

  return (
    <div className="reading-page">
      <div className="child-title-row">
        <button type="button" className="back-button" onClick={() => navigate(index === 0 ? `${BASE}/${topicId}` : -1)} aria-label={translate('Back')}>
          <Icon name="arrow-left" />
        </button>
        <h1>{translate('Reading Time')}</h1>
        <SpeakButton onClick={startReading} label="Read it again" />
      </div>
      <div className="reading-dots" aria-label={translate('Sentence {n} of {total}', { n: index + 1, total: sentences.length })}>
        {sentences.map((_, i) => <span key={i} className={i <= index ? 'on' : ''} />)}
      </div>
      <p className="reading-count">{translate('Sentence {n} of {total}', { n: index + 1, total: sentences.length })}</p>
      <div className="reading-card">
        <p className="reading-label">{translate('READ ALOUD:')}</p>
        <p className="reading-words" dir={language === 'ur' ? 'rtl' : 'ltr'} lang={language}>
          {sentence.words.map((w, i) => (
            <span key={i} className={i === lit ? 'lit' : ''}>{w}</span>
          ))}
        </p>
        <div className="wave" aria-hidden="true">
          {WAVE_BARS.map((h, i) => <span key={i} style={{ height: h, background: reading && i >= 3 && i <= 8 ? 'var(--lilac)' : 'var(--lilac-soft)' }} />)}
        </div>
        <div className="encourage">
          <Mascot size={56} alt="" />
          <span>{translate('Listen first, then it is your turn!')}</span>
        </div>
      </div>
      <div className="reading-actions">
        <div className="mic-wrap">
          <button type="button" className="reading-mic" onClick={handleSpeak} aria-label={translate('Tap to speak')}>
            <Icon name="microphone" size={46} color="#fff" />
          </button>
          <span>{translate('Tap to speak')}</span>
        </div>
        <Button variant="secondary" size="lg" className="next-sentence" iconEnd="arrow-right" onClick={nextSentence}>
          {index >= sentences.length - 1 ? 'Finish' : 'Next sentence'}
        </Button>
      </div>
    </div>
  );
}

export function ReadingYourTurnPage() {
  const navigate = useNavigate();
  const { activeChild, reportStruggleWord, isPreview } = useChild();
  const { toast } = useUI();
  const { topicId, level, index, sentences, sentence, loading, topic } = useSentence();
  const [reported, setReported] = useState(false);

  if (loading) return <div className="center"><Spinner /></div>;
  if (sentences.length === 0) return <Navigate to={BASE} replace />;

  const focusWord = (sentence.words[sentence.focus] || '').replace(/[.!?۔،,]/g, '');
  const isLast = index >= sentences.length - 1;

  function done() {
    cheer();
    if (isLast) navigate(`${BASE}/${topicId}/${level}/done`, { replace: true });
    else navigate(`${BASE}/${topicId}/${level}/${index + 1}`);
  }

  async function tricky() {
    setReported(true);
    playSound('twinkle');
    if (activeChild && !isPreview) {
      try {
        await reportStruggleWord(activeChild.id, focusWord, topic ? topic.id : undefined);
      } catch (err) {
        toast(err.message, 'error');
      }
    }
    speak(`Let's try ${focusWord} again later.`);
  }

  return (
    <div className="reading-page">
      <ChildTitle title="Your turn" back={-1} speakText="Your turn" />
      <p className="reading-count">{translate('Sentence {n} of {total}', { n: index + 1, total: sentences.length })}</p>
      <ChildInstruction text="Listen, then say the glowing word" />
      <div className="reading-card center">
        <p className="reading-words">
          {sentence.words.map((w, i) => (
            <span key={i} className={i === sentence.focus ? 'lit' : ''}>{w}</span>
          ))}
        </p>
        <SpeakButton text={focusWord} english big label="Hear the word" />
        <Mascot size={64} bob alt="" />
        <p className="try-text">{translate('Try “{word}” with me', { word: focusWord })}</p>
      </div>
      <div className="turn-actions">
        <Button size="lg" className="picker-continue" iconEnd="check" onClick={done}>I said it</Button>
        <button type="button" className="link-button" onClick={tricky} disabled={reported}>
          {translate(reported ? 'Saved for practice' : 'That was tricky')}
        </button>
      </div>
    </div>
  );
}

export function ReadingSummaryPage() {
  const { topicId, level } = useParams();
  const navigate = useNavigate();
  const { activeChild, addReadingResult } = useChild();
  const sent = useRef(false);
  const session = useRef(null);
  const [burst] = useState(1);

  useEffect(() => {
    if (sent.current || !activeChild) return;
    sent.current = true;
    // Made ONCE: "Retry" in the pop-up re-sends this same object (same clientSessionId).
    session.current = {
      childId: activeChild.id,
      clientSessionId: makeUuid(),
      stars: STARS_PER_SESSION,
      topicId,
      level: ['easy', 'medium', 'hard'].includes(level) ? level : 'easy',
      language: 'en',
      sessionDate: dayKey(),
    };
    addReadingResult(session.current);
    playSound('tada');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="reading-page center">
      <Confetti burstKey={burst} />
      <Mascot size={170} bob />
      <h1 className="page-title" style={{ margin: '14px 0 6px' }}>{translate('Nice reading!')}</h1>
      <p className="muted" style={{ fontSize: 20, fontWeight: 700 }}>{translate('You tried every sentence. Great job.')}</p>
      <StarRow filled={STARS_PER_SESSION} size={56} />
      <div className="finish-actions">
        <Button variant="secondary" size="lg" onClick={() => navigate(`${BASE}/${topicId}/${session.current ? session.current.level : level}/0`, { replace: true })}>Read again</Button>
        <Button size="lg" className="picker-continue" onClick={() => navigate(`${BASE}/${topicId}`, { replace: true })}>Finish</Button>
      </div>
    </div>
  );
}
