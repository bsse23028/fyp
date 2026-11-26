// VERIFY EMAIL - step 2 of sign-up. A right code makes the account active and logs the parent in;
// then Permissions (asked once per browser) and the first child profile.

import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VerifyCode from './VerifyCode';

export default function VerifyEmailPage() {
  const { state } = useLocation();
  const { finishSignUp } = useAuth();
  const navigate = useNavigate();
  const email = state && state.email;

  if (!email) return <Navigate to="/signup" replace />;

  async function handleVerify(code) {
    await finishSignUp(email, code);
    navigate('/start', { replace: true });
  }

  return (
    <VerifyCode
      subtitle="Enter the 6-digit code sent to {email}."
      params={{ email }}
      buttonLabel="Verify Email"
      email={email}
      purpose="signup"
      onVerify={handleVerify}
      back={state.fromLogin ? '/login' : '/signup'}
      backLabel={state.fromLogin ? 'Back to log in' : 'Change email'}
    />
  );
}
