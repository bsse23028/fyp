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
//
// Props: { navigation }

import React, { useRef } from 'react';
import { Animated, FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import Mascot from '../../shared/components/Mascot';
import Button from '../../shared/components/Button';
import { COLORS, FONTS, RADIUS, SPACING } from '../../shared/theme/theme';

// Text, emoji and card colour for each card (from Figma).
const CARDS = [
  {
    title: 'Your therapist’s plan, practised at home',
    copy: 'Keep familiar goals going between visits with short activities the whole family can support.',
    icon: '📋',
    cardColor: COLORS.cardBlue,
  },
  {
    title: 'Fun activities that adapt to your child',
    copy: 'Reading, speech, feelings, numbers and routines—paced around your child’s needs.',
    icon: '🧩',
    cardColor: COLORS.cardYellow,
  },
  {
    title: 'A safe, ad-free space, you stay in control',
    copy: 'Parents choose activities, permissions and profiles. Children never need an account.',
    icon: '🛡️',
    cardColor: COLORS.cardGreen,
  },
];

export default function OnboardingScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const cardHeight = Math.max(170, Math.min(300, height * 0.355));

  // scrollX = how far the cards have been swiped, in points (0, width, 2 * width ...)
  const scrollX = useRef(new Animated.Value(0)).current;

  // One card = one swipeable page, exactly as wide as the screen.
  function renderCard({ item }) {
    return (
      <View style={[styles.page, { width }]}>
        <View style={[styles.card, { height: cardHeight, backgroundColor: item.cardColor }]}>
          <Text
            style={{
              fontSize: cardHeight * 0.35,
              lineHeight: cardHeight * 0.35 * 1.25,
              textAlign: 'center',
            }}
          >
            {item.icon}
          </Text>
          <View style={styles.cardMascot}>
            <Mascot size={cardHeight * 0.26} />
          </View>
        </View>

        <Text style={[styles.title, { marginTop: height * 0.04 }]}>{item.title}</Text>
        <Text style={styles.copy}>{item.copy}</Text>
      </View>
    );
  }

  return (
    // paddingHorizontal 0: each card page adds its own side padding,
    // so the cards can slide across the full width of the screen.
    <Screen contentStyle={styles.noSidePadding}>
      <View style={styles.body}>
        <FlatList
          data={CARDS}
          keyExtractor={(item) => item.title}
          renderItem={renderCard}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.list}
          scrollEventThrottle={16}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false, // we animate width + colour, which the native driver can't do
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
              outputRange: [COLORS.border, COLORS.primary, COLORS.border],
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
          <Button title="Create Parent Account" onPress={() => navigation.navigate('SignUp')} />
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMascot: {
    position: 'absolute',
    end: 28,
    bottom: 22,
  },
  title: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 27,
    lineHeight: 32,
    color: COLORS.warmText,
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
});
