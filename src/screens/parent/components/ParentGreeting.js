// PARENT GREETING - top of Parent Home: today's date, "Good morning, Sarah 👋" and two small
// pills with this week's sessions and stars (all children together).

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../../../shared/components/AppText';
import { translate } from '../../../shared/i18n/translate';
import { getGreeting } from '../../../shared/utils/greeting';
import { CALM, CALM_RADIUS, FONTS } from '../../../shared/theme/theme';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function dateText(date) {
  return `${translate(WEEKDAYS[date.getDay()])}, ${date.getDate()} ${translate(MONTHS[date.getMonth()])} ${date.getFullYear()}`;
}

function StatPill({ icon, value, label, tint }) {
  return (
    <View style={[styles.pill, { backgroundColor: tint }]}>
      <Text style={styles.pillIcon}>{icon}</Text>
      <Text style={styles.pillValue}>{value}</Text>
      <Text style={styles.pillLabel} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

export default function ParentGreeting({ name, sessions, stars }) {
  const now = new Date();
  const greeting = getGreeting(now).text.replace('!', '');

  return (
    <View>
      <Text style={styles.date}>{dateText(now)}</Text>
      <Text style={styles.hello}>
        {greeting}, {name} 👋
      </Text>
      <View style={styles.pills}>
        <StatPill icon="📊" value={sessions} label="Sessions this week" tint={CALM.skyPale} />
        <StatPill icon="⭐" value={stars} label="Stars this week" tint={CALM.yellowPale} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  date: {
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 14,
    color: CALM.textSoft,
  },
  hello: {
    marginTop: 2,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 26,
    lineHeight: 32,
    color: CALM.text,
  },
  pills: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  pill: {
    flex: 1,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: CALM_RADIUS.medium,
  },
  pillIcon: {
    fontSize: 18,
    marginEnd: 6,
  },
  pillValue: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 20,
    color: CALM.text,
    marginEnd: 6,
  },
  pillLabel: {
    flex: 1,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 12,
    lineHeight: 15,
    color: CALM.textSoft,
  },
});
