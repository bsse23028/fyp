// ONBOARDING - the 4-step intro, in the same layout as Log in: a brand panel whose colour and picture change with
// each step (lavender, peach, mint, sky), and one calm column with the progress bars, "Step 1 of 4", the title, the text,
// "Not a replacement for your therapist" and Back / Next. The last step has Create my account, "Explore KidBuddy first"
// (look around without an account), a "Log in" link and a small Back. Skip jumps to that last step. The ← → keys move between steps too.

import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { translate } from '../../i18n/translate';
import { useLanguage } from '../../context/LanguageContext';
import { useChild } from '../../context/ChildContext';
import { KEYS, saveData } from '../../utils/misc';
import { Button } from '../../components/ui';
import Icon from '../../components/Icon';
import EntryShell, { OrbitScene, PlanScene, ShieldScene, TabletScene } from '../../components/EntryShell';

export const ONBOARDING_CARDS = [
  {
    title: 'Your therapist’s plan, practised at home',
    copy: 'Turn recommendations into simple, repeatable activities that fit naturally into family life.',
    scene: <PlanScene />,
    bunny: true,
  },
  {
    title: 'Fun activities that adapt to your child',
    copy: 'Reading, speech, feelings, numbers and routines—all shaped around your child’s goals and pace.',
    scene: <OrbitScene />,
  },
  {
    title: 'A safe space where you stay in control',
    copy: 'You choose the activities, permissions and pace. Child Mode stays focused, calm and ad-free.',
    scene: <ShieldScene />,
    bunny: true,
  },
  {
    // the last step: look around BEFORE signing up (Explore KidBuddy = Preview mode, nothing is saved), like the app
    title: 'Try KidBuddy first',
    copy: 'See exactly what your child will see. Play as Buddy, our demo child. No account needed, nothing is saved.',
    scene: <TabletScene />,
    bunny: true,
    explore: true,
  },
];

export default function OnboardingPage() {
  useLanguage();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { startPreview, endPreview } = useChild();
  const last = ONBOARDING_CARDS.length - 1;
  // back from "Explore KidBuddy": open on the last step (location.state.startAtLast)
  const [index, setIndex] = useState(state && state.startAtLast ? last : 0);

  // coming back from Explore KidBuddy (or opening the intro): the preview is over
  useEffect(() => {
    endPreview();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Explore KidBuddy before signing up: Child Mode with the demo child Buddy. Leaving it brings the parent back here.
  function explore() {
    saveData(KEYS.explored, true); // the Dashboard will not show its "New here?" card again
    startPreview();
    navigate('/child');
  }

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
  const isLast = index === last;
  return (
    <EntryShell
      theme={index + 1}
      scene={card.scene}
      bunny={card.bunny}
      corner={!isLast && <button type="button" className="es-skip" onClick={() => setIndex(last)}>{translate('Skip')}</button>}
    >
      <div className="es-prog" role="tablist" aria-label={translate('Intro cards')}>
        {ONBOARDING_CARDS.map((c, i) => (
          <button key={c.title} type="button" role="tab" aria-selected={i === index} aria-label={translate('Step {n}', { n: i + 1 })} className={i <= index ? 'on' : ''} onClick={() => setIndex(i)}>
            <i />
          </button>
        ))}
      </div>
      <div key={index} className="es-body">
        <span className="es-step">{translate('Step {n} of {total}', { n: index + 1, total: ONBOARDING_CARDS.length })}</span>
        <h1>{translate(card.title)}</h1>
        <p className="es-sub">{translate(card.copy)}</p>
        <span className="pill-note">
          <Icon name="shield-check-outline" size={16} />
          {translate('Not a replacement for your therapist')}
        </span>
        {isLast ? (
          <>
            <div className="es-stack">
              <Button size="lg" iconEnd="arrow-right" onClick={() => navigate('/signup')}>Create my account</Button>
              <Button variant="secondary" icon="eye-outline" size="lg" onClick={explore}>Explore KidBuddy first</Button>
            </div>
            <p className="es-line">
              {translate('Already have an account?')} <Link to="/login" className="link">{translate('Log in')}</Link>
            </p>
            <p className="es-line">
              <button type="button" className="link" onClick={() => setIndex(index - 1)}>{translate('Back')}</button>
            </p>
          </>
        ) : (
          <div className="es-row2">
            <Button variant="secondary" icon="arrow-left" className={`flip-icon${index === 0 ? ' es-dim' : ''}`} size="lg" onClick={() => (index === 0 ? navigate('/') : setIndex(index - 1))}>Back</Button>
            <Button iconEnd="arrow-right" size="lg" onClick={() => setIndex(index + 1)}>Next</Button>
          </div>
        )}
      </div>
    </EntryShell>
  );
}
