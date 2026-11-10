// CODE STEP - the "type the 6-digit code from your email" part used when a
// parent changes the password or the PIN.
//
//   <CodeStep
//     email={user.email}
//     buttonLabel="Verify and save"
//     onVerify={async (code) => { ... }}   // THROW an Error when the code is wrong
//     onCancel={() => ...}
//   />

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Text from './AppText';
import OtpInput from './OtpInput';
import Button from './Button';
import FormError from './FormError';
import { useAuth } from '../../app/context/AuthContext';
import { globalStyles } from '../theme/globalStyles';
import { COLORS, FONTS } from '../theme/theme';

export default function CodeStep({ email, buttonLabel, onVerify, onCancel }) {
  const { resendCode } = useAuth();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(newCode) {
    setCode(newCode);
    setError('');
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
      setLoading(false);
    }
  }

  function handleResend() {
    resendCode(email);
    setCode('');
    setError('');
    setNotice('A new code has been sent.');
  }

  return (
    <View>
      <Text style={globalStyles.subheading}>Enter the 6-digit code sent to {email}.</Text>

      <View style={styles.otp}>
        <OtpInput value={code} onChange={handleChange} />
      </View>

      <FormError message={error} style={styles.message} />
      {notice && !error ? <Text style={[styles.notice, styles.message]}>{notice}</Text> : null}

      <Button title={buttonLabel} onPress={handleVerify} loading={loading} style={styles.button} />
      <Button title="Cancel" variant="secondary" onPress={onCancel} style={styles.cancel} />

      <Text style={[globalStyles.centerText, styles.resend]}>
        Didn’t receive it?{' '}
        <Text style={globalStyles.link} onPress={handleResend}>
          Resend code
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  cancel: {
    marginTop: 10,
  },
  resend: {
    marginTop: 18,
  },
});
