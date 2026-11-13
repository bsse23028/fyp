// PARENT DRAWER - the side menu of Parent Home (opened by ☰ in the header).
// Plan · Progress · Settings, and Log out at the bottom. Built with Animated only: the panel slides
// in from the start edge (left in English, right in Urdu) over a fading backdrop; tap outside to close.
// The chosen item runs after the panel has closed.

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Text from '../../../shared/components/AppText';
import Mascot from '../../../shared/components/Mascot';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import { useDirection } from '../../../shared/utils/direction';
import { animateVisibility } from '../../../shared/utils/motion';
import { CALM, CALM_RADIUS, CALM_SIZES, FONTS } from '../../../shared/theme/theme';

export const DRAWER_ITEMS = [
  { label: 'Plan', icon: '🗂️', screen: 'ParentPlan' },
  { label: 'Progress', icon: '📈', screen: 'ParentProgress' },
  { label: 'Settings', icon: '⚙️', screen: 'ParentSettings' },
];

function DrawerItem({ icon, label, onPress, style }) {
  return (
    <AnimatedPressable onPress={onPress} accessibilityLabel={label} style={[styles.item, style]}>
      <Text style={styles.itemIcon}>{icon}</Text>
      <Text style={styles.itemText}>{label}</Text>
    </AnimatedPressable>
  );
}

export default function ParentDrawer({ visible, onClose, parentName, onNavigate, onLogout }) {
  const { width } = useWindowDimensions();
  const { isRTL, directionStyle } = useDirection();
  const progress = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);
  const pending = useRef(null);
  const panelWidth = Math.min(320, Math.round(width * 0.82));

  useEffect(() => {
    if (visible) {
      setMounted(true);
      animateVisibility(progress, true);
    } else if (mounted) {
      animateVisibility(progress, false, () => {
        setMounted(false);
        const action = pending.current;
        pending.current = null;
        if (action) action();
      });
    }
  }, [visible]);

  if (!mounted) return null;

  function closeThen(action) {
    pending.current = action;
    onClose();
  }

  const offscreen = isRTL ? panelWidth : -panelWidth;
  const slide = { transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [offscreen, 0] }) }] };

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.root, directionStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: progress }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close menu" />
        </Animated.View>

        <Animated.View style={[styles.panel, { width: panelWidth }, slide]}>
          <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <View style={styles.head}>
              <Mascot size={56} />
              <View style={styles.headText}>
                <Text style={styles.headTitle}>Parent menu</Text>
                {parentName ? (
                  <Text style={styles.headName} numberOfLines={1}>
                    {parentName}
                  </Text>
                ) : null}
              </View>
              <AnimatedPressable onPress={onClose} hitSlop={8} accessibilityLabel="Close menu" style={styles.close}>
                <Text style={styles.closeText}>✕</Text>
              </AnimatedPressable>
            </View>

            <View style={styles.items}>
              {DRAWER_ITEMS.map((item) => (
                <DrawerItem
                  key={item.screen}
                  icon={item.icon}
                  label={item.label}
                  onPress={() => closeThen(() => onNavigate(item.screen))}
                />
              ))}
            </View>

            <View style={styles.spacer} />

            <DrawerItem icon="🚪" label="Log out" onPress={() => closeThen(onLogout)} style={styles.logout} />
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    backgroundColor: CALM.backdrop,
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    start: 0,
    backgroundColor: CALM.background,
    borderTopEndRadius: CALM_RADIUS.xl,
    borderBottomEndRadius: CALM_RADIUS.xl,
  },
  safe: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 18,
  },
  headText: {
    flex: 1,
    marginStart: 10,
  },
  headTitle: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 20,
    color: CALM.text,
  },
  headName: {
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 14,
    color: CALM.textSoft,
  },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CALM.surface,
  },
  closeText: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 16,
    color: CALM.textSoft,
  },
  items: {
    gap: 10,
  },
  item: {
    minHeight: CALM_SIZES.tap,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: CALM_RADIUS.medium,
    backgroundColor: CALM.surface,
  },
  itemIcon: {
    fontSize: 20,
    marginEnd: 12,
  },
  itemText: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 17,
    color: CALM.text,
  },
  spacer: {
    flex: 1,
  },
  logout: {
    backgroundColor: CALM.coralPale,
  },
});
