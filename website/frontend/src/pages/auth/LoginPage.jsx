// LOG IN - the Figma "Log in to KidBuddy" card: email, password (eye toggle), Forgot password?, Log in,
// "New to KidBuddy? Create an account". A wrong login shows the red "We couldn't log you in" box.
// An account that was never verified gets a new code and goes to "Check your email".

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { translate } from '../../i18n/translate';
import { emailError } from '../../utils/validation';
import { AuthHeading } from '../../layouts/Layouts';
import { Button, TextField } from '../../components/ui';
import Icon from '../../components/Icon';

export default function LoginPage() {
  const { logIn, resendCode } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailProblem = emailError(email);
  const passwordProblem = password ? '' : 'Enter your password.';

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setFormError('');
    if (emailProblem || passwordProblem) return;
    setLoading(true);
    try {
      await logIn(email, password);
      navigate('/start', { replace: true });
    } catch (err) {
      setLoading(false);
      if (err.data && err.data.needsVerification) {
        try {
          await resendCode(email, 'signup');
        } catch (e) {
          // a code may have been sent less than a minute ago: "Resend code" is on the next page
        }
        navigate('/verify-email', { state: { email: email.trim(), fromLogin: true } });
        return;
      }
      setFormError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="auth-form">
      <AuthHeading title="Log in to KidBuddy" subtitle="Continue supporting your child’s practice." />
      {formError && (
        <div className="auth-error" role="alert">
          <Icon name="lock-outline" size={18} />
          <span>
            <strong>{translate('We couldn’t log you in')}</strong>
            {translate(formError)}
          </span>
        </div>
      )}
      <TextField label="Email address" type="email" icon="email-outline" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" error={submitted ? emailProblem : ''} autoFocus />
      <TextField
        label="Password"
        type="password"
        icon="lock-outline"
        showText
        labelEnd={<Link to="/forgot-password" className="link">{translate('Forgot password?')}</Link>}
        value={password}
        onChange={setPassword}
        placeholder="Enter your password"
        autoComplete="current-password"
        error={submitted ? passwordProblem : ''}
      />
      <Button type="submit" size="lg" block loading={loading} loadingText="Logging in…" iconEnd="arrow-right">Log in</Button>
      <p className="auth-note">
        <Icon name="information-outline" size={18} />
        {translate('Your child does not need a login. Profiles are managed from your parent account.')}
      </p>
      <p className="auth-switch">
        {translate('New to KidBuddy?')} <Link to="/signup" className="link">{translate('Create an account')}</Link>
      </p>
    </form>
  );
}
