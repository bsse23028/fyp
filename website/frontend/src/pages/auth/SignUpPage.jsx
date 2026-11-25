// SIGN UP - the Figma 'Create your parent account' card: full name, email, password with the rule pills,
// Create account -> Check your email. (The app has no confirm-password box or terms tick, so neither does this.)

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { translate } from '../../i18n/translate';
import { emailError, nameError, passwordError } from '../../utils/validation';
import { AuthHeading } from '../../layouts/Layouts';
import { Button, FormError, PasswordRules, TextField } from '../../components/ui';

export default function SignUpPage() {
  const { startSignUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pwFocus, setPwFocus] = useState(false); // the password rules open when the field is used

  const nameProblem = name.trim().length > 100 ? 'Enter your name (100 characters at most).' : nameError(name);
  const emailProblem = emailError(email);
  const passwordProblem = passwordError(password);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setFormError('');
    if (nameProblem || emailProblem || passwordProblem) return;
    setLoading(true);
    try {
      await startSignUp(name, email, password);
      navigate('/verify-email', { state: { email: email.trim() } });
    } catch (err) {
      setFormError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="auth-form">
      <AuthHeading title="Create your parent account" subtitle="Set up your secure space to manage your child’s practice." />
      <TextField label="Full name" icon="account-outline" value={name} onChange={setName} placeholder="Full name" autoComplete="name" error={submitted ? nameProblem : ''} maxLength={100} autoFocus />
      <TextField label="Email address" type="email" icon="email-outline" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" error={submitted ? emailProblem : ''} />
      <div>
        <TextField
          label="Password"
          type="password"
          icon="lock-outline"
          showText
          value={password}
          onChange={setPassword}
          placeholder="Create a password"
          autoComplete="new-password"
          error={submitted ? passwordProblem : ''}
          maxLength={72}
          onFocus={() => setPwFocus(true)}
          onBlur={() => setPwFocus(false)}
        />
        <PasswordRules password={password} calm open={pwFocus || password.length > 0 || (submitted && Boolean(passwordProblem))} />
      </div>
      <FormError message={formError} />
      <Button type="submit" size="lg" block loading={loading} loadingText="Creating account…" iconEnd="arrow-right">Create account</Button>
      <p className="small-print center-text">{translate('By continuing, you agree to the privacy policy and terms.')}</p>
      <p className="auth-switch">
        {translate('Already have an account?')} <Link to="/login" className="link">{translate('Log in')}</Link>
      </p>
    </form>
  );
}
