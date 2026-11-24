// WELCOME (/) - the first page, as in the Figma "Entry Flow":
//   splash   the logo + "Practise together. Grow every day." with three calm dots; shown ONCE per browser,
//            it moves on by itself after 2 seconds (or on a click / key)
//   welcome  (also a "Sign up / Log in as Therapist" button: Coming soon, proposal FR-04) the sofa illustration on one side; on the other the language switch, the logo, the headline,
//            Get Started (-> the intro) and Log In, "Not a replacement for your therapist" and three promises
// A parent who is already logged in gets "Open Parent Mode"; a child in Child Mode goes back to /child.

import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChild } from '../../context/ChildContext';
import { useLanguage } from '../../context/LanguageContext';
import { useUI } from '../../context/UIContext';
import { translate } from '../../i18n/translate';
import { KEYS, loadData, saveData } from '../../utils/misc';
import { LanguageToggle } from '../../layouts/Layouts';
import { BrandLogo, Button } from '../../components/ui';
import Icon from '../../components/Icon';
import EntryArt from '../../components/EntryArt';

const SPLASH_MS = 2000;
const PROMISES = ['Ad-free', 'Parent-controlled', 'Follows your therapist’s plan'];

function Splash({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, SPLASH_MS);
    const skip = () => onDone();
    document.addEventListener('keydown', skip);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', skip);
    };
  }, [onDone]);
  return (
    <main id="main" className="splash" onClick={onDone}>
      <i className="splash-shape one" />
      <i className="splash-shape two" />
      <BrandLogo height={150} avatar="rabbit" />
      <h1>{translate('Practise together. Grow every day.')}</h1>
      <div className="splash-dots" role="status" aria-label={translate('Loading')}>
        <i />
        <i />
        <i />
      </div>
    </main>
  );
}

export default function LandingPage() {
  useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { childMode } = useChild();
  const { alert } = useUI();
  const [splash, setSplash] = useState(() => !loadData(KEYS.introSeen, false));

  if (user && childMode) return <Navigate to="/child" replace />;

  if (splash && !user) {
    return (
      <Splash
        onDone={() => {
          saveData(KEYS.introSeen, true);
          setSplash(false);
        }}
      />
    );
  }

  return (
    <div className="entry-split">
      <EntryArt scene={0} />
      <main id="main" className="welcome">
        <div className="welcome-top">
          <button
            type="button"
            className="therapist-btn"
            onClick={() => alert({ title: 'Coming soon', message: 'Therapist accounts are on the way. For now, parents can sign up and log in below.' })}
          >
            <Icon name="account-heart-outline" size={18} />
            <span>{translate('Sign up / Log in as Therapist')}</span>
            <em>{translate('Soon')}</em>
          </button>
          <LanguageToggle compact />
        </div>
        <span className="welcome-logo"><BrandLogo height={78} avatar="rabbit" /></span>
        <div className="welcome-copy">
          <span className="kicker">{translate('Made for families')}</span>
          <h1>{translate('Practise together. Grow every day.')}</h1>
          <p>{translate('A safe, ad-free space where your child practises the exercises their therapist recommends.')}</p>
          <div className="welcome-actions">
            {user ? (
              <Button size="lg" iconEnd="arrow-right" onClick={() => navigate('/parent')}>Open Parent Mode</Button>
            ) : (
              <>
                <Button size="lg" iconEnd="arrow-right" onClick={() => navigate('/onboarding')}>Get Started</Button>
                <Button size="lg" variant="secondary" onClick={() => navigate('/login')}>Log In</Button>
              </>
            )}
          </div>
          <span className="pill-note">
            <Icon name="shield-check-outline" size={16} />
            {translate('Not a replacement for your therapist')}
          </span>
          <div className="promises">
            {PROMISES.map((p) => (
              <span key={p}>
                <Icon name="check" size={14} />
                {translate(p)}
              </span>
            ))}
          </div>
        </div>
        <p className="welcome-foot">{translate('By continuing, you agree to the privacy policy and terms.')}</p>
      </main>
    </div>
  );
}
