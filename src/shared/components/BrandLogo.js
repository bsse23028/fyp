// BRAND LOGO - the KidBuddy head + name (top-left of every screen).
// It uses the logo of the avatar being shown (see Mascot.js for the rules).
// Every logo keeps its own shape (`logoRatio` in theme/avatars.js). `maxWidth` (optional) makes a
// wide logo smaller instead of wider, so it always fits.

import React from 'react';
import { Image } from 'react-native';
import { useChild } from '../../app/store/useChild';
import { LOGO_RATIO, getAvatar } from '../theme/avatars';

export default function BrandLogo({ height = 42, avatar, maxWidth }) {
  const { displayAvatar } = useChild();
  const chosen = getAvatar(avatar || displayAvatar);
  const ratio = chosen.logoRatio || LOGO_RATIO;
  const width = maxWidth ? Math.min(height * ratio, maxWidth) : height * ratio;

  return (
    <Image
      source={chosen.logo}
      accessibilityLabel="KidBuddy"
      resizeMode="contain"
      style={{ height: width / ratio, width }}
    />
  );
}
