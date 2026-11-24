// ONBOARDING - the 3-step intro, as in the Figma: an illustration per step on one side; on the other the
// logo + Skip, "Step 1 of 3", the title, the text, "Not a replacement for your therapist", the dots and
// Back / Next. The last step says "Create my account". The ← → keys move between steps too.

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { translate } from '../../i18n/translate';
import { useLanguage } from '../../context/LanguageContext';
import { BrandLogo, Button } from '../../components/ui';
import Icon from '../../components/Icon';
import EntryArt from '../../components/EntryArt';

export const ONBOARDING_CARDS = [
  {
    title: 'Your therapist’s plan, practised at home',
    copy: 'Turn recommendations into simple, repeatable activities that fit naturally into family life.',
    scene: 1,
  },
  {
    title: 'Fun activities that adapt to your child',
    copy: 'Reading, speech, feelings, numbers and routines—all shaped around your child’s goals and pace.',
    scene: 2,
  },
  {
    title: 'A safe space where you stay in control',
    copy: 'You choose the activities, permissions and pace. Child Mode stays focused, calm and ad-free.',
    scene: 3,
  },
];

const AREAS = [
  { icon: 'book-open-variant', label: 'Reading' },
  { icon: 'chat-outline', label: 'Speech' },
  { icon: 'heart-outline', label: 'Feelings' },
  { icon: 'numeric', label: 'Numbers' },
  { icon: 'format-list-checks', label: 'Routines' },
];

export default function OnboardingPage() {
  useLanguage();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const last = ONBOARDING_CARDS.length - 1;

  useEffect(() => {
    const rtl = () => document.documentElement.dir === 'rtl';
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setIndex((i) => Math.max(0, Math.min(last, i + (rtl() ? -1 : 1))));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, Math.min(last, i + (rtl() ? 1 : -1))));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [last]);

  const card = ONBOARDING_CARDS[index];
  return (
    <div className="entry-split onboarding">
      <EntryArt scene={card.scene} />
      <main id="main" className="welcome">
        <div className="onb-top">
          <Link to="/" aria-label="KidBuddy"><BrandLogo height={60} avatar="rabbit" /></Link>
          <Link to="/signup" className="link">{translate('Skip')}</Link>
        </div>
        <div key={index} className="welcome-copy onb-copy">
          <span className="kicker">{translate('Step {n} of 3', { n: index + 1 })}</span>
          <h1>{translate(card.title)}</h1>
          <p>{translate(card.copy)}</p>
          <span className="pill-note">
            <Icon name="shield-check-outline" size={16} />
            {translate('Not a replacement for your therapist')}
          </span>
          {index === 1 && (
            <div className="area-tiles">
              {AREAS.map((a) => (
                <span key={a.label}>
                  <Icon name={a.icon} size={20} />
                  {translate(a.label)}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="onb-bottom">
          <div className="dots" role="tablist" aria-label={translate('Intro cards')}>
            {ONBOARDING_CARDS.map((c, i) => (
              <button key={c.title} type="button" role="tab" aria-selected={i === index} aria-label={translate('Step {n}', { n: i + 1 })} className={i === index ? 'on' : ''} onClick={() => setIndex(i)} />
            ))}
          </div>
          <div className="onb-buttons">
            <Button variant="secondary" icon="arrow-left" className="flip-icon" onClick={() => (index === 0 ? navigate('/') : setIndex(index - 1))}>Back</Button>
            {index < last ? (
              <Button iconEnd="arrow-right" onClick={() => setIndex(index + 1)}>Next</Button>
            ) : (
              <Button iconEnd="arrow-right" onClick={() => navigate('/signup')}>Create my account</Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
