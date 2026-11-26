// RESET CODE - step 2 of Forgot password (the app's PasswordOtpScreen). A right code lets the parent
// choose a new password; the short reset token stays in an httpOnly cookie on the website backend.

import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VerifyCode from './VerifyCode';

export default function ResetCodePage() {
  const { state } = useLocation();
  const { verifyResetCode } = useAuth();
  const navigate = useNavigate();
  const email = state && state.email;

  if (!email) return <Navigate to="/forgot-password" replace />;

  async function handleVerify(code) {
    await verifyResetCode(email, code);
    navigate('/reset-password', { state: { email, verified: true }, replace: true });
  }

  return (
    <VerifyCode
      subtitle="Enter the 6-digit reset code sent to {email}."
      params={{ email }}
      buttonLabel="Verify Code"
      email={email}
      purpose="reset_password"
      onVerify={handleVerify}
      back="/forgot-password"
      backLabel="Change email"
    />
  );
}
