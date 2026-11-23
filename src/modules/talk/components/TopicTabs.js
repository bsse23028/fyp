// TOPIC TABS - the row of pages under the sentence strip: Core (always first) + the topic pages
// (Food, Play, Feelings, People, Places). The chosen one is filled in its colour.
// Props: { topics, value ('core' or a topic id), onChange(id) }

import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Text from '../../../shared/components/AppText';
import AppIcon from '../../../shared/components/AppIcon';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import { WORD_TYPES } from '../data/aacWords';
import { FONTS, PALETTE } from '../../../shared/theme/theme';

export default function TopicTabs({ topics, value, onChange }) {
  const tabs = [{ id: 'core', title: 'Core', icon: 'view-grid', accent: 'question' }, ...topics];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} style={styles.scroller}>
      {tabs.map((tab) => {
        const on = tab.id === value;
        const type = WORD_TYPES[tab.accent] || WORD_TYPES.question;
        return (
          <AnimatedPressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            accessibilityLabel={tab.title}
            accessibilityState={{ selected: on }}
            style={[styles.tab, { borderColor: type.edge, backgroundColor: on ? type.fill : PALETTE.cloudWhite }]}
          >
            <AppIcon name={tab.icon} size={20} color={PALETTE.purple} />
            <Text style={[styles.label, on && styles.labelOn]}>{tab.title}</Text>
          </AnimatedPressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroller: {
    flexGrow: 0,
  },
  row: {
    gap: 8,
    paddingVertical: 2,
  },
  tab: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 2,
  },
  label: {
    marginStart: 6,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 14,
    color: PALETTE.deepPlum,
  },
  labelOn: {
    color: PALETTE.purple,
  },
});
