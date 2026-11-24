// FORGOT PASSWORD - step 1 of 3: the account email -> a 6-digit code is sent.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { translate } from '../../i18n/translate';
import { emailError } from '../../utils/validation';
import { AuthHeading } from '../../layouts/Layouts';
import { Button, FormError, TextField } from '../../components/ui';
import Icon from '../../components/Icon';

export default function ForgotPasswordPage() {
  const { startPasswordReset } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const emailProblem = emailError(email);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setFormError('');
    if (emailProblem) return;
    setLoading(true);
    try {
      await startPasswordReset(email);
      navigate('/reset-code', { state: { email: email.trim() } });
    } catch (err) {
      setFormError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="auth-form">
      <AuthHeading icon="key-outline" title="Forgot your password?" subtitle="Enter your account email and we’ll send a 6-digit code." />
      <TextField label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" error={submitted ? emailProblem : ''} autoFocus />
      <FormError message={formError} />
      <Button type="submit" size="lg" block loading={loading} iconEnd="arrow-right">Send code</Button>
      <Link to="/login" className="back-link">
        <Icon name="arrow-left" size={16} className="ico flip-rtl" />
        {translate('Back to log in')}
      </Link>
    </form>
  );
}
