// EMAIL VERIFICATION SCREEN - step 2 of sign-up.
// Uses the shared VerifyCodeScreen. When the code is right the account is
// created. Then the parent is asked ONCE for camera + microphone (Permissions),
// and after that creates the child profile. (If this phone was already asked
// for an earlier account, Permissions is skipped.)
//
// Route params: { email }
// Props: { navigation, route }

import React from 'react';
import VerifyCodeScreen from './VerifyCodeScreen';
import { useAuth } from '../../app/context/AuthContext';
import { useDevice } from '../../app/context/DeviceContext';
import { getParentStartScreen, goToStart } from '../../app/navigation/helpers';

export default function EmailVerificationScreen({ navigation, route }) {
  const { email } = route.params;
  const { finishSignUp } = useAuth();
  const { permissions } = useDevice();

  async function handleVerify(code) {
    await finishSignUp(email, code); // throws if the code is wrong
    goToStart(navigation, getParentStartScreen([], permissions)); // new account = no child yet
  }

  return (
    <VerifyCodeScreen
      subtitle={`Enter the 6-digit code sent to ${email}.`}
      buttonLabel="Verify Email"
      email={email}
      onBack={() => navigation.goBack()}
      onVerify={handleVerify}
    />
  );
}
