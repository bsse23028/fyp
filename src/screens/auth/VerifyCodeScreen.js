// VERIFY CODE SCREEN - "Check your email" with the six code boxes.
//
// This is a SHARED screen. Two real screens use it with different text
// and a different next step:
//   EmailVerificationScreen  (after sign-up)
//   PasswordOtpScreen        (after "Forgot password")
//
// Props it receives from them:
//   subtitle     - the grey sentence under "Check your email"
//   buttonLabel  - "Verify Email" or "Verify Code"
//   email        - where the code was sent (used by "Resend code")
//   onBack       - what the back button does
//   onVerify     - async function(code). It should THROW an Error when the
//                  code is wrong; this screen shows that error message.

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import BackButton from '../../shared/components/BackButton';
import AuthHeading from '../../shared/components/AuthHeading';
import OtpInput from '../../shared/components/OtpInput';
import Button from '../../shared/components/Button';
import FormError from '../../shared/components/FormError';
import { useAuth } from '../../app/context/AuthContext';
import { globalStyles } from '../../shared/theme/globalStyles';
import { COLORS, FONTS } from '../../shared/theme/theme';

export default function VerifyCodeScreen({ subtitle, buttonLabel, email, onBack, onVerify }) {
  const { resendCode } = useAuth();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(''); // "A new code has been sent."
  const [loading, setLoading] = useState(false);

  function handleChange(newCode) {
    setCode(newCode);
    setError(''); // clear the old error as soon as the parent types again
    setNotice('');
  }

  async function handleVerify() {
    if (code.length < 6) {
      setError('Enter the 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      await onVerify(code);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // always stop the spinner, even after moving to the next screen
    }
  }

  function handleResend() {
    resendCode(email);
    setCode('');
    setError('');
    setNotice('A new code has been sent.');
  }

  return (
    <Screen scroll footerMascot>
      <View style={styles.body}>
        <View style={styles.back}>
          <BackButton onPress={onBack} />
        </View>

        <AuthHeading title="Check your email" subtitle={subtitle} />

        <View style={styles.otp}>
          <OtpInput value={code} onChange={handleChange} />
        </View>

        <FormError message={error} style={styles.message} />
        {notice && !error ? <Text style={[styles.notice, styles.message]}>{notice}</Text> : null}

        <Button title={buttonLabel} onPress={handleVerify} loading={loading} style={styles.button} />

        <Text style={[globalStyles.centerText, styles.resend]}>
          Didn’t receive it?{' '}
          <Text style={globalStyles.link} onPress={handleResend}>
            Resend code
          </Text>
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  back: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 22,
  },
  otp: {
    marginTop: 22,
  },
  message: {
    marginTop: 14,
  },
  notice: {
    fontFamily: FONTS.interMedium,
    fontSize: 13,
    color: COLORS.success,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
  },
  resend: {
    marginTop: 20,
  },
});
