// FADE IN VIEW - wraps a card so it fades and slides in when the screen opens.
// Give each card its `index` so they appear one after another.

import React from 'react';
import { Animated } from 'react-native';
import { useEntrance } from '../utils/motion';

export default function FadeInView({ index = 0, delay = 0, style, children }) {
  const entrance = useEntrance(index, { delay });
  return <Animated.View style={[style, entrance]}>{children}</Animated.View>;
}
