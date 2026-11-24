// CHILD HOME SCREEN - what the child sees first. This file only puts the pieces together;
// the pieces are in ./components and every number is in ./homeConfig.js.
//
//   HomeBackground  a soft gradient with a few slowly drifting shapes
//   BuddyHero       the child's buddy walks in, waves and greets ("Good morning, Zara!", spoken once per visit)
//   StarsChip       a small glass chip with the stars earned today
//   PopCard         the "Stars today" card (tap the chip); tap anywhere else to close it.
//                   Tapping the speech bubble only reads the greeting aloud (the greeting card was removed).
//   ModuleGrid      "What shall we learn?": the learning GROUPS of the FYP proposal (learningGroups.js) as big
//                   pastel tiles (ModuleCard), ONLY those with an activity the parent switched on for this
//                   child (none on = "No activities yet. Ask a grown-up to switch some on."). A tile opens its module hub, or its group page with the proposal
//                   modules ("Coming soon" until built). The ONLY way into a module; there is no quick-start bar.
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
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import { speakUi } from '../../shared/utils/speech';
import HomeBackground from './components/HomeBackground';
import BuddyHero from './components/BuddyHero';
import StarsChip from './components/StarsChip';
import PopCard from './components/PopCard';
import ModuleGrid from './components/ModuleGrid';
import Sheet from '../../shared/components/Sheet';
import AppIcon from '../../shared/components/AppIcon';
import { useChild } from '../../app/store/useChild';
import { usePreview } from '../../app/store/usePreview';
import { getGreeting } from '../../shared/utils/greeting';
import { COLORS, FONTS } from '../../shared/theme/theme';
import { groupIsBuilt, groupTarget, visibleGroups } from './learningGroups';
import { HOME } from './homeConfig';

// The tiles = the learning GROUPS of the FYP proposal (learningGroups.js), in the proposal's order, but ONLY
// the groups with at least one activity the parent switched on for this child (visibleGroups).
// Each tile opens ONE screen: its learning module's hub (Reading & Writing -> English, Talk -> the AAC board)
// or its group page listing its modules ("Coming soon" while they are not built). `soon` = nothing built yet.
function tilesFor(child) {
  return visibleGroups(child).map((group) => {
    const target = groupTarget(group);
    return {
      id: group.id,
      label: group.label,
      accent: group.accent,
      iconName: group.iconName,
      screen: target.screen,
      params: target.params,
      soon: !groupIsBuilt(group),
    };
  });
}

export default function ChildHomeScreen({ navigation }) {
  const { activeChild } = useChild();
  const { isPreview } = usePreview();
  const focused = useIsFocused(); // false while another screen is in front: every loop stops
  const childName = activeChild ? activeChild.name : 'friend';
  const tiles = tilesFor(activeChild); // only the activities switched on for this child

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
    openTimer.current = setTimeout(() => navigation.navigate(module.screen, module.params), HOME.CARD_NAV_DELAY);
  }

  // "What shall we learn?" + the module tiles (they sit on the pale sheet when HOME.USE_SHEET is true)
  const modules = (
    <>
      <Text style={styles.sectionTitle}>What shall we learn?</Text>
      {tiles.length > 0 ? (
        <ModuleGrid
          modules={tiles}
          active={focused}
          isPreview={isPreview}
          wobbleId={wobble.id}
          wobbleKey={wobble.key}
          onOpen={openModule}
        />
      ) : (
        // nothing switched on yet: a calm note for the child (the parent switches activities on in Edit profile)
        <View style={styles.empty}>
          <AppIcon name="puzzle-outline" size={40} color={COLORS.heading} />
          <Text style={styles.emptyTitle}>No activities yet</Text>
          <Text style={styles.emptyText}>Ask a grown-up to switch some on.</Text>
        </View>
      )}
    </>
  );

  return (
    <Screen mode="child" contentStyle={styles.noPadding}>
      <HomeBackground active={focused}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
        >
          {/* tapping any empty part of the page closes the open card */}
          <Pressable style={styles.body} onPress={() => setOpenCard(null)} accessible={false}>
            <BuddyHero
              greetingKey={greetingKey}
              name={childName}
              onBubblePress={() => {
                setOpenCard(null);
                speakUi(greetingKey, { name: childName }); // the bubble only reads the greeting aloud (no card)
              }}
              message={buddyLine.text}
              messageKey={buddyLine.key}
              active={focused}
            >
              <StarsChip count={filledStars} onPress={() => toggleCard('stars')} />
            </BuddyHero>

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
                      <Text key={n} style={[styles.star, { color: n <= filledStars ? COLORS.yellow : COLORS.warmBorder }]}>
                        ★
                      </Text>
                    ))}
                  </View>
                </View>
              </PopCard>
            )}

            {HOME.USE_SHEET ? <Sheet style={styles.sheet}>{modules}</Sheet> : modules}
          </Pressable>
        </ScrollView>

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
    marginBottom: 12,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 24,
    color: COLORS.heading,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: COLORS.white,
  },
  emptyTitle: {
    marginTop: 8,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 20,
    color: COLORS.heading,
  },
  emptyText: {
    marginTop: 4,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 15,
    textAlign: 'center',
    color: COLORS.warmMuted,
  },
  // the sheet reaches the screen edges and the bottom (this screen has its own side padding)
  sheet: {
    marginTop: HOME.SECTION_GAP,
    marginHorizontal: -HOME.SIDE_PADDING,
    marginBottom: -16,
  },
});
