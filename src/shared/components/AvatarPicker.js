// AVATAR PICKER - a row of buddies to choose from (see shared/theme/avatars.js).
// Used when creating a profile and when editing it.
//
//   <AvatarPicker selectedId={avatar} onSelect={setAvatar} />

import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { AVATARS } from '../theme/avatars';
import { COLORS } from '../theme/theme';

export default function AvatarPicker({ selectedId, onSelect }) {
  return (
    <View style={styles.row}>
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
              style={{ height: 50, width: 50 * avatar.ratio }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
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
