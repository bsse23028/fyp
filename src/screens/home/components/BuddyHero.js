// BUDDY HERO - the top of Child Home: the child's own buddy, bigger, standing on its soft floor shadow.
//   When the screen opens the buddy WALKS IN from the side, WAVES once, and a glass speech bubble shows the
//   greeting ("Good morning, Zara!"). The greeting is spoken ONCE per visit (not again when the child comes
//   back from a lesson, because this screen stays open in the background).
//   Tapping the buddy keeps its usual behaviour ("Hey! I am your buddy!", hop, drag and walk back home).
//   Tapping the speech bubble opens the greeting card (onBubblePress).
//   children = what sits above the bubble at the side (the stars chip).
// In Urdu the row is mirrored, so the buddy stands on the right and walks in from the right.
//   message / messageKey = a line the buddy says in its own little bubble (a module name, "Coming soon!").
//   active = false (the screen is not in front) pauses the buddy's idle bob.
// Props: { greetingKey, name, onBubblePress, message, messageKey, active, children }
//   greetingKey = 'Good morning, {name}!' (translated and filled with the name here)

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import Text from '../../../shared/components/AppText';
import BuddyCharacter from '../../../shared/components/BuddyCharacter';
import Glass from './Glass';
import { useLanguage } from '../../../app/context/LanguageContext';
import { useDirection } from '../../../shared/utils/direction';
import { motion } from '../../../shared/utils/motion';
import { speakUi } from '../../../shared/utils/speech';
import { CALM, FONTS, GLASS } from '../../../shared/theme/theme';
import { HOME } from '../homeConfig';

export default function BuddyHero({ greetingKey, name, onBubblePress, message, messageKey, active = true, children }) {
  const { t } = useLanguage();
  const { isRTL } = useDirection();
  const [arrived, setArrived] = useState(false);
  const appear = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);
  const latest = useRef({});
  latest.current = { greetingKey, name };

  useEffect(() => () => clearTimeout(timer.current), []);

  // The buddy has walked in and is waving: show the greeting bubble and say it (only this one time).
  function handleEntered() {
    timer.current = setTimeout(() => {
      setArrived(true);
      motion.spring(appear, 1, { friction: 7, tension: 90 }).start();
      speakUi(latest.current.greetingKey, { name: latest.current.name });
    }, HOME.BUBBLE_DELAY);
  }

  const bubbleStyle = {
    opacity: appear,
    transform: [{ scale: appear.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
  };

  return (
    <View style={styles.hero}>
      <BuddyCharacter
        size={HOME.BUDDY_SIZE}
        enterFromLeft={!isRTL}
        enterFromRight={isRTL}
        enterGreeting={null}
        onEntered={handleEntered}
        bubbleSide
        message={message}
        messageKey={messageKey}
        active={active}
      />
      <View style={styles.side}>
        <View style={styles.chip}>{children}</View>
        <Animated.View style={bubbleStyle} pointerEvents={arrived ? 'auto' : 'none'}>
          <Pressable onPress={onBubblePress} accessibilityRole="button" accessibilityLabel="Greeting">
            <Glass style={styles.bubble} radius={GLASS.radius} strong>
              <Text style={styles.greeting}>{t(greetingKey, { name })}</Text>
            </Glass>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: HOME.BUDDY_SIZE + 12,
    paddingBottom: 6,
  },
  side: {
    flex: 1,
    alignSelf: 'stretch',
    marginStart: HOME.HERO_GAP,
    justifyContent: 'space-between',
  },
  chip: {
    alignSelf: 'flex-end',
  },
  bubble: {
    minHeight: 56,
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 26,
  },
  greeting: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 20,
    lineHeight: 26,
    color: CALM.text,
  },
});
