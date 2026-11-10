// OTP INPUT - six boxes for the 6-digit code.
//
// The six boxes are only drawn on screen. One invisible TextInput lies on
// top of them and catches the typing, which keeps backspace, paste and
// auto-fill-from-SMS working properly.
//
//   <OtpInput value={code} onChange={setCode} />

import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Text from './AppText';
import { COLORS, FONTS, RADIUS, SIZES } from '../theme/theme';

const LENGTH = 6;

export default function OtpInput({ value, onChange }) {
  const [focused, setFocused] = useState(false);

  // The box that is waiting for the next digit gets the indigo border.
  const activeIndex = Math.min(value.length, LENGTH - 1);

  return (
    <View>
      <View style={styles.row}>
        {Array.from({ length: LENGTH }).map((_, index) => {
          const isActive = focused && index === activeIndex;
          return (
            <View key={index} style={[styles.box, isActive && styles.boxActive]}>
              <Text style={styles.digit}>{value[index] || ''}</Text>
            </View>
          );
        })}
      </View>

      <TextInput
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, LENGTH))}
        keyboardType="number-pad"
        maxLength={LENGTH}
        autoFocus
        caretHidden
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel="Enter the 6 digit code"
        style={styles.hiddenInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    flex: 1,
    height: SIZES.otpBox,
    marginHorizontal: 4,
    borderRadius: RADIUS.input,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(79, 70, 229, 0.06)',
  },
  digit: {
    fontFamily: FONTS.interBold,
    fontSize: 20,
    color: COLORS.text,
  },
  // Same size as the boxes, but invisible.
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
  },
});
