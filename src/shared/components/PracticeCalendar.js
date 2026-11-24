// PRACTICE CALENDAR - one month as a calendar; every day the child practised is CIRCLED
// (like the user's calendar template, in KidBuddy colours). Used on the Progress tab.
//
//   <PracticeCalendar activity={child.activity} />
//
// activity = the child's saved days: { '2026-10-12': { sessions: 1, stars: 3 }, ... }
//   a day counts as "practised" when it has at least one session.
// Looks:  practised day = a purple circle with white number · today = a purple ring + a small dot
//         future days = faded · ‹ › = the month before / after (never past this month)
// Sizes are CAL_* in theme/designConfig.js. Weeks start on Sunday. Nothing here is saved.

import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from './AppText';
import AppIcon from './AppIcon';
import { useDirection } from '../utils/direction';
import { translate } from '../i18n/translate';
import { dayKey } from '../utils/progress';
import { DESIGN } from '../theme/designConfig';
import { FONTS, PALETTE } from '../theme/theme';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// The cells of one month: empty cells before the 1st, then 1 ... last day.
function monthCells(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const dayCount = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= dayCount; day++) cells.push(new Date(year, month, day));
  return cells;
}

export default function PracticeCalendar({ activity = {}, style }) {
  const { isRTL } = useDirection();
  const today = new Date();
  const [offset, setOffset] = useState(0); // 0 = this month, -1 = last month ...
  const shown = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const cells = monthCells(shown.getFullYear(), shown.getMonth());
  const todayKey = dayKey(today);

  const practised = (date) => {
    const entry = activity[dayKey(date)];
    return Boolean(entry && entry.sessions > 0);
  };
  const daysPractised = cells.filter((date) => date && practised(date)).length;

  return (
    <View style={[styles.card, style]}>
      {/* the month and the two arrows */}
      <View style={styles.head}>
        <Pressable onPress={() => setOffset(offset - 1)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Previous month" style={styles.arrow}>
          <AppIcon name={isRTL ? 'chevron-right' : 'chevron-left'} size={28} color={PALETTE.purple} />
        </Pressable>
        <Text style={styles.month}>
          {translate(MONTHS[shown.getMonth()])} {shown.getFullYear()}
        </Text>
        <Pressable
          onPress={() => setOffset(offset + 1)}
          disabled={offset >= 0}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Next month"
          style={[styles.arrow, offset >= 0 && styles.arrowOff]}
        >
          <AppIcon name={isRTL ? 'chevron-left' : 'chevron-right'} size={28} color={PALETTE.purple} />
        </Pressable>
      </View>

      {/* weekday names */}
      <View style={styles.grid}>
        {WEEKDAYS.map((name) => (
          <View key={name} style={styles.cell}>
            <Text style={styles.weekday} numberOfLines={1}>
              {name}
            </Text>
          </View>
        ))}
      </View>

      {/* the days (always left to right, like a printed calendar) */}
      <View style={styles.grid}>
        {cells.map((date, i) => {
          if (!date) return <View key={`empty-${i}`} style={styles.cell} />;
          const key = dayKey(date);
          const done = practised(date);
          const isToday = key === todayKey;
          const future = date > today && !isToday;
          return (
            <View key={key} style={styles.cell}>
              <View style={[styles.day, done && styles.dayDone, isToday && !done && styles.dayToday]}>
                <Text style={[styles.dayText, done && styles.dayTextDone, future && styles.dayTextFuture]}>{date.getDate()}</Text>
              </View>
              {isToday ? <View style={[styles.todayDot, done && styles.todayDotDone]} /> : <View style={styles.dotSpace} />}
            </View>
          );
        })}
      </View>

      <Text style={styles.summary}>{translate('Practised on {n} days this month', { n: daysPractised })}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: DESIGN.CARD_RADIUS,
    backgroundColor: PALETTE.pastelPink,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  arrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.cloudWhite,
  },
  arrowOff: {
    opacity: 0.35,
  },
  month: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 20,
    color: PALETTE.purple,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    direction: 'ltr',
  },
  cell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    marginBottom: 4,
  },
  weekday: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 11,
    color: PALETTE.mutedPlum,
  },
  day: {
    width: DESIGN.CAL_DAY_SIZE,
    height: DESIGN.CAL_DAY_SIZE,
    borderRadius: DESIGN.CAL_DAY_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDone: {
    backgroundColor: PALETTE.purple,
  },
  dayToday: {
    borderWidth: 2,
    borderColor: PALETTE.purple,
  },
  dayText: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 14,
    color: PALETTE.deepPlum,
  },
  dayTextDone: {
    color: PALETTE.white,
  },
  dayTextFuture: {
    color: PALETTE.mutedPlum,
    opacity: 0.6,
  },
  todayDot: {
    width: 5,
    height: 5,
    marginTop: 2,
    borderRadius: 3,
    backgroundColor: PALETTE.purple,
  },
  todayDotDone: {
    backgroundColor: PALETTE.coralDeep,
  },
  dotSpace: {
    height: 7,
  },
  summary: {
    marginTop: 6,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 13,
    color: PALETTE.deepPlum,
    textAlign: 'center',
  },
});
