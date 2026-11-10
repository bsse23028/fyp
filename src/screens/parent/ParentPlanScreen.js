// PARENT PLAN SCREEN - "Turn guidance into manageable home practice." (from Figma)
//
// The hub with the planning tools. A card with a `screen` opens that screen; the others
// say "Coming soon" until their screen exists.
// ("Struggle words" belongs to the English module: src/modules/english/screens/StruggleWordsScreen.js)
//
// Props: { navigation }

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import { showComingSoon } from '../../shared/utils/alerts';
import { COLORS, FONTS } from '../../shared/theme/theme';

// `screen` = the screen the card opens (leave it out for "Coming soon").
const CARDS = [
  { icon: '◎', title: 'Therapist targets', desc: 'Goals shared by your therapist', tint: COLORS.primaryPale, color: COLORS.primary },
  { icon: '▤', title: 'Reading material', desc: 'Upload or type familiar text', tint: COLORS.bluePale, color: '#0369A1' },
  { icon: 'Aa', title: 'Struggle words', screen: 'StruggleWords', desc: 'Recent words that resurface gently', tint: COLORS.yellowPale, color: '#92400E' },
  { icon: '☀', title: 'Routine builder', desc: 'Morning and after-school routines', tint: '#FEF3C7', color: '#B45309' },
  { icon: '▦', title: 'AAC symbol editor', desc: 'Update boards and quick phrases', tint: '#D1FAE5', color: COLORS.success },
];

export default function ParentPlanScreen({ navigation }) {
  function openCard(card) {
    if (card.screen) navigation.navigate(card.screen);
    else showComingSoon(card.title);
  }

  return (
    <Screen scroll mode="parent">
      <View style={styles.body}>
        <Text style={styles.heading}>Plan</Text>
        <Text style={styles.subheading}>Turn guidance into manageable home practice.</Text>

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>THIS WEEK</Text>
          <Text style={styles.heroTitle}>Small steps, repeated gently</Text>
          <Text style={styles.heroCopy}>The therapist gives the plan. KidBuddy helps your family practise it.</Text>
        </View>

        {CARDS.map((card) => (
          <Pressable
            key={card.title}
            onPress={() => openCard(card)}
            accessibilityRole="button"
            style={styles.card}
          >
            <View style={[styles.icon, { backgroundColor: card.tint }]}>
              <Text style={[styles.iconText, { color: card.color }]}>{card.icon}</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDesc}>{card.desc}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  heading: {
    fontFamily: FONTS.interBold,
    fontSize: 24,
    color: COLORS.text,
  },
  subheading: {
    marginTop: 3,
    fontFamily: FONTS.interRegular,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  hero: {
    marginTop: 16,
    marginBottom: 14,
    padding: 18,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
  },
  heroLabel: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 12,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.82)',
  },
  heroTitle: {
    marginTop: 7,
    fontFamily: FONTS.interBold,
    fontSize: 21,
    color: COLORS.white,
  },
  heroCopy: {
    marginTop: 6,
    fontFamily: FONTS.interRegular,
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.88)',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 17,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontFamily: FONTS.interBold,
    fontSize: 22,
  },
  cardText: {
    flex: 1,
    marginHorizontal: 13,
  },
  cardTitle: {
    fontFamily: FONTS.interBold,
    fontSize: 15,
    color: COLORS.text,
  },
  cardDesc: {
    marginTop: 3,
    fontFamily: FONTS.interRegular,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textMuted,
  },
  chevron: {
    fontSize: 22,
    color: COLORS.primary,
  },
});
