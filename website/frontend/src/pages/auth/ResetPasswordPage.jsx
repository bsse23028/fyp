// RESET PASSWORD - step 3 of 3: new password + confirm. The server refuses a password used before and
// logs out every device; then the card turns into "Password reset" with Back to log in.

import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { translate } from '../../i18n/translate';
import { passwordError } from '../../utils/validation';
import { AuthHeading } from '../../layouts/Layouts';
import { Button, FormError, PasswordRules, TextField } from '../../components/ui';
import Icon from '../../components/Icon';

export default function ResetPasswordPage() {
  const { state } = useLocation();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmValue, setConfirmValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!done && (!state || !state.verified)) return <Navigate to="/forgot-password" replace />;

  const passwordProblem = passwordError(password);
  const confirmProblem = confirmValue === password ? '' : 'Passwords do not match.';

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setFormError('');
    if (passwordProblem || confirmProblem) return;
    setLoading(true);
    try {
      await resetPassword(password);
      setDone(true);
    } catch (err) {
      setFormError(err.message);
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="auth-form" role="status">
        <AuthHeading icon="check-circle-outline" title="Password reset" subtitle="Your password has been updated. You can now log in." />
        <div className="success-art"><Icon name="check-circle" size={66} /></div>
        <Button size="lg" block iconEnd="arrow-right" onClick={() => navigate('/login', { replace: true })}>Back to log in</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="auth-form">
      <AuthHeading icon="lock-outline" title="Create a new password" subtitle="Choose a password you haven’t used before." />
      <div>
        <TextField label="New password" type="password" value={password} onChange={setPassword} placeholder="Enter a new password" autoComplete="new-password" error={submitted ? passwordProblem : ''} maxLength={72} autoFocus />
        <PasswordRules password={password} />
      </div>
      <TextField label="Confirm password" type="password" value={confirmValue} onChange={setConfirmValue} placeholder="Enter it again" autoComplete="new-password" error={submitted ? confirmProblem : ''} maxLength={72} />
      <FormError message={formError} />
      <Button type="submit" size="lg" block loading={loading} iconEnd="arrow-right">Reset password</Button>
      <Link to="/login" className="back-link">
        <Icon name="arrow-left" size={16} className="ico flip-rtl" />
        {translate('Back to log in')}
      </Link>
    </form>
  );
}
