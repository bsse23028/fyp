// UPDATE PIN - old PIN, new PIN, confirm. The shared API checks
// the old PIN itself (5 wrong tries lock it for 5 minutes).

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { PIN_FORMAT } from '../../utils/validation';
import { Page } from '../../layouts/Layouts';
import { Button, FormError, PageHeader, TextField } from '../../components/ui';

const digitsOnly = (text) => text.replace(/\D/g, '').slice(0, 4);

export default function UpdatePinPage() {
  const { changePin } = useAuth();
  const { alert } = useUI();
  const navigate = useNavigate();
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmValue, setConfirmValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const oldProblem = PIN_FORMAT.test(oldPin) ? '' : 'Enter your old 4-digit PIN.';
  const newProblem = PIN_FORMAT.test(newPin) ? '' : 'The new PIN must be 4 digits.';
  const confirmProblem = confirmValue === newPin ? '' : 'The PINs do not match.';

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setFormError('');
    if (oldProblem || newProblem || confirmProblem) return;
    if (oldPin === newPin) return setFormError('Choose a PIN you have not used before.');
    setLoading(true);
    try {
      await changePin(oldPin, newPin);
      await alert({ title: 'PIN updated', message: 'Use your new PIN to leave Child Mode.' });
      navigate('/parent/settings');
    } catch (err) {
      setFormError(err.message || 'Could not update PIN.');
    }
    setLoading(false);
  }

  const pinProps = { type: 'password', inputMode: 'numeric', maxLength: 4, autoComplete: 'off', placeholder: '4 digits', className: 'pin-field' };
  return (
    <Page narrow>
      <PageHeader title="Update PIN" subtitle="First we check it is really you." />
      <div className="form-page">
        <form onSubmit={handleSubmit} noValidate className="panel panel-pad form-stack">
          <TextField label="Old PIN" value={oldPin} onChange={(v) => setOldPin(digitsOnly(v))} error={submitted ? oldProblem : ''} autoFocus hint="Five wrong tries lock the PIN for 5 minutes." {...pinProps} />
          <div className="form-grid">
            <TextField label="New PIN" value={newPin} onChange={(v) => setNewPin(digitsOnly(v))} error={submitted ? newProblem : ''} {...pinProps} />
            <TextField label="Confirm new PIN" value={confirmValue} onChange={(v) => setConfirmValue(digitsOnly(v))} error={submitted ? confirmProblem : ''} {...pinProps} placeholder="Type it again" />
          </div>
          <FormError message={formError} />
          <div className="form-actions">
            <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" loading={loading}>Update PIN</Button>
          </div>
        </form>
      </div>
    </Page>
  );
}
