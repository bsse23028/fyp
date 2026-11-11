// PROFILE PICKER SCREEN - "Who is learning?" (from Figma).
//
// The parent opens Child Mode from Parent Home; this is the first screen the
// child sees. Tap your picture, then "Continue as <name>" opens Child Home
// with that child's buddy everywhere.
//
// "Ask a parent" asks for the Parent PIN and goes back to Parent Mode.
//
// Props: { navigation }

import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import Mascot from '../../shared/components/Mascot';
import SpeakButton from '../../shared/components/SpeakButton';
import PinModal from '../../shared/components/PinModal';
import { useChild } from '../../app/store/useChild';
import { goToChildHome, goToParentHome } from '../../app/navigation/helpers';
import { getAvatar } from '../../shared/theme/avatars';
import { COLORS, FONTS } from '../../shared/theme/theme';

export default function ProfilePickerScreen({ navigation }) {
  const { childProfiles, activeChild, enterChildMode, exitChildMode } = useChild();

  // The child who used the app last is pre-selected.
  const [selectedId, setSelectedId] = useState(activeChild ? activeChild.id : childProfiles.length > 0 ? childProfiles[0].id : null);
  const [pinOpen, setPinOpen] = useState(false);

  const selected = childProfiles.find((c) => c.id === selectedId) || null;

  // The server remembers this child as the active one. If that fails, a pop-up explains why.
  async function handleContinue() {
    if (!selected) return;
    if (await enterChildMode(selected.id)) goToChildHome(navigation);
  }

  function handlePinSuccess() {
    setPinOpen(false);
    exitChildMode();
    goToParentHome(navigation);
  }

  return (
    <Screen scroll>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={styles.titleText}>
            <Text style={styles.title}>Who is learning?</Text>
            <Text style={styles.subtitle}>Choose your picture to begin.</Text>
          </View>
          <SpeakButton text="Who is learning? Choose your picture to begin." />
        </View>

        <View style={styles.grid}>
          {childProfiles.map((child) => {
            const avatar = getAvatar(child.avatar);
            const isSelected = child.id === selectedId;
            return (
              <Pressable
                key={child.id}
                onPress={() => setSelectedId(child.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                style={[styles.tile, { backgroundColor: avatar.color }, isSelected && styles.tileSelected]}
              >
                <Mascot size={110} avatar={child.avatar} />
                <Text style={styles.tileName} numberOfLines={1}>
                  {child.name}
                </Text>
              </Pressable>
            );
          })}

          {/* a child cannot add profiles: a parent has to do it */}
          <Pressable onPress={() => setPinOpen(true)} accessibilityRole="button" style={[styles.tile, styles.askTile]}>
            <Text style={styles.plus}>+</Text>
            <Text style={styles.askText}>Ask a parent</Text>
          </Pressable>
        </View>

        <View style={styles.spacer} />

        <Pressable
          onPress={handleContinue}
          accessibilityRole="button"
          style={[styles.continue, !selected && styles.continueOff]}
        >
          <Text style={styles.continueText}>{selected ? `Continue as ${selected.name}` : 'Continue'}</Text>
        </Pressable>
        <Text style={styles.note}>Parent Mode requires your PIN</Text>
      </View>

      <PinModal visible={pinOpen} onClose={() => setPinOpen(false)} onSuccess={handlePinSuccess} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  titleText: {
    flex: 1,
    marginEnd: 12,
  },
  title: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 27,
    color: COLORS.warmText,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 15,
    color: COLORS.warmMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 26,
  },
  tile: {
    width: '48%',
    minHeight: 190,
    marginBottom: 16,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileSelected: {
    borderColor: COLORS.blue,
  },
  tileName: {
    marginTop: 10,
    paddingHorizontal: 8,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 22,
    color: COLORS.warmText,
  },
  askTile: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D8C9BC',
    backgroundColor: COLORS.white,
  },
  plus: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 44,
    lineHeight: 52,
    color: COLORS.warmMuted,
  },
  askText: {
    marginTop: 6,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 17,
    color: COLORS.warmMuted,
  },
  spacer: {
    flex: 1,
    minHeight: 16,
  },
  continue: {
    minHeight: 64,
    borderRadius: 20,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueOff: {
    opacity: 0.4,
  },
  continueText: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 20,
    color: COLORS.warmText,
  },
  note: {
    marginTop: 12,
    textAlign: 'center',
    fontFamily: FONTS.interRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
