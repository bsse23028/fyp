// CHILD HOME SCREEN - what the child sees first.
//
//   - At the top: two bouncing buttons, the child's Buddy and a star (BouncyButton.js).
//       Buddy  -> opens the greeting card: "Good morning / afternoon / evening!" chosen
//                 from the phone's clock (utils/greeting.js) + the child's name
//       Star   -> opens the "Stars today" card (saved with AsyncStorage after each session)
//     Only one card is open at a time. Tap anywhere else on the screen to close it.
//   - "Choose one": English, Numbers, Feelings, Talk, My Day, Sounds
//
// Tap the logo to change the buddy. The 🔒 Parent button (top right) asks for the PIN
// and returns to Parent Mode; 🏠 Home is in the header on the other child screens.
// Only "English" is built so far; the other buttons say "Coming soon".
//
// Props: { navigation }

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import Mascot from '../../shared/components/Mascot';
import BouncyButton from '../../shared/components/BouncyButton';
import SpeakButton from '../../shared/components/SpeakButton';
import { useChild } from '../../app/store/useChild';
import { useLanguage } from '../../app/context/LanguageContext';
import { getGreeting } from '../../shared/utils/greeting';
import { showComingSoon } from '../../shared/utils/alerts';
import { COLORS, FONTS } from '../../shared/theme/theme';

// The six big buttons. `screen` is where it goes (null = not built yet).
const MODULES = [
  { label: 'English', bg: COLORS.bluePale, accent: COLORS.blue, icon: '📖', screen: 'WordsHub' },
  { label: 'Numbers', bg: COLORS.yellowPale, accent: COLORS.yellow, icon: '🔢', screen: null },
  { label: 'Feelings', bg: COLORS.coralPale, accent: COLORS.coral, icon: '💛', screen: null },
  { label: 'Talk', bg: COLORS.sagePale, accent: COLORS.sage, icon: '💬', screen: null },
  { label: 'My Day', bg: COLORS.purplePale, accent: COLORS.purple, icon: '☀️', screen: null },
  { label: 'Sounds', bg: COLORS.orangePale, accent: COLORS.orange, icon: '🎤', screen: null },
];

// A card that pops in under the buttons. `caret` says where the little pointer sits
// ('25%' = under the left button, '75%' = under the right button).
function PopCard({ caret, children }) {
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(pop, { toValue: 1, friction: 7, tension: 120, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.popWrap,
        { opacity: pop, transform: [{ translateY: pop.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }] },
      ]}
    >
      {/* tapping the card itself does nothing, so it does not close */}
      <Pressable onPress={() => {}} accessible={false} style={styles.popCard}>
        <View style={[styles.caret, { start: caret }]} />
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default function ChildHomeScreen({ navigation }) {
  const { activeChild } = useChild();
  const { t } = useLanguage();
  const childName = activeChild ? activeChild.name : 'friend';

  // Which card is open: null, 'greeting' or 'stars'.
  const [openCard, setOpenCard] = useState(null);
  function toggleCard(name) {
    setOpenCard(openCard === name ? null : name);
  }

  // `now` is re-read every minute, so the greeting changes by itself
  // (for example from morning to afternoon) even if the app stays open.
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const greeting = getGreeting(now);

  // Stars earned today (the saved count belongs to one day only).
  const reading = activeChild ? activeChild.reading : null;
  const starsToday = reading && reading.date === todayText(now) ? reading.starsToday : 0;
  const filledStars = Math.min(5, starsToday);

  function openModule(module) {
    if (module.screen) navigation.navigate(module.screen);
    else showComingSoon(module.label);
  }

  return (
    <Screen scroll mode="child">
      {/* tapping any empty part of the screen closes the open card */}
      <Pressable style={styles.body} onPress={() => setOpenCard(null)} accessible={false}>
        {/* the two bouncing buttons */}
        <View style={styles.buddies}>
          <BouncyButton
            active={openCard === 'greeting'}
            onPress={() => toggleCard('greeting')}
            shadowWidth={68}
            accessibilityLabel="Greeting"
          >
            <Mascot size={100} />
          </BouncyButton>

          <BouncyButton
            active={openCard === 'stars'}
            onPress={() => toggleCard('stars')}
            shadowWidth={50}
            delay={350}
            accessibilityLabel="Stars today"
          >
            <View>
              <Text style={styles.bigStar}>⭐</Text>
              {filledStars > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{filledStars}</Text>
                </View>
              )}
            </View>
          </BouncyButton>
        </View>

        {/* greeting card */}
        {openCard === 'greeting' && (
          <PopCard key="greeting" caret="25%">
            <View style={styles.cardRow}>
              <View style={styles.greetingText}>
                <Text style={styles.greetingTitle}>
                  {greeting.text} {greeting.emoji}
                </Text>
                <Text style={styles.greetingSub}>Ready to learn, {childName}?</Text>
              </View>
              <SpeakButton text={`${t(greeting.text)} ${t('Ready to learn, {name}?', { name: childName })}`} />
            </View>
          </PopCard>
        )}

        {/* stars today card */}
        {openCard === 'stars' && (
          <PopCard key="stars" caret="75%">
            <View style={styles.cardRow}>
              <View style={styles.starsText}>
                <Text style={styles.starsTitle}>Stars today</Text>
                <Text style={styles.starsSub}>A little glow for every try</Text>
              </View>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Text key={n} style={[styles.star, { color: n <= filledStars ? COLORS.yellow : '#E2D5C8' }]}>
                    ★
                  </Text>
                ))}
              </View>
            </View>
          </PopCard>
        )}

        {/* today's picks (switched off for now)
        <Text style={styles.sectionTitle}>Today’s picks</Text>
        <View style={styles.picksRow}>
          <Pressable
            style={styles.pick}
            onPress={() => navigation.navigate('ReadingAlong', { index: 0 })}
            accessibilityRole="button"
          >
            <Text style={styles.pickIcon}>📖</Text>
            <Text style={styles.pickLabel}>Read with me</Text>
          </Pressable>
          <Pressable style={styles.pick} onPress={() => showComingSoon('Morning steps')} accessibilityRole="button">
            <Text style={styles.pickIcon}>☀️</Text>
            <Text style={styles.pickLabel}>Morning steps</Text>
          </Pressable>
        </View> */}

        {/* module grid */}
        <Text style={styles.sectionTitle}>Choose one</Text>
        <View style={styles.grid}>
          {MODULES.map((module) => (
            <Pressable
              key={module.label}
              onPress={() => openModule(module)}
              accessibilityRole="button"
              style={[styles.module, { backgroundColor: module.bg, borderColor: module.accent + '30' }]}
            >
              <Text style={styles.moduleIcon}>{module.icon}</Text>
              <Text style={styles.moduleLabel}>{module.label}</Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Screen>
  );
}

// "2026-10-12" - same format childSlice uses for the saved day.
function todayText(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingBottom: 8,
  },
  buddies: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  bigStar: {
    fontSize: 64,
    lineHeight: 80,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    end: -8,
    minWidth: 26,
    height: 26,
    paddingHorizontal: 6,
    borderRadius: 13,
    backgroundColor: COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 14,
    color: COLORS.white,
  },
  popWrap: {
    marginTop: 14,
  },
  popCard: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  caret: {
    position: 'absolute',
    top: -8,
    marginStart: -8,
    width: 16,
    height: 16,
    borderRadius: 3,
    backgroundColor: COLORS.white,
    transform: [{ rotate: '45deg' }],
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: {
    flex: 1,
    marginEnd: 12,
  },
  greetingTitle: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 22,
    lineHeight: 26,
    color: COLORS.warmText,
  },
  greetingSub: {
    marginTop: 3,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 15,
    color: COLORS.warmMuted,
  },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 10,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 15,
    color: COLORS.warmMuted,
  },
  picksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pick: {
    width: '48%',
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.sagePale,
    backgroundColor: COLORS.white,
  },
  pickIcon: {
    fontSize: 28,
    marginEnd: 9,
  },
  pickLabel: {
    flex: 1,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 14,
    color: COLORS.warmText,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  module: {
    width: '48%',
    minHeight: 130,
    marginBottom: 14,
    paddingVertical: 22,
    paddingHorizontal: 14,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleIcon: {
    fontSize: 44,
    lineHeight: 54,
  },
  moduleLabel: {
    marginTop: 8,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 18,
    color: COLORS.warmText,
    textAlign: 'center',
  },
  starsText: {
    flex: 1,
  },
  starsTitle: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 17,
    color: COLORS.warmText,
  },
  starsSub: {
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 13,
    color: COLORS.warmMuted,
  },
  starsRow: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 20,
    marginStart: 3,
  },
});
