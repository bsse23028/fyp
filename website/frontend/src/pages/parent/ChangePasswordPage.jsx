// CHANGE PASSWORD - two proofs:
//   step 1  old password, new password (rules), confirm -> "Send code" checks the old password, emails a code
//   step 2  the code -> the password is changed (other devices are logged out, this one stays in)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { translate } from '../../i18n/translate';
import { passwordError } from '../../utils/validation';
import { Page } from '../../layouts/Layouts';
import { Button, FormError, PageHeader, PasswordRules, TextField } from '../../components/ui';
import Icon from '../../components/Icon';
import { CodeStep } from '../../components/forms';

export default function ChangePasswordPage() {
  const { user, checkPassword, sendChangeCode, changePassword } = useAuth();
  const { alert } = useUI();
  const navigate = useNavigate();
  const [step, setStep] = useState('form');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmValue, setConfirmValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [loading, setLoading] = useState(false);

  const oldProblem = oldPassword ? '' : 'Enter your old password.';
  const newProblem = passwordError(newPassword);
  const confirmProblem = confirmValue === newPassword ? '' : 'Passwords do not match.';

  async function handleSendCode(event) {
    event.preventDefault();
    setSubmitted(true);
    setFormError('');
    if (oldProblem || newProblem || confirmProblem) return;
    setLoading(true);
    try {
      if (!(await checkPassword(oldPassword))) {
        setShowForgot(true);
        setFormError('Your old password is not right.');
      } else if (oldPassword === newPassword) {
        setFormError('Choose a password you have not used before.');
      } else {
        await sendChangeCode();
        setStep('code');
      }
    } catch (err) {
      setFormError(err.message);
    }
    setLoading(false);
  }

  async function handleVerify(code) {
    await changePassword(oldPassword, newPassword, code);
    await alert({ title: 'Password changed', message: 'Use your new password the next time you log in.' });
    navigate('/parent/account');
  }

  return (
    <Page narrow>
      <PageHeader title="Change password" subtitle="First we check it is really you." />
      <div className="form-page">
        <ol className="stepper inline" aria-label={translate('Steps')}>
          <li className={step === 'form' ? 'current' : 'done'}>{step === 'form' ? <span className="step-num">1</span> : <Icon name="check" size={14} />}{translate('Passwords')}</li>
          <li className={step === 'code' ? 'current' : ''}><span className="step-num">2</span>{translate('Email code')}</li>
        </ol>
        <div className="panel panel-pad">
          {step === 'form' ? (
            <form onSubmit={handleSendCode} noValidate className="form-stack">
              <TextField
                label="Old password"
                type="password"
                value={oldPassword}
                onChange={setOldPassword}
                placeholder="Your current password"
                autoComplete="current-password"
                error={submitted ? oldProblem : ''}
                hint={showForgot ? 'Don’t remember it? Log out and use “Forgot password?” on the Log In page.' : undefined}
                autoFocus
              />
              <div>
                <TextField label="New password" type="password" value={newPassword} onChange={setNewPassword} placeholder="New password" autoComplete="new-password" error={submitted ? newProblem : ''} maxLength={72} />
                <PasswordRules password={newPassword} style={{ marginTop: 12 }} />
              </div>
              <TextField label="Confirm password" type="password" value={confirmValue} onChange={setConfirmValue} placeholder="Repeat the new password" autoComplete="new-password" error={submitted ? confirmProblem : ''} maxLength={72} />
              <FormError message={formError} />
              <div className="form-actions">
                <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" loading={loading}>Send code</Button>
              </div>
            </form>
          ) : (
            <CodeStep email={user ? user.email : ''} purpose="change_password" buttonLabel="Verify and change password" onVerify={handleVerify} onCancel={() => navigate(-1)} />
          )}
        </div>
      </div>
    </Page>
  );
}
