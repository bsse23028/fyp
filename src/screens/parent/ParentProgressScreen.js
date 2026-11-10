// PARENT PROGRESS SCREEN - how a child is doing (Parent Mode, from Figma).
//
//   - choose the child (chips, when there is more than one)
//   - totals: sessions · stars · streak
//   - Reading chart: sessions per day (7 days) or per week (4 weeks), from the
//     history the app saves after every Read Along session
//   - every other activity that is switched on, "Not started yet" until built
//
// Route params: { childId }  (optional - the first child by default)
// Props: { route }

import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import Chip from '../../shared/components/Chip';
import Button from '../../shared/components/Button';
import Mascot from '../../shared/components/Mascot';
import { useChild } from '../../app/store/useChild';
import { showComingSoon } from '../../shared/utils/alerts';
import { allTimeTotals, lastActiveText, lastDays, streakDays } from '../../shared/utils/progress';
import { COLORS, FONTS } from '../../shared/theme/theme';

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

  if (!child) {
    return (
      <Screen mode="parent">
        <View style={styles.emptyBox}>
          <Mascot size={110} />
          <Text style={styles.heading}>Progress</Text>
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
      <View style={styles.body}>
        <Text style={styles.heading}>Progress</Text>
        <Text style={styles.subheading}>Encouraging patterns, never labels.</Text>

        {/* which child */}
        {childProfiles.length > 1 && (
          <View style={styles.chipRow}>
            {childProfiles.map((c) => (
              <Chip key={c.id} label={c.name} selected={c.id === child.id} onPress={() => setSelectedId(c.id)} />
            ))}
          </View>
        )}

        {/* totals */}
        <View style={styles.totals}>
          {[
            { label: 'Sessions', value: totals.sessions },
            { label: 'Stars', value: totals.stars },
            { label: 'Day streak', value: streakDays(child) },
          ].map((item) => (
            <View key={item.label} style={styles.total}>
              <Text style={styles.totalValue}>{item.value}</Text>
              <Text style={styles.totalLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Reading chart */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View>
              <Text style={styles.cardTitle}>📖 Read Along</Text>
              <Text style={styles.cardSub}>Last practised: {lastActiveText(child)}</Text>
            </View>
            <View style={styles.ranges}>
              {RANGES.map((r) => (
                <Pressable
                  key={r}
                  onPress={() => setRange(r)}
                  accessibilityRole="button"
                  style={[styles.range, range === r && styles.rangeOn]}
                >
                  <Text style={[styles.rangeText, range === r && styles.rangeTextOn]}>{r}</Text>
                </Pressable>
              ))}
            </View>
          </View>

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
        {otherModules.map((name) => (
          <View key={name} style={styles.row}>
            <Text style={styles.rowTitle}>{name}</Text>
            <Text style={styles.rowValue}>Not started yet</Text>
          </View>
        ))}

        <Button
          title="Share report with therapist →"
          variant="secondary"
          onPress={() => showComingSoon('Export report')}
          style={styles.share}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: FONTS.interRegular,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  heading: {
    fontFamily: FONTS.interBold,
    fontSize: 24,
    color: COLORS.text,
  },
  subheading: {
    marginTop: 3,
    fontFamily: FONTS.interRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    gap: 8,
  },
  totals: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  total: {
    width: '31.5%',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  totalValue: {
    fontFamily: FONTS.interBold,
    fontSize: 24,
    color: COLORS.primary,
  },
  totalLabel: {
    marginTop: 2,
    fontFamily: FONTS.interRegular,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  card: {
    marginTop: 14,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontFamily: FONTS.interBold,
    fontSize: 15,
    color: COLORS.text,
  },
  cardSub: {
    marginTop: 3,
    fontFamily: FONTS.interRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  ranges: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  range: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  rangeOn: {
    backgroundColor: COLORS.primary,
  },
  rangeText: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  rangeTextOn: {
    color: COLORS.white,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 130,
    marginTop: 16,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
  },
  barValue: {
    height: 16,
    fontFamily: FONTS.interSemiBold,
    fontSize: 11,
    color: COLORS.primary,
  },
  barTrack: {
    flex: 1,
    width: 18,
    justifyContent: 'flex-end',
    borderRadius: 6,
    backgroundColor: COLORS.primaryPale,
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  barLabel: {
    marginTop: 5,
    fontFamily: FONTS.interMedium,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  chartNote: {
    marginTop: 10,
    fontFamily: FONTS.interRegular,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowTitle: {
    fontFamily: FONTS.interBold,
    fontSize: 13,
    color: COLORS.text,
  },
  rowValue: {
    fontFamily: FONTS.interRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  share: {
    marginTop: 18,
  },
});
