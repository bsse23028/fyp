// MASCOT - Buddy. `size` is the height a screen asks for, in points (drawn at MASCOT_SCALE of it); the
// width follows the picture's own shape (`ratio` in theme/avatars.js) so it is never stretched.
//
// Which Buddy is shown?
//   1. the `avatar` prop, if a screen passes one (e.g. while choosing an avatar)
//   2. otherwise `displayAvatar`: the child's avatar in Child Mode,
//      the default rabbit everywhere else (login, parent screens ...)

import React from 'react';
import { Image } from 'react-native';
import { useChild } from '../../app/store/useChild';
import { MASCOT_SCALE, getAvatar } from '../theme/avatars';

export default function Mascot({ size = 80, avatar, style }) {
  const { displayAvatar } = useChild();
  const chosen = getAvatar(avatar || displayAvatar);
  const height = size * MASCOT_SCALE;

  return (
    <Image
      source={chosen.mascot}
      accessibilityLabel={`Buddy the ${chosen.name.toLowerCase()}`}
      resizeMode="contain"
      style={[{ height, width: height * chosen.ratio }, style]}
    />
  );
}
