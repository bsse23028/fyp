// WELCOME (/) - the first page: the same layout as Log in (brand panel + one calm column).
//   panel   the logo, the bunny and kitty, the three promises
//   column  the headline, Get started (-> the intro) and Log in, "Are you a therapist? Coming soon" (a dialog, proposal FR-04),
//           "Not a replacement for your therapist" and the small print
// There is no splash screen any more: the branded loader (index.html / BootScreen) is the only thing shown while the app starts.
// A parent who is already logged in gets "Open Parent Mode"; a child in Child Mode goes back to /child.

import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChild } from '../../context/ChildContext';
import { useLanguage } from '../../context/LanguageContext';
import { useUI } from '../../context/UIContext';
import { translate } from '../../i18n/translate';
import { Button } from '../../components/ui';
import Icon from '../../components/Icon';
import EntryShell, { PanelArt } from '../../components/EntryShell';

const PROMISES = ['Ad-free', 'Parent-controlled', 'Follows your therapist’s plan'];

export default function LandingPage() {
  useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { childMode } = useChild();
  const { alert } = useUI();

  const therapistSoon = () => alert({ title: 'Coming soon', message: 'Therapist accounts are on the way. For now, parents can sign up and log in below.' });

  if (user && childMode) return <Navigate to="/child" replace />;

  return (
    <EntryShell theme={0} scene={<PanelArt />} promises={PROMISES} foot={translate('By continuing, you agree to the privacy policy and terms.')}>
      <h1>{translate('Practise together. Grow every day.')}</h1>
      <p className="es-sub">{translate('A safe, ad-free space where your child practises the exercises their therapist recommends.')}</p>
      <div className="es-stack">
        {user ? (
          <Button size="lg" iconEnd="arrow-right" onClick={() => navigate('/parent')}>Open Parent Mode</Button>
        ) : (
          <>
            <Button size="lg" iconEnd="arrow-right" onClick={() => navigate('/onboarding')}>Get started</Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/login')}>Log in</Button>
          </>
        )}
      </div>
      <p className="es-line">
        {translate('Are you a therapist?')}{' '}
        <button type="button" className="link" onClick={therapistSoon}>{translate('Coming soon')}</button>
      </p>
      <div className="es-center">
        <span className="pill-note">
          <Icon name="shield-check-outline" size={16} />
          {translate('Not a replacement for your therapist')}
        </span>
      </div>
    </EntryShell>
  );
}
