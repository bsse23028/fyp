// APP ICON - the flat, one-colour icons of the inspo look (a dumbbell, a game pad, a book ...),
// used instead of emoji on tiles, cards and stats. They come from "Material Community Icons",
// which is already inside @expo/vector-icons (no extra package, works in Expo Go).
//
//   <AppIcon name="book-open-variant" size={28} color={PALETTE.purple} />
//
// To find another icon: search https://pictogrammers.com/library/mdi/ and copy its name
// (for example "gamepad-variant"). A wrong name shows a "?" box, so check it on the phone.

import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PALETTE } from '../theme/theme';

export default function AppIcon({ name, size = 28, color = PALETTE.purple, style }) {
  return <MaterialCommunityIcons name={name} size={size} color={color} style={style} />;
}
