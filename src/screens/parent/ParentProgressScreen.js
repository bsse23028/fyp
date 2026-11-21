// PARENT PROGRESS SCREEN - how a child is doing (Parent Mode), in the inspo look ("Reading" + "Atomic Habits"):
//
//   pink top   tag "Progress", the child's buddy, the name, a pill with the age, "Last practised ..."
//              (+ chips to choose another child, when there is more than one)
//   sheet      "Highscores": sessions · stars · day streak as three pastel stat tiles
//              one big ring per learning module (English: letters learned out of 26), from the modules'
//              public door (selectModuleProgress)
//              "Read Along": sessions per day (7 days) or per week (4 weeks), Sunny Yellow bars
//              "Activities": every other switched-on activity as a card, "Not started yet" until built
//              "Share report with therapist" (coming soon)
//
// Route params: { childId }  (optional - the first child by default)
// Props: { route }

import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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
import { useChild } from '../../app/store/useChild';
import { sameProgress, selectModuleProgress } from '../../modules';
import { showComingSoon } from '../../shared/utils/alerts';
import { translate } from '../../shared/i18n/translate';
import { ageText, allTimeTotals, lastActiveText, lastDays, streakDays } from '../../shared/utils/progress';
import { DESIGN } from '../../shared/theme/designConfig';
import { CATEGORY, COLORS, FONTS, PALETTE } from '../../shared/theme/theme';

const RANGES = ['7D', '4W'];

// Turns the child's history into bars: 7 days, or 4 weeks added up.
function buildBars(child, range) {
  if (range === '7D') {
    return lastDays(child, 7).map((d) => ({ label: d.label, value: d.sessions }));
  }
  const days = lastDays(child, 28);
  const bars = [];
  for (let week = 0; week < 4; week++) {
    const slice = days.slice(week * 7, week * 7 + 7);
    bars.push({ label: `W${week + 1}`, value: slice.reduce((sum, d) => sum + d.sessions, 0) });
  }
  return bars;
}

export default function ParentProgressScreen({ route }) {
  const { childProfiles } = useChild();
  const startId = route.params && route.params.childId ? route.params.childId : null;

  const [selectedId, setSelectedId] = useState(startId || (childProfiles.length > 0 ? childProfiles[0].id : null));
  const [range, setRange] = useState('7D');

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
  const bars = buildBars(child, range);
  const maxValue = Math.max(1, ...bars.map((b) => b.value));
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

        {/* one ring per learning module (English: the alphabet) */}
        {moduleProgress.map((item) => (
          <View key={item.module}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <View style={styles.card}>
              <ProgressRing value={item.done / item.total} label="Completed" detail={item.text} />
            </View>
          </View>
        ))}

        {/* Read Along chart */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Read Along</Text>
          <View style={styles.ranges}>
            {RANGES.map((r) => (
              <Pressable
                key={r}
                onPress={() => setRange(r)}
                accessibilityRole="button"
                accessibilityState={{ selected: range === r }}
                style={[styles.range, range === r && styles.rangeOn]}
              >
                <Text style={[styles.rangeText, range === r && styles.rangeTextOn]}>{r}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.card}>
          <View style={styles.chart}>
            {bars.map((bar, i) => (
              <View key={i} style={styles.barCol}>
                <Text style={styles.barValue}>{bar.value > 0 ? bar.value : ''}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.bar, { height: `${(bar.value / maxValue) * 100}%` }]} />
                </View>
                <Text style={styles.barLabel}>{bar.label}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.chartNote}>Reading sessions {range === '7D' ? 'per day' : 'per week'}</Text>
        </View>

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
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  ranges: {
    flexDirection: 'row',
    marginBottom: 10,
    padding: 3,
    borderRadius: 14,
    backgroundColor: PALETTE.pastelLilac,
  },
  range: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 11,
    justifyContent: 'center',
  },
  rangeOn: {
    backgroundColor: COLORS.white,
  },
  rangeText: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  rangeTextOn: {
    color: COLORS.primary,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 130,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
  },
  barValue: {
    height: 16,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 11,
    color: COLORS.primary,
  },
  barTrack: {
    flex: 1,
    width: 18,
    justifyContent: 'flex-end',
    borderRadius: 9,
    backgroundColor: PALETTE.pastelYellow,
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 9,
    backgroundColor: PALETTE.sunny,
  },
  barLabel: {
    marginTop: 5,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  chartNote: {
    marginTop: 10,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  share: {
    marginTop: 8,
  },
});
