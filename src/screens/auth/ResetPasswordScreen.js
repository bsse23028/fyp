// RESET PASSWORD SCREEN - "Set a new password" (last step of the flow).
//
// What it holds:
//   - back button, heading
//   - state: password, confirm, `submitted`, formError, loading
//   - "New password" and "Confirm password" inputs
//   - the password rules checklist (see shared/components/PasswordRules.js)
//   - "Reset Password" button:
//       1. the password follows the rule and both boxes match
//       2. resetPassword() (AuthContext) saves it (and refuses an old one)
//       3. a pop-up says it worked, then the parent goes to Log In
//
// Route params: { email }
// Props: { navigation, route }

import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Screen from '../../shared/components/Screen';
import BackButton from '../../shared/components/BackButton';
import AuthHeading from '../../shared/components/AuthHeading';
import TextField from '../../shared/components/TextField';
import Button from '../../shared/components/Button';
import PasswordRules from '../../shared/components/PasswordRules';
import FormError from '../../shared/components/FormError';
import { useAuth } from '../../app/context/AuthContext';
import { goToLogIn } from '../../app/navigation/helpers';
import { translate } from '../../shared/i18n/translate';
import { passwordError } from '../../shared/utils/validation';
import { globalStyles } from '../../shared/theme/globalStyles';

export default function ResetPasswordScreen({ navigation, route }) {
  const { email } = route.params;
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const confirmRef = useRef(null);

  const passwordProblem = passwordError(password);
  const confirmProblem = confirm === password ? '' : 'Passwords do not match.';

  async function handleReset() {
    setSubmitted(true);
    setFormError('');
    if (passwordProblem || confirmProblem) return;

    setLoading(true);
    try {
      await resetPassword(email, password);
      setLoading(false);
      Alert.alert(translate('Password reset'), translate('Your password has been updated. You can now log in.'), [
        { text: translate('Log in'), onPress: () => goToLogIn(navigation) },
      ]);
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

        <AuthHeading title="Set a new password" subtitle="Choose a password you haven’t used before." />

        <TextField
          label="New password"
          value={password}
          onChangeText={setPassword}
          placeholder="New password"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current && confirmRef.current.focus()}
          error={submitted ? passwordProblem : ''}
          style={styles.firstField}
        />

        <TextField
          label="Confirm password"
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Repeat the password"
          secureTextEntry
          inputRef={confirmRef}
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={handleReset}
          error={submitted ? confirmProblem : ''}
          style={globalStyles.fieldGap}
        />

        <PasswordRules password={password} style={styles.hint} />

        <FormError message={formError} style={styles.formError} />

        <Button title="Reset Password" onPress={handleReset} loading={loading} style={styles.button} />
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
  firstField: {
    marginTop: 20,
  },
  hint: {
    marginTop: 14,
  },
  formError: {
    marginTop: 14,
  },
  button: {
    marginTop: 18,
  },
});
