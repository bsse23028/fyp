// ALERTS - small pop-ups used by more than one screen.

import { Alert } from 'react-native';
import { translate } from '../i18n/translate';

// For buttons whose screen is not built yet (Numbers, Feelings, ...).
export function showComingSoon(name) {
  Alert.alert(translate('Coming soon'), translate('{name} is still being built. Check back soon!', { name: translate(name) }));
}
