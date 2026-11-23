// ONBOARDING SCREEN - the 3 intro cards ("Your therapist's plan...", etc.)
//
// ONE screen with 3 cards. The parent SWIPES left / right to move between
// them (no "Continue" button any more). The dots at the bottom grow smoothly
// while swiping, and the button underneath always says "Create Parent Account".
//
// How the swiping works (all built into React Native, no extra package):
//   - a horizontal FlatList with `pagingEnabled` snaps one card at a time
//   - `scrollX` follows the finger; the dots read it to animate their width
//
// FIXED screen (no up/down scrolling): the coloured card shrinks on small phones.
// Each card's picture is OnboardingArt.js: one of the KidBuddy buddies + three flat icon badges
// (no emoji), in the card's palette colour.
// The LAST card ("Try KidBuddy first") lets a parent explore Child Mode as the demo child Buddy BEFORE
// signing up (Explore KidBuddy = Preview mode, nothing is saved); "Exit preview" brings them back here.
// Every card also has its OWN page colours (PAGE_COLORS below): the page, the top bar, the phone's status
// bar, the title, the text and the active dot all switch when the swipe is halfway to the next card.
// The pages are always light (never dark); the text colours were picked to be easy to read on them.
//
// Props: { navigation }

import React, { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import OnboardingArt from './OnboardingArt';
import Button from '../../shared/components/Button';
import { usePreview } from '../../app/store/usePreview';
import { goToChildHome } from '../../app/navigation/helpers';
import { KEYS, saveData } from '../../shared/utils/storage';
import { CATEGORY, COLORS, FONTS, PALETTE, RADIUS, SPACING } from '../../shared/theme/theme';

// The colours of each card's page (light backgrounds only). title / text = what is easy to read on it,
// button = the "Create Parent Account" button on that card (white text on it is easy to read).
const PAGE_COLORS = [
  { page: PALETTE.lavenderMist, title: PALETTE.purple, text: '#62507A', button: PALETTE.purple }, // lilac card (a slightly darker plum, easy to read)
  { page: '#FDF6D8', title: PALETTE.coralText, text: '#6E5A2B', button: PALETTE.coralText }, // a pale butter page for the yellow card
  { page: '#E6F6F1', title: PALETTE.mintDeep, text: '#3F5F59', button: PALETTE.mintDeep }, // a pale mint page for the mint card
  { page: '#EAF3FC', title: '#2E6A8A', text: '#3E5568', button: '#2E6A8A' }, // a pale sky page for the "Try it first" card
];

// Text, picture and card colour for each card.
//   avatar = the buddy in the middle (theme/avatars.js), icons = the 3 floating badges (AppIcon names)
const CARDS = [
  {
    title: 'Your therapist’s plan, practised at home',
    copy: 'Keep familiar goals going between visits with short activities the whole family can support.',
    cardColor: PALETTE.pastelLilac,
    avatar: 'panda',
    icons: [
      { name: 'clipboard-check-outline', color: CATEGORY.art.deep },
      { name: 'home-heart', color: CATEGORY.reading.deep },
      { name: 'calendar-heart', color: CATEGORY.calm.deep },
    ],
  },
  {
    title: 'Fun activities that adapt to your child',
    copy: 'Reading, speech, feelings, numbers and routines—paced around your child’s needs.',
    cardColor: PALETTE.pastelYellow,
    avatar: 'fox',
    icons: [
      { name: 'book-open-variant', color: CATEGORY.reading.deep },
      { name: 'puzzle', color: CATEGORY.art.deep },
      { name: 'music-note', color: CATEGORY.music.deep },
    ],
  },
  {
    title: 'A safe, ad-free space, you stay in control',
    copy: 'Parents choose activities, permissions and profiles. Children never need an account.',
    cardColor: PALETTE.pastelMint,
    avatar: 'bear',
    icons: [
      { name: 'shield-check', color: CATEGORY.calm.deep },
      { name: 'lock', color: CATEGORY.art.deep },
      { name: 'account-heart', color: CATEGORY.reading.deep },
    ],
  },
  {
    // the last card: look around BEFORE signing up (Explore KidBuddy = Preview mode, nothing is saved)
    title: 'Try KidBuddy first',
    copy: 'See exactly what your child will see. Play as Buddy, our demo child. No account needed, nothing is saved.',
    cardColor: PALETTE.pastelBlue,
    avatar: 'puppy', // the blue buddy, to match the blue card
    explore: true,
    icons: [
      { name: 'compass-outline', color: CATEGORY.music.deep },
      { name: 'gesture-tap', color: CATEGORY.art.deep },
      { name: 'eye-outline', color: CATEGORY.calm.deep },
    ],
  },
];

export default function OnboardingScreen({ navigation, route }) {
  const { width, height } = useWindowDimensions();
  const { startPreview } = usePreview();
  // back from "Explore KidBuddy": open on the last card (route param startAtLast)
  const startPage = route.params && route.params.startAtLast ? CARDS.length - 1 : 0;
  const cardHeight = Math.max(180, Math.min(340, height * 0.4));

  // scrollX = how far the cards have been swiped, in points (0, width, 2 * width ...)
  const scrollX = useRef(new Animated.Value(startPage * width)).current;

  // The card that is (more than half) in view: its colours are used for the page.
  const [page, setPage] = useState(startPage);
  const colors = PAGE_COLORS[page] || PAGE_COLORS[0];
  function handleScroll(event) {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    if (next !== page && next >= 0 && next < CARDS.length) setPage(next);
  }

  // Explore KidBuddy before signing up: Child Mode with the demo child Buddy. Leaving it brings the
  // parent back here (FixedHeader -> goToIntroAfterPreview).
  function explore() {
    saveData(KEYS.explored, true); // Parent Home will not show its "New to KidBuddy?" card again
    startPreview();
    goToChildHome(navigation);
  }

  // the phone's status bar (time, battery) takes the page colour too
  useEffect(() => {
    navigation.setOptions({ statusBarBackgroundColor: colors.page });
  }, [colors.page]);

  // One card = one swipeable page, exactly as wide as the screen.
  function renderCard({ item, index }) {
    const own = PAGE_COLORS[index] || PAGE_COLORS[0];
    return (
      <View style={[styles.page, { width }]}>
        <View style={[styles.card, { height: cardHeight, backgroundColor: item.cardColor }]}>
          <OnboardingArt height={cardHeight} avatar={item.avatar} icons={item.icons} />
        </View>

        <Text style={[styles.title, { marginTop: height * 0.04, color: own.title }]}>{item.title}</Text>
        <Text style={[styles.copy, { color: own.text }]}>{item.copy}</Text>
      </View>
    );
  }

  return (
    // paddingHorizontal 0: each card page adds its own side padding,
    // so the cards can slide across the full width of the screen.
    <Screen contentStyle={styles.noSidePadding} background={colors.page} headerColor={colors.page}>
      <View style={styles.body}>
        <FlatList
          data={CARDS}
          keyExtractor={(item) => item.title}
          renderItem={renderCard}
          horizontal
          pagingEnabled
          initialScrollIndex={startPage}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          showsHorizontalScrollIndicator={false}
          style={styles.list}
          scrollEventThrottle={16}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false, // we animate width + colour, which the native driver can't do
            listener: handleScroll, // and switch the page colours halfway through a swipe
          })}
        />

        {/* pushes the dots + button to the bottom */}
        <View style={styles.spacer} />

        {/* progress dots: the dot of the card you are on stretches out */}
        <View style={styles.dots}>
          {CARDS.map((_, index) => {
            const range = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange: range,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const dotColor = scrollX.interpolate({
              inputRange: range,
              outputRange: [COLORS.border, colors.title, COLORS.border],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={index}
                style={[styles.dot, { width: dotWidth, backgroundColor: dotColor }]}
              />
            );
          })}
        </View>

        <View style={styles.buttonWrap}>
          {CARDS[page] && CARDS[page].explore ? (
            <>
              <Button
                title="Explore KidBuddy"
                variant="secondary"
                onPress={explore}
                style={{ backgroundColor: PALETTE.cloudWhite, borderColor: colors.button }}
                textColor={colors.button}
              />
              <Button
                title="Create Parent Account"
                onPress={() => navigation.navigate('SignUp')}
                style={[styles.second, { backgroundColor: colors.button, borderColor: colors.button }]}
              />
            </>
          ) : (
            <Button
              title="Create Parent Account"
              onPress={() => navigation.navigate('SignUp')}
              style={{ backgroundColor: colors.button, borderColor: colors.button }}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  noSidePadding: {
    paddingHorizontal: 0,
  },
  body: {
    flex: 1,
  },
  list: {
    flexGrow: 0,
  },
  page: {
    paddingHorizontal: SPACING.screen,
    paddingTop: 16,
  },
  card: {
    borderRadius: RADIUS.card,
    overflow: 'hidden',
  },
  title: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 27,
    lineHeight: 32,
    color: COLORS.heading,
  },
  copy: {
    marginTop: 12,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 16,
    lineHeight: 25,
    color: COLORS.warmMuted,
  },
  spacer: {
    flex: 1,
    minHeight: 12,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    height: 8,
    marginHorizontal: 4,
    borderRadius: 4,
  },
  buttonWrap: {
    paddingHorizontal: SPACING.screen,
  },
  second: {
    marginTop: 10,
  },
});
