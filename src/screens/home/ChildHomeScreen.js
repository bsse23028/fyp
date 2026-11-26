// CHILD HOME SCREEN - what the child sees first. This file only puts the pieces together;
// the pieces are in ./components and every number is in ./homeConfig.js.
//
//   HomeBackground  a soft gradient with a few slowly drifting shapes
//   GlassBar        the quick-start bar: Alphabets, Words, Sentences (one tap, skips the English hub).
//                   NAV_POSITION in homeConfig.js puts it under the header ('top') or floating at the bottom.
//                   The Alphabets button glows softly when the child has started the letters but not finished.
//   BuddyHero       the child's buddy walks in, waves and greets ("Good morning, Zara!", spoken once per visit)
//   StarsChip       a small glass chip with the stars earned today
//   PopCard         the greeting card (tap the speech bubble) and the "Stars today" card (tap the chip).
//                   Only one card is open at a time; tap anywhere else to close it.
//   ModuleGrid      "Choose one": six big glass cards (ModuleCard), icons from moduleIcons.js.
//                   A tap: the buddy says the module's name and the module opens a moment later.
//                   A module that is not built yet: the card wobbles shyly and the buddy says "Coming soon!".
//
// Tap the logo to change the buddy. The 🔒 Parent button (top right) asks for the PIN and returns to
// Parent Mode. Only "English" is built so far; the other modules say "Coming soon" (in Preview mode they
// also show a label). Nothing on this screen is saved.
//
// Props: { navigation }

import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import SpeakButton from '../../shared/components/SpeakButton';
import HomeBackground from './components/HomeBackground';
import GlassBar from './components/GlassBar';
import BuddyHero from './components/BuddyHero';
import StarsChip from './components/StarsChip';
import PopCard from './components/PopCard';
import ModuleGrid from './components/ModuleGrid';
import { useChild } from '../../app/store/useChild';
import { usePreview } from '../../app/store/usePreview';
import { useLanguage } from '../../app/context/LanguageContext';
import { selectLetterStars } from '../../modules/english/store/alphabetSlice';
import { getGreeting } from '../../shared/utils/greeting';
import { CALM_ACCENTS, COLORS, FONTS, GLASS } from '../../shared/theme/theme';
import { HOME } from './homeConfig';

const LETTER_COUNT = 26;

// The six modules. `id` = its name in moduleIcons.js, `screen` = where it goes (null = not built yet),
// `icon` = the emoji drawn while it has no picture, `accent` = its soft colour family (theme.js).
const MODULES = [
  { id: 'english', label: 'English', accent: CALM_ACCENTS[1], icon: '📖', screen: 'EnglishHub' },
  { id: 'numbers', label: 'Numbers', accent: CALM_ACCENTS[3], icon: '🔢', screen: null },
  { id: 'feelings', label: 'Feelings', accent: CALM_ACCENTS[2], icon: '💛', screen: null },
  { id: 'talk', label: 'Talk', accent: CALM_ACCENTS[4], icon: '💬', screen: null },
  { id: 'myday', label: 'My Day', accent: CALM_ACCENTS[5], icon: '☀️', screen: null },
  { id: 'sounds', label: 'Sounds', accent: CALM_ACCENTS[0], icon: '🎤', screen: null },
];

export default function ChildHomeScreen({ navigation }) {
  const { activeChild } = useChild();
  const { isPreview } = usePreview();
  const { t } = useLanguage();
  const focused = useIsFocused(); // false while another screen is in front: every loop stops
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
  // 'Good morning!' -> 'Good morning, {name}!' (the buddy's speech bubble)
  const greetingKey = greeting.text.replace('!', ', {name}!');

  // Stars earned today (the saved count belongs to one day only).
  const reading = activeChild ? activeChild.reading : null;
  const starsToday = reading && reading.date === todayText(now) ? reading.starsToday : 0;
  const filledStars = Math.min(5, starsToday);

  // "Continue here": the child has finished some letters, but not all of them yet.
  const letterStars = useSelector((state) => selectLetterStars(state, activeChild ? activeChild.id : null));
  const lettersDone = Object.values(letterStars).filter((stars) => stars > 0).length;
  const hintId = lettersDone > 0 && lettersDone < LETTER_COUNT ? 'alphabets' : null;

  // What the buddy says in its bubble (a module name or "Coming soon!"), and which card wobbles.
  const [buddyLine, setBuddyLine] = useState({ text: null, key: 0 });
  const [wobble, setWobble] = useState({ id: null, key: 0 });
  const openTimer = useRef(null);
  useEffect(() => () => clearTimeout(openTimer.current), []);

  function openModule(module) {
    if (!module.screen) {
      // not built yet: a shy wobble and the buddy says so (no pop-up)
      setWobble((w) => ({ id: module.id, key: w.key + 1 }));
      setBuddyLine((line) => ({ text: 'Coming soon!', key: line.key + 1 }));
      return;
    }
    setBuddyLine((line) => ({ text: module.label, key: line.key + 1 }));
    // open it a moment later, so the squash and the hop are seen
    clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => navigation.navigate(module.screen), HOME.CARD_NAV_DELAY);
  }

  const bar = <GlassBar active={focused} hintId={hintId} onOpen={(item) => navigation.navigate(item.screen)} />;
  const barAtBottom = HOME.NAV_POSITION === 'bottom';

  return (
    <Screen mode="child" contentStyle={styles.noPadding} background={GLASS.gradient[0]}>
      <HomeBackground active={focused}>
        {!barAtBottom ? <View style={styles.topBar}>{bar}</View> : null}

        <ScrollView
          contentContainerStyle={[styles.scroll, barAtBottom && { paddingBottom: HOME.BOTTOM_BAR_SPACE }]}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
        >
          {/* tapping any empty part of the page closes the open card */}
          <Pressable style={styles.body} onPress={() => setOpenCard(null)} accessible={false}>
            <BuddyHero
              greetingKey={greetingKey}
              name={childName}
              onBubblePress={() => toggleCard('greeting')}
              message={buddyLine.text}
              messageKey={buddyLine.key}
              active={focused}
            >
              <StarsChip count={filledStars} onPress={() => toggleCard('stars')} />
            </BuddyHero>

            {/* greeting card */}
            {openCard === 'greeting' && (
              <PopCard key="greeting">
                <View style={styles.cardRow}>
                  <View style={styles.cardText}>
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
              <PopCard key="stars">
                <View style={styles.cardRow}>
                  <View style={styles.cardText}>
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

            <Text style={styles.sectionTitle}>Choose one</Text>
            <ModuleGrid
              modules={MODULES}
              active={focused}
              isPreview={isPreview}
              wobbleId={wobble.id}
              wobbleKey={wobble.key}
              onOpen={openModule}
            />
          </Pressable>
        </ScrollView>

        {barAtBottom ? <View style={styles.bottomBar}>{bar}</View> : null}
      </HomeBackground>
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
  // the background must reach the screen edges, so the Screen's own padding is switched off
  noPadding: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  topBar: {
    marginTop: 8,
    marginHorizontal: HOME.BAR_SIDE_MARGIN,
    zIndex: 5,
  },
  bottomBar: {
    position: 'absolute',
    left: HOME.BAR_SIDE_MARGIN,
    right: HOME.BAR_SIDE_MARGIN,
    bottom: 12,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: HOME.SIDE_PADDING,
    paddingTop: HOME.SECTION_GAP,
    paddingBottom: 16,
  },
  body: {
    flex: 1,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
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
  sectionTitle: {
    marginTop: HOME.SECTION_GAP,
    marginBottom: 10,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 15,
    color: COLORS.warmMuted,
  },
});
