// CHILD ACTIONS MENU - a small bottom sheet for one child: Edit profile · Delete.
// (Progress is NOT here: it is the Progress tab, its one way in.)
// It slides up with a fading backdrop; tap outside to close. The chosen action runs after it closed.

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';
import Text from '../../../shared/components/AppText';
import AppIcon from '../../../shared/components/AppIcon';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import { useDirection } from '../../../shared/utils/direction';
import { animateVisibility } from '../../../shared/utils/motion';
import { CALM, CALM_RADIUS, CALM_SIZES, FONTS, PALETTE } from '../../../shared/theme/theme';

export default function ChildActionsMenu({ child, onClose, onEdit, onDelete }) {
  const { directionStyle } = useDirection();
  const progress = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(null);
  const pending = useRef(null);

  useEffect(() => {
    if (child) {
      setShown(child);
      animateVisibility(progress, true);
    } else if (shown) {
      animateVisibility(progress, false, () => {
        setShown(null);
        const action = pending.current;
        pending.current = null;
        if (action) action();
      });
    }
  }, [child]);

  if (!shown) return null;

  function choose(action) {
    pending.current = () => action(shown);
    onClose();
  }

  const items = [
    { icon: 'pencil', label: 'Edit profile', action: onEdit },
    { icon: 'trash-can-outline', label: 'Delete', action: onDelete, gentleWarning: true },
  ];

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.root, directionStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: progress }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [320, 0] }) }] },
          ]}
        >
          <View style={styles.handle} />
          <Text style={styles.title} numberOfLines={1}>
            {shown.name}
          </Text>
          {items.map((item) => (
            <AnimatedPressable
              key={item.label}
              onPress={() => choose(item.action)}
              style={[styles.item, item.gentleWarning && styles.itemWarning]}
            >
              <AppIcon name={item.icon} size={24} color={item.gentleWarning ? PALETTE.coralText : PALETTE.purple} />
              <Text style={styles.itemText}>{item.label}</Text>
            </AnimatedPressable>
          ))}
          <AnimatedPressable onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </AnimatedPressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    backgroundColor: CALM.backdrop,
  },
  sheet: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    borderTopLeftRadius: CALM_RADIUS.xl,
    borderTopRightRadius: CALM_RADIUS.xl,
    backgroundColor: CALM.background,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    marginBottom: 12,
    borderRadius: 3,
    backgroundColor: CALM.line,
  },
  title: {
    marginBottom: 10,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 20,
    color: CALM.text,
  },
  item: {
    minHeight: CALM_SIZES.tap,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
    borderRadius: CALM_RADIUS.medium,
    backgroundColor: CALM.surface,
  },
  itemWarning: {
    backgroundColor: CALM.coralPale,
  },
  itemIcon: {
    fontSize: 20,
    marginEnd: 12,
  },
  itemText: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 16,
    color: CALM.text,
  },
  cancel: {
    minHeight: CALM_SIZES.tap,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 16,
    color: CALM.textSoft,
  },
});
