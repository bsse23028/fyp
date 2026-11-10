// PASSWORD RULES - the live checklist under a "new password" box.
// Each rule turns green with a tick as soon as the typed password follows it.
// The rules themselves live in utils/validation.js (PASSWORD_RULES).
//
//   <PasswordRules password={password} />

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from './AppText';
import { passwordChecks } from '../utils/validation';
import { COLORS, FONTS } from '../theme/theme';

export default function PasswordRules({ password, style }) {
  return (
    <View style={[styles.box, style]}>
      <Text style={styles.title}>Your password must have:</Text>
      {passwordChecks(password).map((rule) => (
        <View key={rule.id} style={styles.row}>
          <Text style={[styles.mark, rule.ok ? styles.ok : styles.todo]}>{rule.ok ? '✓' : '○'}</Text>
          <Text style={[styles.label, rule.ok && styles.labelOk]}>{rule.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: COLORS.primaryPale,
  },
  title: {
    marginBottom: 6,
    fontFamily: FONTS.interSemiBold,
    fontSize: 12,
    color: COLORS.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  mark: {
    width: 20,
    fontFamily: FONTS.interBold,
    fontSize: 13,
  },
  ok: {
    color: COLORS.success,
  },
  todo: {
    color: COLORS.textMuted,
  },
  label: {
    flex: 1,
    fontFamily: FONTS.interRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  labelOk: {
    color: COLORS.success,
  },
});
