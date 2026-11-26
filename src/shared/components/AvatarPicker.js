// AVATAR PICKER - a row of buddies to choose from (see shared/theme/avatars.js).
// Used when creating a profile and when editing it.
// There are more buddies than fit on a phone, so the row SCROLLS SIDEWAYS (swipe left / right);
// the buddy cut off at the edge shows there are more. In Urdu the row starts on the right.
//
//   <AvatarPicker selectedId={avatar} onSelect={setAvatar} />

import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useChildOptions } from '../../app/store/useChildOptions';
import { COLORS } from '../theme/theme';

export default function AvatarPicker({ selectedId, onSelect }) {
  const { avatars: AVATARS } = useChildOptions(); // the buddies the server allows
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.row}
      style={styles.scroller}
    >
      {AVATARS.map((avatar) => {
        const selected = avatar.id === selectedId;
        return (
          <Pressable
            key={avatar.id}
            onPress={() => onSelect(avatar.id)}
            accessibilityRole="button"
            accessibilityLabel={`${avatar.name} buddy`}
            accessibilityState={{ selected }}
            style={[
              styles.tile,
              { backgroundColor: avatar.color },
              selected && styles.tileSelected,
            ]}
          >
            <Image
              source={avatar.mascot}
              resizeMode="contain"
              style={{ height: 44, width: 44 * avatar.ratio }}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // the row may reach the screen edges while scrolling (the screen has 24 points of side padding)
  scroller: {
    flexGrow: 0, // only as tall as the tiles (otherwise it grows and leaves a big empty gap below)
    marginHorizontal: -24,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 2,
  },
  tile: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileSelected: {
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
});
