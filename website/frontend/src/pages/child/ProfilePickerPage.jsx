// WHO'S PLAYING? - the Figma profile picker before Child Mode: one big card per child (tap = start),
// and "Back to Parent Mode" (asks for the Parent PIN, because the child may already be holding the device).

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import { useLanguage } from '../../context/LanguageContext';
import { translate } from '../../i18n/translate';
import { getAvatar } from '../../data/avatars';
import { ageText } from '../../utils/progress';
import { Button, EmptyState, Mascot, SpeakButton, Spinner } from '../../components/ui';
import Icon from '../../components/Icon';
import PinModal from '../../components/PinModal';

export default function ProfilePickerPage() {
  const { childProfiles, activeChild, enterChildMode } = useChild();
  useLanguage();
  const navigate = useNavigate();
  const { state } = useLocation();
  const askedId = state && state.childId;
  const startId = childProfiles.some((c) => c.id === askedId) ? askedId : activeChild && !activeChild.isDemo ? activeChild.id : childProfiles[0] ? childProfiles[0].id : null;
  const [selectedId, setSelectedId] = useState(startId);
  const [pinOpen, setPinOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleContinue(id) {
    const chosen = childProfiles.find((c) => c.id === (id || selectedId));
    if (!chosen || busy) return;
    setSelectedId(chosen.id);
    setBusy(true);
    const ok = await enterChildMode(chosen.id);
    setBusy(false);
    if (ok) navigate('/child', { replace: true });
  }

  return (
    <div className="who">
      <div className="who-head">
        <SpeakButton text="Who is playing?" />
        <h1>{translate('Who’s playing?')}</h1>
      </div>

      {childProfiles.length === 0 ? (
        <EmptyState mascot="rabbit" title="No child profiles yet" text="Add a child profile first. It takes about a minute." action={<Button to="/parent/children/new" icon="plus">Add a child</Button>} />
      ) : (
        <div className="who-grid" role="list" aria-label={translate('Who’s playing?')}>
          {childProfiles.map((child) => {
            const on = busy && child.id === selectedId;
            return (
              <button key={child.id} type="button" role="listitem" className={`who-tile${on ? ' on' : ''}`} style={{ '--tint': getAvatar(child.avatar).color }} onClick={() => handleContinue(child.id)} disabled={busy}>
                <span className="who-art">
                  <Mascot size={118} avatar={child.avatar} alt="" />
                  <i />
                </span>
                <strong className="who-name">{child.name}</strong>
                <small>{translate(ageText(child))}</small>
                {on && <Spinner />}
              </button>
            );
          })}
        </div>
      )}

      <button type="button" className="who-parent" onClick={() => setPinOpen(true)}>
        <Icon name="lock-outline" size={18} />
        {translate('Back to Parent Mode')}
      </button>
      <div className="who-buddy" aria-hidden="true"><Mascot avatar="rabbit" size={170} bob alt="" /></div>

      {pinOpen && (
        <PinModal
          onClose={() => setPinOpen(false)}
          onSuccess={() => {
            setPinOpen(false);
            navigate('/parent', { replace: true });
          }}
        />
      )}
    </div>
  );
}
