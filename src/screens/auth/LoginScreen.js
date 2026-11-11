// LOGIN SCREEN - "Welcome back".
//
// What it holds:
//   - heading + subtitle
//   - state: email, password, one error message per field, one form error,
//     `submitted` (so field errors only appear after the first tap on Log In)
//     and `loading`
//   - Email + Password inputs (the border turns indigo while focused;
//     the "next" key on the keyboard jumps from email to password)
//   - "Forgot password?"  -> ForgotPassword screen
//   - "Log In" button:
//       1. check both fields are filled in correctly
//       2. logIn() (AuthContext) looks the account up
//       3. wrong details -> show "Incorrect email or password."
//       4. right details -> Child Home (or Create Child Profile for a new parent)
//   - "Create account" link -> SignUp screen
//   - info box + small Buddy at the bottom
//
// Props: { navigation }

import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import AuthHeading from '../../shared/components/AuthHeading';
import TextField from '../../shared/components/TextField';
import Button from '../../shared/components/Button';
import FormError from '../../shared/components/FormError';
import { useAuth } from '../../app/context/AuthContext';
import { useChild } from '../../app/store/useChild';
import { useDevice } from '../../app/context/DeviceContext';
import { getParentStartScreen, goToStart } from '../../app/navigation/helpers';
import { emailError } from '../../shared/utils/validation';
import { globalStyles } from '../../shared/theme/globalStyles';
import { COLORS, FONTS, RADIUS } from '../../shared/theme/theme';

export default function LoginScreen({ navigation }) {
  const { logIn } = useAuth();
  const { loadChildren } = useChild();
  const { permissions } = useDevice();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  // Lets the keyboard's "next" key move the cursor to the password box.
  const passwordRef = useRef(null);

  // Errors are worked out from the current values on every render.
  const emailProblem = emailError(email);
  const passwordProblem = password ? '' : 'Enter your password.';

  async function handleLogIn() {
    setSubmitted(true);
    setFormError('');
    if (emailProblem || passwordProblem) return; // field errors are now visible

    setLoading(true);
    try {
      await logIn(email, password);
      // Where to next? Child Home if this parent already has a child profile,
      // otherwise Create Child Profile (or Permissions if never asked on this phone).
      // The children come from the server; if it cannot be reached, the message is shown below.
      const kids = await loadChildren();
      goToStart(navigation, getParentStartScreen(kids, permissions));
    } catch (err) {
      setFormError(err.message);
      setLoading(false);
    }
  }

  return (
    <Screen scroll footerMascot>
      <View style={styles.body}>
        <AuthHeading title="Welcome back" subtitle="Log in to manage your child’s home practice." />

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
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current && passwordRef.current.focus()}
          error={submitted ? emailProblem : ''}
          style={styles.firstField}
        />

        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          secureTextEntry
          inputRef={passwordRef}
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={handleLogIn}
          error={submitted ? passwordProblem : ''}
          style={globalStyles.fieldGap}
        />

        <Pressable
          onPress={() => navigation.navigate('ForgotPassword')}
          hitSlop={10}
          style={styles.forgot}
          accessibilityRole="button"
        >
          <Text style={globalStyles.link}>Forgot password?</Text>
        </Pressable>

        <FormError message={formError} style={styles.formError} />

        <Button title="Log In" onPress={handleLogIn} loading={loading} style={styles.button} />

        <Text style={[globalStyles.centerText, styles.switchText]}>
          New to KidBuddy?{' '}
          <Text style={globalStyles.link} onPress={() => navigation.navigate('SignUp')}>
            Create account
          </Text>
        </Text>

        {/* pushes the info box to the bottom, just above Buddy */}
        <View style={styles.spacer} />

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Your child does not need a login. Profiles are managed from your parent account.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  firstField: {
    marginTop: 22,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginTop: 14,
  },
  formError: {
    marginTop: 14,
  },
  button: {
    marginTop: 20,
  },
  switchText: {
    marginTop: 20,
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  infoBox: {
    backgroundColor: COLORS.primaryPale,
    borderRadius: RADIUS.box,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  infoText: {
    fontFamily: FONTS.interRegular,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textMuted,
  },
});
