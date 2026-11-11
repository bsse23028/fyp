// LOAD ERROR - a full-screen message with a Retry button.
// AppNavigator shows it when the app opens and the server cannot be reached
// (the saved login, the child profiles or the choice lists could not be loaded).
//
//   <LoadError message="We can’t reach the KidBuddy server..." onRetry={...} />

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from './AppText';
import Button from './Button';
import { COLORS, FONTS } from '../theme/theme';

export default function LoadError({ message, onRetry }) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>Could not connect</Text>
      <Text style={styles.message}>{message}</Text>
      <Button title="Retry" onPress={onRetry} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: COLORS.white,
  },
  title: {
    fontFamily: FONTS.interBold,
    fontSize: 20,
    color: COLORS.text,
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    fontFamily: FONTS.interRegular,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    alignSelf: 'stretch',
  },
});
