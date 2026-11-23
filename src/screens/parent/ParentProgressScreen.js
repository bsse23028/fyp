// PARENT PROGRESS SCREEN - how a child is doing (Parent Mode), in the inspo look ("Reading" + "Atomic Habits"):
//
//   pink top   tag "Progress", the child's buddy, the name, a pill with the age, "Last practised ..."
//              (+ chips to choose another child, when there is more than one)
//   sheet      "Highscores": sessions · stars · day streak as three pastel stat tiles
//              one big ring per learning module (English: letters learned out of 26), from the modules'
//              public door (selectModuleProgress)
//              "Read Along": a month calendar, every day the child practised is circled (PracticeCalendar)
//              "Activities": every other switched-on activity as a card, "Not started yet" until built
//              "Share report with therapist" (coming soon)
//
// Route params: { childId }  (optional - the first child by default)
// Props: { route }

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import Chip from '../../shared/components/Chip';
import Button from '../../shared/components/Button';
import Mascot from '../../shared/components/Mascot';
import DetailHeader from '../../shared/components/DetailHeader';
import Sheet from '../../shared/components/Sheet';
import StatTile from '../../shared/components/StatTile';
import ProgressRing from '../../shared/components/ProgressRing';
import ProgressCard from '../../shared/components/ProgressCard';
import Tag from '../../shared/components/Tag';
import PracticeCalendar from '../../shared/components/PracticeCalendar';
import { useChild } from '../../app/store/useChild';
import { sameProgress, selectModuleProgress } from '../../modules';
import { showComingSoon } from '../../shared/utils/alerts';
import { translate } from '../../shared/i18n/translate';
import { ageText, allTimeTotals, lastActiveText, streakDays } from '../../shared/utils/progress';
import { DESIGN } from '../../shared/theme/designConfig';
import { CATEGORY, COLORS, FONTS, PALETTE } from '../../shared/theme/theme';

export default function ParentProgressScreen({ route }) {
  const { childProfiles } = useChild();
  const startId = route.params && route.params.childId ? route.params.childId : null;

  const [selectedId, setSelectedId] = useState(startId || (childProfiles.length > 0 ? childProfiles[0].id : null));

  const child = childProfiles.find((c) => c.id === selectedId) || childProfiles[0] || null;
  const moduleProgress = useSelector((state) => selectModuleProgress(state, child ? child.id : null), sameProgress);

  if (!child) {
    return (
      <Screen mode="parent">
        <View style={styles.emptyBox}>
          <Mascot size={110} />
          <Text style={styles.emptyTitle}>Progress</Text>
          <Text style={styles.empty}>Add a child profile on Home to see progress here.</Text>
        </View>
      </Screen>
    );
  }

  const totals = allTimeTotals(child);
  const otherModules = (child.modules || []).filter((name) => name !== 'Read-Along');

  return (
    <Screen scroll mode="parent">
      <DetailHeader
        tag="Progress"
        avatar={child.avatar}
        title={child.name}
        pill={ageText(child)}
        caption={translate('Last practised: {when}', { when: translate(lastActiveText(child)) })}
      >
        {childProfiles.length > 1 && (
          <View style={styles.chipRow}>
            {childProfiles.map((c) => (
              <Chip key={c.id} label={c.name} selected={c.id === child.id} onPress={() => setSelectedId(c.id)} />
            ))}
          </View>
        )}
      </DetailHeader>

      <Sheet>
        {/* highscores */}
        <Text style={styles.sectionTitle}>Highscores</Text>
        <View style={styles.stats}>
          <StatTile value={totals.sessions} label="Sessions" iconName="book-open-page-variant" color={PALETTE.pastelMint} />
          <StatTile value={totals.stars} label="Stars" iconName="star" color={PALETTE.pastelPink} valueColor={PALETTE.coralText} />
          <StatTile value={streakDays(child)} label="Day streak" iconName="fire" color={PALETTE.pastelYellow} />
        </View>
        {/* proposal FR-16: one shared reward system (points, stickers, badges) */}
        <ProgressCard
          iconName="medal"
          iconColor={CATEGORY.games.pale}
          iconTint={CATEGORY.games.deep}
          title="Badges and stickers"
          subtitle="Rewards your child collects across all activities"
          right={<Tag label="Soon" style={styles.soon} />}
          style={styles.rewards}
        />

        {/* one ring per learning module (English: the alphabet) */}
        {moduleProgress.map((item) => (
          <View key={item.module}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <View style={styles.card}>
              <ProgressRing value={item.done / item.total} label="Completed" detail={item.text} />
            </View>
          </View>
        ))}

        {/* Read Along: a calendar of the month, the days the child practised are circled */}
        <Text style={styles.sectionTitle}>Read Along</Text>
        <PracticeCalendar activity={child.activity || {}} style={styles.calendar} />

        {/* other activities */}
        {otherModules.length > 0 && <Text style={styles.sectionTitle}>Activities</Text>}
        {otherModules.map((name) => (
          <ProgressCard key={name} iconName="puzzle" iconColor={CATEGORY.art.pale} iconTint={CATEGORY.art.deep} title={name} subtitle="Not started yet" progress={0} />
        ))}

        <Button title="Share report with therapist →" onPress={() => showComingSoon('Export report')} style={styles.share} />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 10,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 26,
    color: COLORS.heading,
  },
  empty: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  sectionTitle: {
    marginBottom: 10,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 18,
    color: COLORS.heading,
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  card: {
    marginBottom: 18,
    padding: 16,
    borderRadius: DESIGN.CARD_RADIUS,
    backgroundColor: COLORS.white,
  },
  calendar: {
    marginBottom: 18,
  },
  rewards: {
    marginBottom: 18,
  },
  soon: {
    alignSelf: 'center',
    marginEnd: 4,
  },
  share: {
    marginTop: 8,
  },
});
