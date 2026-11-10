// FORGOT PASSWORD SCREEN - parent types their email to get a 6-digit code.
//
// What it holds:
//   - back button, heading, one Email input
//   - state: email, `submitted`, formError, loading
//   - "Send Code" button:
//       1. check the email looks right
//       2. startPasswordReset() (AuthContext) makes sure the account exists
//          and sends a code
//       3. go to the PasswordOtp screen
//   - "Back to log in" link
//
// Props: { navigation }

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import BackButton from '../../shared/components/BackButton';
import AuthHeading from '../../shared/components/AuthHeading';
import TextField from '../../shared/components/TextField';
import Button from '../../shared/components/Button';
import FormError from '../../shared/components/FormError';
import { useAuth } from '../../app/context/AuthContext';
import { goToLogIn } from '../../app/navigation/helpers';
import { emailError } from '../../shared/utils/validation';
import { globalStyles } from '../../shared/theme/globalStyles';

export default function ForgotPasswordScreen({ navigation }) {
  const { startPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailProblem = emailError(email);

  async function handleSendCode() {
    setSubmitted(true);
    setFormError('');
    if (emailProblem) return;

    setLoading(true);
    try {
      await startPasswordReset(email);
      setLoading(false);
      navigation.navigate('PasswordOtp', { email: email.trim() });
    } catch (err) {
      setFormError(err.message);
      setLoading(false);
    }
  }

  return (
    <Screen scroll footerMascot>
      <View style={styles.body}>
        <View style={styles.back}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>

        <AuthHeading
          title="Forgot password?"
          subtitle="Enter your account email and we’ll send a 6-digit code."
        />

        <TextField
          label="Email address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="send"
          onSubmitEditing={handleSendCode}
          error={submitted ? emailProblem : ''}
          style={styles.field}
        />

        <FormError message={formError} style={styles.formError} />

        <Button title="Send Code" onPress={handleSendCode} loading={loading} style={styles.button} />

        <Text style={[globalStyles.link, styles.backToLogin]} onPress={() => goToLogIn(navigation)}>
          Back to log in
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
  field: {
    marginTop: 22,
  },
  formError: {
    marginTop: 14,
  },
  button: {
    marginTop: 20,
  },
  backToLogin: {
    marginTop: 22,
    textAlign: 'center',
  },
});
