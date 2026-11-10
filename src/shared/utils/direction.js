// DIRECTION - one place that knows how the app should be laid out.
//
//   English -> left-to-right (LTR)      Urdu -> right-to-left (RTL)
//
// React Native's `direction` style flips every row, every start/end margin and
// every start/end position inside a view, so we only set it ONCE at the top of
// the app (see App.js) and once inside pop-ups (Modals are separate windows).
//
//   const { isRTL, directionStyle } = useDirection();
//   <View style={directionStyle}>...</View>

import { useLanguage } from '../../app/context/LanguageContext';

export function useDirection() {
  const { language } = useLanguage();
  const isRTL = language === 'ur';
  return { isRTL, directionStyle: { direction: isRTL ? 'rtl' : 'ltr' } };
}
