// PASSWORD OTP SCREEN - step 2 of "Forgot password".
// Uses the shared VerifyCodeScreen. When the code is right the parent
// continues to "Set a new password".
//
// Route params: { email }
// Props: { navigation, route }

import React from 'react';
import VerifyCodeScreen from './VerifyCodeScreen';
import { useAuth } from '../../app/context/AuthContext';

export default function PasswordOtpScreen({ navigation, route }) {
  const { email } = route.params;
  const { verifyResetCode } = useAuth();

  async function handleVerify(code) {
    verifyResetCode(email, code); // throws if the code is wrong
    navigation.navigate('ResetPassword', { email });
  }

  return (
    <VerifyCodeScreen
      subtitle={`Enter the 6-digit reset code sent to ${email}.`}
      buttonLabel="Verify Code"
      email={email}
      onBack={() => navigation.goBack()}
      onVerify={handleVerify}
    />
  );
}
