// SIGN UP SCREEN - "Create your account" (parent details only).
//
// What it holds:
//   - state: name, email, password, `submitted`, formError, loading
//   - 3 inputs; the keyboard's "next" key moves name -> email -> password
//   - the password rules checklist (8+ characters, upper + lower case, number, special character)
//     and the privacy policy hint
//   - "Create Account" button:
//       1. check all three fields
//       2. startSignUp() (AuthContext) makes sure the email is new and
//          sends a 6-digit code
//       3. go to the EmailVerification screen
//   - "Log in" link -> Login screen
//
// Props: { navigation }

import React, { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import AuthHeading from '../../shared/components/AuthHeading';
import TextField from '../../shared/components/TextField';
import Button from '../../shared/components/Button';
import PasswordRules from '../../shared/components/PasswordRules';
import FormError from '../../shared/components/FormError';
import { useAuth } from '../../app/context/AuthContext';
import { goToLogIn } from '../../app/navigation/helpers';
import { emailError, nameError, passwordError } from '../../shared/utils/validation';
import { globalStyles } from '../../shared/theme/globalStyles';

export default function SignUpScreen({ navigation }) {
  const { startSignUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const nameProblem = nameError(name);
  const emailProblem = emailError(email);
  const passwordProblem = passwordError(password);

  async function handleCreateAccount() {
    setSubmitted(true);
    setFormError('');
    if (nameProblem || emailProblem || passwordProblem) return;

    setLoading(true);
    try {
      await startSignUp(name, email, password);
      setLoading(false);
      navigation.navigate('EmailVerification', { email: email.trim() });
    } catch (err) {
      setFormError(err.message);
      setLoading(false);
    }
  }

  return (
    <Screen scroll footerMascot>
      <View style={styles.body}>
        <AuthHeading title="Create your account" subtitle="Start with parent details. You’ll add your child next." />

        <TextField
          label="Your name"
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current && emailRef.current.focus()}
          error={submitted ? nameProblem : ''}
          style={styles.firstField}
        />

        <TextField
          label="Email address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@email.com"
          inputRef={emailRef}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current && passwordRef.current.focus()}
          error={submitted ? emailProblem : ''}
          style={globalStyles.fieldGap}
        />

        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Create a password"
          secureTextEntry
          inputRef={passwordRef}
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={handleCreateAccount}
          error={submitted ? passwordProblem : ''}
          style={globalStyles.fieldGap}
        />

        <PasswordRules password={password} style={styles.rules} />

        <Text style={[globalStyles.smallPrint, styles.hint]}>
          By continuing, you agree to the privacy policy and terms.
        </Text>

        <FormError message={formError} style={styles.formError} />

        <Button
          title="Create Account"
          onPress={handleCreateAccount}
          loading={loading}
          style={styles.button}
        />

        <Text style={[globalStyles.centerText, styles.switchText]}>
          Already have an account?{' '}
          <Text style={globalStyles.link} onPress={() => goToLogIn(navigation)}>
            Log in
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
  firstField: {
    marginTop: 20,
  },
  rules: {
    marginTop: 12,
  },
  hint: {
    marginTop: 12,
  },
  formError: {
    marginTop: 14,
  },
  button: {
    marginTop: 18,
  },
  switchText: {
    marginTop: 18,
  },
});
