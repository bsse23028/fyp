// PIN MODAL - the "Parent check" pop-up (from the Figma "Parent PIN" screen).
// It guards the way OUT of Child Mode, so a child cannot open Parent Mode.
//
//   <PinModal visible={open} onClose={...} onSuccess={...} />
//   <PinModal ... forceCreate />      always asks for a NEW pin (Settings -> Parent PIN)
//
// What it does:
//   - the parent has no PIN yet      -> "Create a 4-digit PIN", then asks to type it again
//   - the parent has a PIN           -> "Enter your 4-digit PIN"
//   - "Forgot PIN?"                  -> type the account password, then create a new PIN
// The PIN is saved on the backend by AuthContext (savePin), as a hash - never on the phone.

import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Text from './AppText';
import TextField from './TextField';
import Button from './Button';
import { useAuth } from '../../app/context/AuthContext';
import { useDirection } from '../utils/direction';
import { COLORS, FONTS } from '../theme/theme';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

const TITLES = {
  enter: { title: 'Parent check', copy: 'Enter your 4-digit parent PIN' },
  create: { title: 'Create a parent PIN', copy: 'Choose 4 digits. You will need them to leave Child Mode.' },
  confirm: { title: 'Type it again', copy: 'Enter the same 4 digits to confirm.' },
  forgot: { title: 'Forgot your PIN?', copy: 'Type your account password to make a new PIN.' },
};

export default function PinModal({ visible, onClose, onSuccess, forceCreate = false }) {
  const { pin, savePin, checkPin, checkPassword } = useAuth();
  const { directionStyle } = useDirection(); // a Modal is its own window: set the direction again

  const [phase, setPhase] = useState('enter'); // enter | create | confirm | forgot
  const [digits, setDigits] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');

  // Every time the pop-up opens, start from the right phase.
  useEffect(() => {
    if (visible) {
      setPhase(pin && !forceCreate ? 'enter' : 'create');
      setDigits('');
      setFirstPin('');
      setError('');
      setPassword('');
    }
  }, [visible]);

  function press(key) {
    if (key === '') return;
    setError('');
    if (key === '⌫') {
      setDigits(digits.slice(0, -1));
      return;
    }
    if (digits.length >= 4) return;
    const next = digits + key;
    setDigits(next);
    if (next.length === 4) setTimeout(() => submit(next), 150); // tiny pause so the 4th dot shows
  }

  // checkPin and savePin ask the server, so we wait for them (await).
  // If the server says no (e.g. the PIN is locked after 5 wrong tries) its message is shown.
  async function submit(code) {
    try {
      if (phase === 'enter') {
        if (await checkPin(code)) onSuccess();
        else {
          setError('That PIN is not right. Try again.');
          setDigits('');
        }
      } else if (phase === 'create') {
        setFirstPin(code);
        setDigits('');
        setPhase('confirm');
      } else if (phase === 'confirm') {
        if (code === firstPin) {
          await savePin(code);
          onSuccess();
        } else {
          setError('The two PINs were different. Start again.');
          setDigits('');
          setPhase('create');
        }
      }
    } catch (err) {
      setError(err.message);
      setDigits('');
    }
  }

  async function handlePassword() {
    try {
      const ok = await checkPassword(password);
      if (ok) {
        setPassword('');
        setError('');
        setPhase('create');
      } else {
        setError('That password is not right.');
      }
    } catch (err) {
      setError(err.message);
    }
  }

  const text = TITLES[phase];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.backdrop, directionStyle]}>
        <View style={styles.sheet}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{text.title}</Text>
            <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button">
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
          </View>
          <Text style={styles.copy}>{text.copy}</Text>

          {phase === 'forgot' ? (
            <View style={styles.forgotBox}>
              <TextField
                label="Account password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                placeholder="Your password"
                returnKeyType="done"
                onSubmitEditing={handlePassword}
                error={error}
              />
              <Button title="Continue" onPress={handlePassword} style={styles.forgotButton} />
            </View>
          ) : (
            <View>
              {/* the 4 dots */}
              <View style={styles.dots}>
                {[0, 1, 2, 3].map((i) => (
                  <View key={i} style={[styles.dot, i < digits.length && styles.dotOn]} />
                ))}
              </View>
              {error ? <Text style={styles.error}>{error}</Text> : <Text style={styles.error}> </Text>}

              {/* number pad */}
              <View style={styles.pad}>
                {KEYS.map((key, i) => (
                  <Pressable
                    key={i}
                    onPress={() => press(key)}
                    accessibilityRole="button"
                    accessibilityLabel={key === '⌫' ? 'Delete' : key}
                    style={({ pressed }) => [styles.key, key === '' && styles.keyEmpty, pressed && styles.keyPressed]}
                  >
                    <Text style={styles.keyText}>{key}</Text>
                  </Pressable>
                ))}
              </View>

              {phase === 'enter' && (
                <Pressable onPress={() => { setError(''); setPhase('forgot'); }} hitSlop={8} style={styles.forgot}>
                  <Text style={styles.forgotText}>Forgot PIN?</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(61, 43, 31, 0.34)',
  },
  sheet: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 30,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: COLORS.white,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontFamily: FONTS.interBold,
    fontSize: 21,
    color: COLORS.text,
  },
  cancel: {
    fontFamily: FONTS.interMedium,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  copy: {
    marginTop: 5,
    fontFamily: FONTS.interRegular,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textMuted,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  dot: {
    width: 14,
    height: 14,
    marginHorizontal: 7,
    borderRadius: 7,
    backgroundColor: COLORS.border,
  },
  dotOn: {
    backgroundColor: COLORS.primary,
  },
  error: {
    marginTop: 10,
    marginBottom: 6,
    textAlign: 'center',
    fontFamily: FONTS.interMedium,
    fontSize: 12,
    color: COLORS.error,
  },
  pad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  key: {
    width: '31.5%',
    height: 54,
    marginBottom: 10,
    borderRadius: 15,
    backgroundColor: COLORS.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyEmpty: {
    backgroundColor: 'transparent',
  },
  keyPressed: {
    opacity: 0.6,
  },
  keyText: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 20,
    color: COLORS.text,
  },
  forgot: {
    alignSelf: 'center',
    marginTop: 4,
  },
  forgotText: {
    fontFamily: FONTS.interBold,
    fontSize: 13,
    color: COLORS.primary,
  },
  forgotBox: {
    marginTop: 18,
  },
  forgotButton: {
    marginTop: 16,
  },
});
