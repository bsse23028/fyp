// COMING SOON MODAL - a small, friendly pop-up with Buddy for features that are not built yet.
//   <ComingSoonModal visible={open} onClose={() => setOpen(false)} message="..." />

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';
import Text from './AppText';
import Mascot from './Mascot';
import SoftButton from './SoftButton';
import { useDirection } from '../utils/direction';
import { animateVisibility } from '../utils/motion';
import { CALM, CALM_RADIUS, CALM_SHADOW, FONTS } from '../theme/theme';

export default function ComingSoonModal({ visible, onClose, title = 'Coming soon', message }) {
  const { directionStyle } = useDirection();
  const progress = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      animateVisibility(progress, true);
    } else if (mounted) {
      animateVisibility(progress, false, () => setMounted(false));
    }
  }, [visible]);

  if (!mounted) return null;

  const cardStyle = {
    opacity: progress,
    transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }],
  };

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.root, directionStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: progress }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        </Animated.View>

        <Animated.View style={[styles.card, CALM_SHADOW.lifted, cardStyle]}>
          <Mascot size={96} />
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <SoftButton title="OK" onPress={onClose} style={styles.button} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  backdrop: {
    backgroundColor: CALM.backdrop,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 24,
    borderRadius: CALM_RADIUS.xl,
    backgroundColor: CALM.surface,
  },
  title: {
    marginTop: 10,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 24,
    color: CALM.text,
    textAlign: 'center',
  },
  message: {
    marginTop: 6,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 16,
    lineHeight: 23,
    color: CALM.textSoft,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    alignSelf: 'stretch',
  },
});
