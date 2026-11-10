// STAR ROW - three stars, `filled` of them yellow.   <StarRow filled={3} />

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from './AppText';
import { COLORS } from '../theme/theme';

export default function StarRow({ filled = 3 }) {
  return (
    <View style={styles.row}>
      {[0, 1, 2].map((index) => (
        <Text key={index} style={[styles.star, { color: index < filled ? COLORS.yellow : '#E5DDD5' }]}>
          ★
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  star: {
    fontSize: 38,
    marginHorizontal: 5,
  },
});
