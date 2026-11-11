// UPDATE PIN SCREEN - same two proofs as changing the password: the OLD PIN and a
// 6-digit code sent to the parent's email.
//
//   Step 1  old PIN, new PIN, confirm new PIN  -> "Send code" checks the old PIN
//   Step 2  type the code -> the PIN is changed (changePin in AuthContext)
//
// (The very first PIN is created in a quick pop-up instead: see ParentProfileScreen.)
//
// Props: { navigation }

import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import TextField from '../../shared/components/TextField';
import Button from '../../shared/components/Button';
import FormError from '../../shared/components/FormError';
import CodeStep from '../../shared/components/CodeStep';
import { useAuth } from '../../app/context/AuthContext';
import { translate } from '../../shared/i18n/translate';
import { globalStyles } from '../../shared/theme/globalStyles';
import { COLORS, FONTS } from '../../shared/theme/theme';

const PIN_FORMAT = /^\d{4}$/;

export default function UpdatePinScreen({ navigation }) {
  const { user, changePin } = useAuth();

  const [step, setStep] = useState('form'); // 'form' or 'code'
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const newRef = useRef(null);
  const confirmRef = useRef(null);

  // Only digits, at most 4.
  const digitsOnly = (text) => text.replace(/\D/g, '').slice(0, 4);

  const oldProblem = PIN_FORMAT.test(oldPin) ? '' : 'Enter your old 4-digit PIN.';
  const newProblem = PIN_FORMAT.test(newPin) ? '' : 'The new PIN must be 4 digits.';
  const confirmProblem = confirm === newPin ? '' : 'The PINs do not match.';

  // function handleSendCode() {
  //   setSubmitted(true);
  //   setFormError('');
  //   if (oldProblem || newProblem || confirmProblem) return;

  //   if (!checkPin(oldPin)) {
  //     setFormError('Your old PIN is not right.');
  //   } else if (oldPin === newPin) {
  //     setFormError('Choose a PIN you have not used before.');
  //   } else {
  //     // sendChangeCode(); // in demo mode the code appears in a pop-up
  //      setStep('code');
  //   }
  // }
// The server checks the old PIN itself ("Your old PIN is not right." comes back as an error).
async function handleUpdatePin() {
  setSubmitted(true);
  setFormError('');

  if (oldProblem || newProblem || confirmProblem) return;

  if (oldPin === newPin) {
    setFormError('Choose a PIN you have not used before.');
    return;
  }

  try {
    await changePin(oldPin, newPin);

    Alert.alert(
      translate('PIN updated'),
      translate('Use your new PIN to leave Child Mode.'),
      [{ text: translate('OK'), onPress: () => navigation.goBack() }]
    );
  } catch (error) {
    setFormError(error.message || 'Could not update PIN.');
  }
}
  async function handleVerify(code) {
    await changePin(oldPin, newPin, code); // throws if the PIN is wrong
    Alert.alert(translate('PIN updated'), translate('Use your new PIN to leave Child Mode.'), [
      { text: translate('OK'), onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <Screen scroll mode="parent">
      <View style={styles.body}>
        <Text style={styles.heading}>Update PIN</Text>

        {step === 'form' ? (
          <View>
            <Text style={globalStyles.subheading}>First we check it is really you.</Text>

            <TextField
              label="Old PIN"
              value={oldPin}
              onChangeText={(text) => setOldPin(digitsOnly(text))}
              placeholder="4 digits"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              returnKeyType="next"
              onSubmitEditing={() => newRef.current && newRef.current.focus()}
              error={submitted ? oldProblem : ''}
              style={styles.firstField}
            />

            <TextField
              label="New PIN"
              value={newPin}
              onChangeText={(text) => setNewPin(digitsOnly(text))}
              placeholder="4 digits"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              inputRef={newRef}
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current && confirmRef.current.focus()}
              error={submitted ? newProblem : ''}
              style={globalStyles.fieldGap}
            />

            <TextField
              label="Confirm new PIN"
              value={confirm}
              onChangeText={(text) => setConfirm(digitsOnly(text))}
              placeholder="Type it again"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              inputRef={confirmRef}
              returnKeyType="done"
              onSubmitEditing={handleUpdatePin}
              error={submitted ? confirmProblem : ''}
              style={globalStyles.fieldGap}
            />

            <FormError message={formError} style={styles.formError} />

            <Button title="Update PIN" onPress={handleUpdatePin} style={styles.button} />
            <Button title="Cancel" variant="secondary" onPress={() => navigation.goBack()} style={styles.cancel} />
          </View>
        ) : (
          <CodeStep
            email={user ? user.email : ''}
            buttonLabel="Verify and update PIN"
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
