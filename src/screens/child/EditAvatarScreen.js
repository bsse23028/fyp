// EDIT AVATAR SCREEN - "My Buddy". Opens when the child taps the logo in the header.
//
// The child picks one of the buddies. The header logo shows the choice live
// (`avatar` on <Screen>). "Save my buddy" stores it with updateChild, and from
// then on the logo and every mascot in this child's account use the new buddy.
//
// Props: { navigation }

import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import ChildHeader from '../../shared/components/ChildHeader';
import ChildInstruction from '../../shared/components/ChildInstruction';
import Mascot from '../../shared/components/Mascot';
import { useChild } from '../../app/store/useChild';
import { useChildOptions } from '../../app/store/useChildOptions';
import { getAvatar } from '../../shared/theme/avatars';
import { COLORS, FONTS } from '../../shared/theme/theme';

export default function EditAvatarScreen({ navigation }) {
  const { activeChild, updateChild } = useChild();
  const { avatars: AVATARS } = useChildOptions(); // the buddies the server allows
  const [avatarId, setAvatarId] = useState(activeChild ? activeChild.avatar : 'rabbit');
  const chosen = getAvatar(avatarId);

  // Saved on the server. If that fails, a pop-up explains why and we stay here.
  async function handleSave() {
    if (!activeChild) return navigation.goBack();
    if (await updateChild(activeChild.id, { avatar: avatarId })) navigation.goBack();
  }

  return (
    <Screen scroll mode="child" avatar={avatarId}>
      <View style={styles.body}>
        <ChildHeader title="My Buddy" onBack={() => navigation.goBack()} speakText="My Buddy. Pick the buddy you like" />

        <View style={styles.instruction}>
          <ChildInstruction text="Pick the buddy you like" />
        </View>

        {/* big preview */}
        <View style={[styles.preview, { backgroundColor: chosen.color }]}>
          <Mascot size={170} avatar={avatarId} />
          <Text style={styles.previewName}>{chosen.name}</Text>
        </View>

        {/* the choices */}
        <View style={styles.row}>
          {AVATARS.map((avatar) => {
            const on = avatar.id === avatarId;
            return (
              <Pressable
                key={avatar.id}
                onPress={() => setAvatarId(avatar.id)}
                accessibilityRole="button"
                accessibilityLabel={`${avatar.name} buddy`}
                accessibilityState={{ selected: on }}
                style={[styles.choice, { backgroundColor: avatar.color }, on && styles.choiceOn]}
              >
                <Mascot size={52} avatar={avatar.id} />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <Pressable onPress={handleSave} accessibilityRole="button" style={styles.save}>
          <Text style={styles.saveText}>Save my buddy</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  instruction: {
    marginTop: 14,
    marginBottom: 14,
  },
  preview: {
    height: 250,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: {
    marginTop: 8,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 20,
    color: COLORS.warmText,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  choice: {
    width: '22.5%',
    height: 76,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceOn: {
    borderColor: COLORS.blue,
  },
  spacer: {
    flex: 1,
    minHeight: 16,
  },
  save: {
    minHeight: 64,
    borderRadius: 20,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 20,
    color: COLORS.warmText,
  },
});
