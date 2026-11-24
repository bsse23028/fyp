// MODULE CARD - one big pastel tile of Child Home (English, Numbers ...), in the inspo look: the tile has the
// module's pastel colour (CATEGORY in theme.js), a large icon on a soft white disc and the name in big purple letters.
// It is a little bit alive:
//   arrives   the cards come in one after another (CARD_STAGGER apart)
//   idle      the icon bobs gently with its own timing; it stops when `active` is false (the screen is not
//             in front) and never starts when animations are off
//   tap       the card squashes with a spring and the icon hops; ChildHomeScreen then lets the buddy say
//             the name and opens the module a moment later
//   wobbleKey changes -> a small shy wobble (a module that is not built yet)
// The icon is the picture from moduleIcons.js, or the module's flat icon (iconName, AppIcon) in its category
// colour while there is none (or its emoji, when it has no iconName).
// A group with nothing built yet (`module.soon`) shows a small "Coming soon" label (it still opens its group page).
// Props: { module, index, active, isPreview, wobbleKey, onPress(module) }

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text as PlainText, View } from 'react-native';
import Text from '../../../shared/components/AppText';
import AppIcon from '../../../shared/components/AppIcon';
import { hop, motion, pressIn, pressOut, useEntrance, wiggle, wiggleRotate } from '../../../shared/utils/motion';
import { CALM, FONTS, PALETTE } from '../../../shared/theme/theme';
import { DESIGN } from '../../../shared/theme/designConfig';
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
          <View style={[styles.card, { backgroundColor: module.accent.pale }]}>

            <Animated.View style={{ transform: [{ translateY: iconMove }, { scale: squash }] }}>
              <View style={styles.disc}>
                {icon.image ? (
                  <Image source={icon.image} style={styles.picture} resizeMode="contain" />
                ) : module.iconName ? (
                  <AppIcon name={module.iconName} size={HOME.CARD_DISC * 0.52} color={module.accent.deep} />
                ) : (
                  <PlainText style={styles.emoji}>{module.icon}</PlainText>
                )}
              </View>
            </Animated.View>

            <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>
              {module.label}
            </Text>

            {module.soon ? (
              <View style={styles.soonTag}>
                <Text style={styles.soonText}>Coming soon</Text>
              </View>
            ) : null}
          </View>
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
    borderRadius: DESIGN.TILE_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  disc: {
    width: HOME.CARD_DISC,
    height: HOME.CARD_DISC,
    borderRadius: HOME.CARD_DISC / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  picture: {
    width: HOME.CARD_DISC * 0.72,
    height: HOME.CARD_DISC * 0.72,
  },
  emoji: {
    fontSize: HOME.CARD_DISC * 0.5,
    lineHeight: HOME.CARD_DISC * 0.64,
    textAlign: 'center',
    textShadowColor: 'rgba(61, 31, 92, 0.22)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  label: {
    marginTop: 10,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 21,
    color: PALETTE.purple,
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
