// APP TEXT - use this instead of React Native's <Text>. It is the same, but it
// shows the Urdu version of the text when Urdu is selected (see src/shared/i18n/translate.js).
//
//   import Text from './AppText';
//   <Text style={styles.title}>Welcome back</Text>
//
// For Urdu it also adds right-to-left writing and a taller line height, because
// Urdu letters need more vertical room than English letters.

import React from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import { useLanguage } from '../../app/context/LanguageContext';
import { hasUrdu, translate } from '../i18n/translate';

// Translates the children of a <Text>: a string, or a mix like  Hello {name}!
function translateChildren(children) {
  if (typeof children === 'string') return translate(children);
  if (!Array.isArray(children)) return children;

  const parts = React.Children.toArray(children);

  // Only words and numbers (e.g. `Ready, {name}?`): try the whole sentence first.
  if (parts.every((part) => typeof part === 'string' || typeof part === 'number')) {
    const joined = parts.join('');
    const whole = translate(joined);
    if (whole !== joined) return whole;
  }
  // Otherwise translate each piece on its own.
  return parts.map((part) => (typeof part === 'string' ? translate(part) : part));
}

function containsUrdu(children) {
  if (typeof children === 'string') return hasUrdu(children);
  if (Array.isArray(children)) return children.some((c) => typeof c === 'string' && hasUrdu(c));
  return false;
}

export default function AppText({ children, style, ...rest }) {
  const { language } = useLanguage(); // makes every Text update the moment the language changes

  const shown = language === 'ur' ? translateChildren(children) : children;

  let finalStyle = style;
  if (language === 'ur' && containsUrdu(shown)) {
    const flat = StyleSheet.flatten(style) || {};
    const extra = { writingDirection: 'rtl' };
    if (flat.fontSize) extra.lineHeight = Math.max(flat.lineHeight || 0, Math.round(flat.fontSize * 1.7));
    finalStyle = [style, extra];
  }

  return (
    <RNText {...rest} style={finalStyle}>
      {shown}
    </RNText>
  );
}
