// PERMISSIONS - asked ONCE, right after the account is created: what Camera and Microphone are used for,
// the activities that use them, "Allow Camera & Microphone" or "Skip for now". The browser shows its own prompt.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { translate } from '../../i18n/translate';
import { useLanguage } from '../../context/LanguageContext';
import { KEYS, saveData } from '../../utils/misc';
import { Badge, Button, PageHeader } from '../../components/ui';
import Icon from '../../components/Icon';

const CAMERA_ROWS = [
  ['What we capture', 'Short clips during reading and emotion activities.'],
  ['How it is stored', 'Processed on-device only. Never uploaded or shared.'],
  ['How to turn off', 'In your browser’s site settings, any time.'],
];
const MICROPHONE_ROWS = [
  ['What we capture', 'Voice recordings during reading-aloud and pronunciation activities.'],
  ['How it is stored', 'Analysed instantly on-device; audio deleted within 60 seconds.'],
  ['How to turn off', 'In your browser’s site settings, any time.'],
];
const SENSOR_MODULES = [
  ['Read-Along', 'Microphone'],
  ['Sounds', 'Camera + microphone'],
  ['Mirror the Emotion', 'Camera'],
  ['Camera Counting', 'Camera'],
];

// Asks the browser for camera + microphone, then switches the devices off again straight away.
export async function askBrowserPermissions() {
  const result = { asked: true, camera: false, microphone: false };
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return result;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    stream.getTracks().forEach((track) => track.stop());
    return { asked: true, camera: true, microphone: true };
  } catch (error) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return { asked: true, camera: false, microphone: true };
    } catch (e) {
      return result;
    }
  }
}

function PermissionCard({ icon, title, rows }) {
  return (
    <section className="panel panel-pad perm-card">
      <h2><span className="ico-tile"><Icon name={icon} size={20} /></span>{translate(title)}</h2>
      <dl>
        {rows.map(([label, text]) => (
          <div key={label}>
            <dt>{translate(label)}</dt>
            <dd>{translate(text)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function PermissionsPage() {
  useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  function finish(result) {
    saveData(KEYS.permissions, result);
    navigate('/children/new', { replace: true });
  }

  async function handleAllow() {
    setLoading(true);
    finish(await askBrowserPermissions());
  }

  return (
    <div className="setup-page">
      <PageHeader title="Permissions" subtitle="KidBuddy needs your permission before using these features." />
      <div className="perm-grid">
        <PermissionCard icon="camera-outline" title="Camera" rows={CAMERA_ROWS} />
        <PermissionCard icon="microphone-outline" title="Microphone" rows={MICROPHONE_ROWS} />
      </div>
      <section className="panel">
        <div className="panel-head"><h2>{translate('Activities using sensors')}</h2></div>
        <div className="list">
          {SENSOR_MODULES.map(([module, sensor]) => (
            <div key={module} className="list-row">
              <span className="lr-main"><span className="lr-title">{translate(module)}</span></span>
              <span className="lr-end"><Badge tone="neutral">{translate(sensor)}</Badge></span>
            </div>
          ))}
        </div>
      </section>
      <div className="callout">
        <Icon name="lock-outline" size={20} />
        <p className="small">{translate('We ask only once, in this browser. If you change your mind, use your browser’s site settings. We never sell or share your child’s data with third parties.')}</p>
      </div>
      <div className="form-actions">
        <Button variant="ghost" onClick={() => finish({ asked: true, camera: false, microphone: false })}>Skip for now (some features will be unavailable)</Button>
        <Button onClick={handleAllow} loading={loading} icon="check">Allow Camera & Microphone</Button>
      </div>
    </div>
  );
}
