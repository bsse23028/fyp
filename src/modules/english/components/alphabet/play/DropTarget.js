// DROP TARGET - a card the dragged letter can land on. It grows slightly while the letter hovers,
// glows softly when it is the hint, and bounces with sparkles when the right card lands on it.
// The ref points at the measurable view (window position for hit-testing).

import React, { forwardRef, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Text from '../../../../../shared/components/AppText';
import Sparkles from '../../../../../shared/components/Sparkles';
import { motion, usePulse, useScaleIn } from '../../../../../shared/utils/motion';
import { CALM, CALM_RADIUS, CALM_SHADOW, CALM_SUCCESS, FONTS } from '../../../../../shared/theme/theme';

const DropTarget = forwardRef(function DropTarget({ children, width, hover, hint, matched, badge, celebrateKey = 0 }, ref) {
  const appear = useScaleIn(0);
  const grow = useRef(new Animated.Value(1)).current;
  const glow = usePulse(hint && !matched, { duration: 900 });

  useEffect(() => {
    motion.spring(grow, hover ? 1.08 : 1, { friction: 6 }).start();
  }, [hover]);

  useEffect(() => {
    if (!celebrateKey) return;
    motion.sequence([motion.timing(grow, 1.14, { duration: 140 }), motion.spring(grow, 1, { friction: 4, tension: 160 })]).start();
  }, [celebrateKey]);

  return (
    <Animated.View style={[{ width }, appear]}>
      <Animated.View style={{ transform: [{ scale: grow }] }}>
        <Animated.View
          pointerEvents="none"
          style={[styles.glow, { opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.75] }) }]}
        />
        <View
          ref={ref}
          collapsable={false}
          style={[styles.card, CALM_SHADOW.soft, hover && styles.hover, matched && styles.matched]}
        >
          {children}
          {matched && badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        <Sparkles burstKey={celebrateKey} size={20} count={4} />
      </Animated.View>
    </Animated.View>
  );
});

export default DropTarget;

const styles = StyleSheet.create({
  glow: {
    ...StyleSheet.absoluteFillObject,
    margin: -7,
    borderRadius: CALM_RADIUS.large + 7,
    backgroundColor: CALM.yellow,
  },
  card: {
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: CALM_RADIUS.large,
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: CALM.surface,
  },
  hover: {
    borderColor: CALM.primary,
    backgroundColor: CALM.primaryPale,
  },
  matched: {
    borderColor: CALM_SUCCESS.main,
    backgroundColor: CALM_SUCCESS.pale,
  },
  badge: {
    position: 'absolute',
    top: -12,
    end: -10,
    minWidth: 34,
    height: 34,
    paddingHorizontal: 6,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CALM_SUCCESS.main,
  },
  badgeText: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 17,
    color: CALM.surface,
  },
});
