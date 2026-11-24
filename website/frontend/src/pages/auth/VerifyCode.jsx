// VERIFY CODE - "Check your email" with the six code boxes (sign-up and password reset share it).
//   onVerify(code) must THROW when the code is wrong; its message is shown here.
//   The code is sent automatically once all six digits are typed or pasted.

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { translate } from '../../i18n/translate';
import { AuthHeading } from '../../layouts/Layouts';
import { Button, FormError, FormNotice, OtpInput } from '../../components/ui';

const RESEND_WAIT = 60; // seconds before "Resend code" can be used again

export default function VerifyCode({ subtitle, params, buttonLabel, email, purpose, onVerify, back, backLabel }) {
  const { resendCode } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [wait, setWait] = useState(RESEND_WAIT);
  const busy = useRef(false);

  useEffect(() => {
    if (wait <= 0) return undefined;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function submit(value) {
    if (busy.current) return;
    if (value.length < 6) return setError('Enter the 6-digit code.');
    busy.current = true;
    setLoading(true);
    try {
      await onVerify(value);
    } catch (err) {
      setError(err.message);
    }
    busy.current = false;
    setLoading(false);
  }

  async function handleResend() {
    setCode('');
    setError('');
    setNotice('A new code has been sent.');
    setWait(RESEND_WAIT);
    try {
      await resendCode(email, purpose);
    } catch (err) {
      setNotice('');
      setError(err.message);
    }
  }

  const clock = `${Math.floor(wait / 60)}:${String(wait % 60).padStart(2, '0')}`;
  return (
    <form
      className="auth-form"
      onSubmit={(event) => {
        event.preventDefault();
        submit(code);
      }}
    >
      <AuthHeading icon="email-outline" title="Check your email" subtitle={subtitle} params={params} />
      <OtpInput
        value={code}
        error={Boolean(error)}
        onChange={(value) => {
          setCode(value);
          setError('');
          setNotice('');
          if (value.length === 6) submit(value);
        }}
      />
      <FormError message={error} />
      {!error && <FormNotice message={notice} />}
      <Button type="submit" size="lg" block loading={loading}>{buttonLabel}</Button>
      <div className="verify-links">
        <button type="button" className="link" disabled={wait > 0} onClick={handleResend}>
          {wait > 0 ? translate('Resend code in {t}', { t: clock }) : translate('Resend code')}
        </button>
        <Link to={back} className="link">{translate(backLabel || 'Back')}</Link>
      </div>
      <p className="email-note">{translate('Check your spam folder if it is not in your inbox.')}</p>
    </form>
  );
}
