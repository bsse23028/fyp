// BRAND LOGO - the KidBuddy head + name (top-left of every screen).
// It uses the logo of the avatar being shown (see Mascot.js for the rules).

import React from 'react';
import { Image } from 'react-native';
import { useChild } from '../../app/store/useChild';
import { LOGO_RATIO, getAvatar } from '../theme/avatars';

export default function BrandLogo({ height = 42, avatar }) {
  const { displayAvatar } = useChild();

  return (
    <Image
      source={getAvatar(avatar || displayAvatar).logo}
      accessibilityLabel="KidBuddy"
      resizeMode="contain"
      style={{ height, width: height * LOGO_RATIO }}
    />
  );
}
