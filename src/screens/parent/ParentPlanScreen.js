// PARENT PLAN SCREEN - "Turn guidance into manageable home practice.", in the inspo look
// (like "Psst, What are your goals?"): the big purple title with the buddy, then the pale sheet with
// a mint "This week" card and the planning tools as white cards.
//
// A card with a `screen` opens that screen; the others say "Coming soon" until their screen exists.
// The learning modules add their own cards (MODULE_PARENT_TOOLS, e.g. English's "Struggle words");
// the cards listed here belong to Parent Mode itself (all "Coming soon" for now).
//
// Props: { navigation }

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import PageTitle from '../../shared/components/PageTitle';
import Sheet from '../../shared/components/Sheet';
import ProgressCard from '../../shared/components/ProgressCard';
import Tag from '../../shared/components/Tag';
import { showComingSoon } from '../../shared/utils/alerts';
import { MODULE_PARENT_TOOLS } from '../../modules';
import { DESIGN } from '../../shared/theme/designConfig';
import { CATEGORY, COLORS, FONTS, PALETTE } from '../../shared/theme/theme';

// `screen` = the screen the card opens (leave it out for "Coming soon"). `icon` = a flat AppIcon name,
// `accent` = its category colours (the square behind the icon + the icon colour).
const CARDS = [
  { icon: 'target', title: 'Therapist targets', desc: 'Goals shared by your therapist', accent: CATEGORY.art },
  { icon: 'book-open-variant', title: 'Reading material', desc: 'Upload or type familiar text', accent: CATEGORY.reading },
  { icon: 'weather-sunny', title: 'Routine builder', desc: 'Morning and after-school routines', accent: CATEGORY.calm },
  { icon: 'view-grid', title: 'AAC symbol editor', desc: 'Update boards and quick phrases', accent: CATEGORY.learning },
];

// Parent Mode's own cards + the cards of every learning module (their `accent` is a CATEGORY name).
const ALL_CARDS = [
  ...CARDS.slice(0, 2),
  ...MODULE_PARENT_TOOLS.map((tool) => ({ ...tool, accent: CATEGORY[tool.accent] || CATEGORY.art })),
  ...CARDS.slice(2),
];

export default function ParentPlanScreen({ navigation }) {
  function openCard(card) {
    if (card.screen) navigation.navigate(card.screen);
    else showComingSoon(card.title);
  }

  return (
    <Screen scroll mode="parent">
      <PageTitle eyebrow="Psst," title="What's the plan this week?" />

      <Sheet>
        <View style={styles.hero}>
          <Tag label="This week" color={PALETTE.cloudWhite} />
          <Text style={styles.heroTitle}>Small steps, repeated gently</Text>
          <Text style={styles.heroCopy}>The therapist gives the plan. KidBuddy helps your family practise it.</Text>
        </View>

        <Text style={styles.sectionTitle}>Planning tools</Text>
        {ALL_CARDS.map((card) => (
          <ProgressCard
            key={card.title}
            iconName={card.icon}
            iconColor={card.accent.pale}
            iconTint={card.accent.deep}
            title={card.title}
            subtitle={card.desc}
            onPress={() => openCard(card)}
            right={card.screen ? <Text style={styles.chevron}>›</Text> : <Tag label="Soon" style={styles.soon} />}
          />
        ))}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: 18,
    padding: 18,
    borderRadius: DESIGN.TILE_RADIUS,
    backgroundColor: PALETTE.pastelMint,
  },
  heroTitle: {
    marginTop: 10,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 21,
    lineHeight: 26,
    color: COLORS.heading,
  },
  heroCopy: {
    marginTop: 4,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
  },
  sectionTitle: {
    marginBottom: 10,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 18,
    color: COLORS.heading,
  },
  soon: {
    alignSelf: 'center',
    marginEnd: 4,
  },
  chevron: {
    marginHorizontal: 6,
    fontSize: 24,
    color: COLORS.primary,
  },
});
