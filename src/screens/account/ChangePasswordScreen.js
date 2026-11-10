// CHANGE PASSWORD SCREEN - two proofs are needed: the OLD password and a
// 6-digit code sent to the parent's email.
//
//   Step 1  old password, new password (with the rules checklist), confirm
//           -> "Send code" checks the old password, then "emails" the code
//   Step 2  type the code -> the password is changed (changePassword in AuthContext)
//
// Props: { navigation }

import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, View,Pressable } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import TextField from '../../shared/components/TextField';
import Button from '../../shared/components/Button';
import FormError from '../../shared/components/FormError';
import PasswordRules from '../../shared/components/PasswordRules';
import CodeStep from '../../shared/components/CodeStep';
import { useAuth } from '../../app/context/AuthContext';
import { translate } from '../../shared/i18n/translate';
import { passwordError } from '../../shared/utils/validation';
import { globalStyles } from '../../shared/theme/globalStyles';
import { COLORS, FONTS } from '../../shared/theme/theme';

export default function ChangePasswordScreen({ navigation }) {
  const { user, checkPassword, sendChangeCode, changePassword } = useAuth();

  const [step, setStep] = useState('form'); // 'form' or 'code'
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
const [showForgot, setShowForgot] = useState(false);
  const newRef = useRef(null);
  const confirmRef = useRef(null);

  const oldProblem = oldPassword ? '' : 'Enter your old password.';
  const newProblem = passwordError(newPassword);
  const confirmProblem = confirm === newPassword ? '' : 'Passwords do not match.';

  async function handleSendCode() {
    setSubmitted(true);
    setFormError('');
    if (oldProblem || newProblem || confirmProblem) return;

    setLoading(true);
    if (!(await checkPassword(oldPassword))) {
       setShowForgot(true);
      setFormError('Your old password is not right.');
       
    } else if (oldPassword === newPassword) {
      setFormError('Choose a password you have not used before.');
    } else {
      sendChangeCode(); // in demo mode the code appears in a pop-up
      setStep('code');
    }
    setLoading(false);
  }

  async function handleVerify(code) {
    await changePassword(oldPassword, newPassword, code); // throws if the code is wrong
    Alert.alert(translate('Password changed'), translate('Use your new password the next time you log in.'), [
      { text: translate('OK'), onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <Screen scroll mode="parent">
      <View style={styles.body}>
        <Text style={styles.heading}>Change password</Text>

        {step === 'form' ? (
          <View>
            <Text style={globalStyles.subheading}>First we check it is really you.</Text>

            <TextField
              label="Old password (logout and click forget password,to reset, if you don't remember it)"
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Your current password"
              secureTextEntry
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => newRef.current && newRef.current.focus()}
              error={submitted ? oldProblem : ''}
              style={styles.firstField}
            />
            {showForgot && (
    <Pressable
    onPress={() => navigation.navigate('ForgotPassword')}
    style={styles.forgot}
    accessibilityRole="button"
  >
    <Text style={globalStyles.link}>Forgot password?</Text>
  </Pressable>
)}

            <TextField
              label="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New password"
              secureTextEntry
              inputRef={newRef}
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current && confirmRef.current.focus()}
              error={submitted ? newProblem : ''}
              style={globalStyles.fieldGap}
            />

            <PasswordRules password={newPassword} style={styles.rules} />

            <TextField
              label="Confirm password"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Repeat the new password"
              secureTextEntry
              inputRef={confirmRef}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSendCode}
              error={submitted ? confirmProblem : ''}
              style={globalStyles.fieldGap}
            />

            <FormError message={formError} style={styles.formError} />

            <Button title="Send code" onPress={handleSendCode} loading={loading} style={styles.button} />
            <Button title="Cancel" variant="secondary" onPress={() => navigation.goBack()} style={styles.cancel} />
          </View>
        ) : (
          <CodeStep
            email={user ? user.email : ''}
            buttonLabel="Verify and change password"
            onVerify={handleVerify}
            onCancel={() => navigation.goBack()}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  heading: {
    fontFamily: FONTS.interBold,
    fontSize: 24,
    color: COLORS.text,
  },
  firstField: {
    marginTop: 18,
  },
   forgot: {
    alignSelf: 'flex-end',
    marginTop: 14,
  },
  rules: {
    marginTop: 12,
  },
  formError: {
    marginTop: 14,
  },
  button: {
    marginTop: 18,
  },
  cancel: {
    marginTop: 10,
  },
});
