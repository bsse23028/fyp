// PASSWORD RULES - the live checklist under a "new password" box.
// Each rule turns green with a tick as soon as the typed password follows it.
// The rules themselves live in utils/validation.js (PASSWORD_RULES).
//
//   <PasswordRules password={password} />            one rule per line
//   <PasswordRules password={password} compact />    two columns, shorter (Sign Up uses it so the page fits)

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from './AppText';
import { passwordChecks } from '../utils/validation';
import { COLORS, FONTS } from '../theme/theme';

// The shorter words used by `compact` (so every rule fits on one line in its column).
const SHORT_LABELS = {
  length: '8+ characters',
  upper: 'A capital (A-Z)',
  lower: 'A small letter (a-z)',
  number: 'A number (0-9)',
  special: 'A symbol (! @ # $)',
  space: 'No spaces',
};

export default function PasswordRules({ password, compact = false, style }) {
  return (
    <View style={[styles.box, compact && styles.boxCompact, style]}>
      <Text style={styles.title}>Your password must have:</Text>
      <View style={compact ? styles.grid : null}>
        {passwordChecks(password).map((rule) => (
          <View key={rule.id} style={[styles.row, compact && styles.rowCompact]}>
            <Text style={[styles.mark, rule.ok ? styles.ok : styles.todo]}>{rule.ok ? '✓' : '○'}</Text>
            <Text style={[styles.label, rule.ok && styles.labelOk]} numberOfLines={compact ? 1 : undefined}>
              {compact ? SHORT_LABELS[rule.id] || rule.label : rule.label}
            </Text>
          </View>
        ))}
      </View>
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
  boxCompact: {
    paddingVertical: 10,
  },
  title: {
    marginBottom: 6,
    fontFamily: FONTS.interSemiBold,
    fontSize: 12,
    color: COLORS.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  rowCompact: {
    width: '50%',
    alignItems: 'flex-start',
    paddingEnd: 6,
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
