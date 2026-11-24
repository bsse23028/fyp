// MY BUDDY - the child picks their buddy (opened from their picture in the top bar): a big preview,
// the four buddies, "Save my buddy".
// The header logo shows the choice live; saving stores it on the child (so the phone shows it too).

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import { translate } from '../../i18n/translate';
import { getAvatar } from '../../data/avatars';
import { playSound } from '../../services/audio';
import { ChildTitle, Screen, useLogoAvatar } from '../../layouts/Layouts';
import { ChildInstruction, Mascot, Spinner } from '../../components/ui';
import { OptionsGate } from '../../components/forms';

export default function MyBuddyPage() {
  const { activeChild, updateChild, options } = useChild();
  const navigate = useNavigate();
  const [avatarId, setAvatarId] = useState(activeChild ? activeChild.avatar : 'rabbit');
  const [saving, setSaving] = useState(false);
  const chosen = getAvatar(avatarId);
  useLogoAvatar(avatarId);

  async function handleSave() {
    if (!activeChild) return navigate('/child');
    setSaving(true);
    const ok = await updateChild(activeChild.id, { avatar: avatarId });
    setSaving(false);
    if (ok) {
      playSound('tada');
      navigate('/child');
    }
  }

  return (
    <Screen kind="child" className="buddy-page">
      <ChildTitle title="My Buddy" back="/child" speakText="My Buddy. Pick the buddy you like" />
      <OptionsGate>
      <div className="buddy-layout">
        <div className="buddy-stage" style={{ '--tint': chosen.color }}>
          <Mascot size={210} avatar={avatarId} bob alt="" />
          <p className="buddy-stage-name">{translate(chosen.name)}</p>
        </div>
        <div className="buddy-side">
          <ChildInstruction text="Pick the buddy you like" />
          <div className="buddy-choices" role="radiogroup" aria-label={translate('Pick the buddy you like')}>
            {options.avatars.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                role="radio"
                aria-checked={avatar.id === avatarId}
                aria-label={translate('{name} buddy', { name: translate(avatar.name) })}
                className={`buddy-choice${avatar.id === avatarId ? ' on' : ''}`}
                style={{ '--tint': avatar.color }}
                onClick={() => {
                  setAvatarId(avatar.id);
                  playSound('pop');
                }}
              >
                <Mascot avatar={avatar.id} size={72} alt="" />
                <span>{translate(avatar.name)}</span>
              </button>
            ))}
          </div>
          <button type="button" className="kid-big-button" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner /> : translate('Save my buddy')}
          </button>
        </div>
      </div>
      </OptionsGate>
    </Screen>
  );
}
