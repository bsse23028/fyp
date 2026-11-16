// MODULE CARD - one big "glass paper" card of Child Home (English, Numbers ...): a large icon on a soft
// round disc, the module name in big rounded letters, and a soft pastel wash of the module's colour.
// It is a little bit alive:
//   arrives   the cards come in one after another (CARD_STAGGER apart)
//   idle      the icon bobs gently with its own timing; it stops when `active` is false (the screen is not
//             in front) and never starts when animations are off
//   tap       the card squashes with a spring and the icon hops; ChildHomeScreen then lets the buddy say
//             the name and opens the module a moment later
//   wobbleKey changes -> a small shy wobble (a module that is not built yet)
// The icon is the picture from moduleIcons.js, or the module's emoji drawn very large while there is none.
// In Preview mode a module that is not built yet also shows a small "Coming soon" label.
// Props: { module, index, active, isPreview, wobbleKey, onPress(module) }

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text as PlainText, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../../../shared/components/AppText';
import Glass from './Glass';
import { hop, motion, pressIn, pressOut, useEntrance, wiggle, wiggleRotate } from '../../../shared/utils/motion';
import { CALM, FONTS, GLASS } from '../../../shared/theme/theme';
import { MODULE_ICONS } from '../moduleIcons';
import { HOME } from '../homeConfig';

export default function ModuleCard({ module, index, active, isPreview, wobbleKey = 0, onPress }) {
  const entrance = useEntrance(index, { stagger: HOME.CARD_STAGGER, duration: 320, distance: 18 });
  const press = useRef(new Animated.Value(1)).current; // the squash while pressed
  const bob = useRef(new Animated.Value(0)).current; // the gentle idle bob (0 to 1)
  const lift = useRef(new Animated.Value(0)).current; // the hop on a tap
  const squash = useRef(new Animated.Value(1)).current;
  const shy = useRef(new Animated.Value(0)).current; // the "not yet" wobble
  const icon = MODULE_ICONS[module.id] || {};

  // The idle bob: every card has its own start time, so they do not move in step.
  useEffect(() => {
    if (!active) {
      bob.setValue(0);
      return undefined;
    }
    const ease = Easing.inOut(Easing.sin);
    const half = HOME.CARD_BOB_TIME / 2;
    const loop = motion.sequence([
      motion.delay(index * 370),
      motion.loop(
        motion.sequence([
          motion.timing(bob, 1, { duration: half, easing: ease }),
          motion.timing(bob, 0, { duration: half, easing: ease }),
        ])
      ),
    ]);
    loop.start();
    return () => loop.stop();
  }, [active]);

  useEffect(() => {
    if (wobbleKey) wiggle(shy, { swings: 2, duration: 150 }).start();
  }, [wobbleKey]);

  function handlePress() {
    hop(lift, squash, HOME.CARD_ICON_HOP).start();
    onPress(module);
  }

  const iconMove = Animated.add(lift, bob.interpolate({ inputRange: [0, 1], outputRange: [0, -HOME.CARD_BOB] }));

  return (
    <Animated.View style={[styles.wrap, entrance]}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => pressIn(press)}
        onPressOut={() => pressOut(press)}
        accessibilityRole="button"
        accessibilityLabel={module.label}
      >
        <Animated.View style={{ transform: [{ scale: press }, { rotate: wiggleRotate(shy, HOME.CARD_WOBBLE) }] }}>
          <Glass style={styles.card} blur={HOME.BLUR_CARDS}>
            {/* a soft wash of the module's colour, strongest at the top */}
            <LinearGradient colors={[module.accent.pale, 'rgba(255, 255, 255, 0)']} style={styles.wash} />

            <Animated.View style={{ transform: [{ translateY: iconMove }, { scale: squash }] }}>
              <View style={[styles.disc, { backgroundColor: module.accent.pale, borderColor: module.accent.main }]}>
                {icon.image ? (
                  <Image source={icon.image} style={styles.picture} resizeMode="contain" />
                ) : (
                  <PlainText style={styles.emoji}>{module.icon}</PlainText>
                )}
              </View>
            </Animated.View>

            <Text style={[styles.label, { color: module.accent.deep }]} numberOfLines={1} adjustsFontSizeToFit>
              {module.label}
            </Text>

            {isPreview && !module.screen ? (
              <View style={styles.soonTag}>
                <Text style={styles.soonText}>Coming soon</Text>
              </View>
            ) : null}
          </Glass>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: HOME.CARD_WIDTH,
    marginBottom: HOME.CARD_GAP,
  },
  card: {
    minHeight: HOME.CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  wash: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: GLASS.radius,
    opacity: 0.9,
  },
  disc: {
    width: HOME.CARD_DISC,
    height: HOME.CARD_DISC,
    borderRadius: HOME.CARD_DISC / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  picture: {
    width: HOME.CARD_DISC * 0.72,
    height: HOME.CARD_DISC * 0.72,
  },
  emoji: {
    fontSize: HOME.CARD_DISC * 0.5,
    lineHeight: HOME.CARD_DISC * 0.64,
    textAlign: 'center',
    textShadowColor: 'rgba(70, 50, 30, 0.22)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  label: {
    marginTop: 10,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 21,
    textAlign: 'center',
  },
  soonTag: {
    marginTop: 6,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  soonText: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 12,
    color: CALM.textSoft,
  },
});
