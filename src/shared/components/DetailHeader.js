// DETAIL HEADER - the top of a DETAIL screen in the inspo look (like the "Reading" screen):
// a small tag, the buddy big in the middle, a big purple title, a pill under it and one small line.
// Put it on a Soft Pink page (theme/screenColors.js) and follow it with a <Sheet>.
//
//   <DetailHeader tag="Progress" avatar={child.avatar} title={child.name} pill="4-6 years" caption="Active today" />
//
// Props: tag, avatar, title, pill, caption, mascotSize, children (drawn under it, e.g. child chips)

import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Text from './AppText';
import Mascot from './Mascot';
import Tag from './Tag';
import { useIdleBob } from '../utils/motion';
import { DESIGN } from '../theme/designConfig';
import { COLORS, FONTS, PALETTE } from '../theme/theme';

export default function DetailHeader({ tag, avatar, title, pill, caption, mascotSize = DESIGN.DETAIL_MASCOT, children }) {
  const bob = useIdleBob({ height: 5 });

  return (
    <View style={styles.wrap}>
      {tag ? <Tag label={tag} color={PALETTE.blushPeach} style={styles.tag} /> : null}
      <Animated.View style={[styles.mascot, bob]}>
        <Mascot size={mascotSize} avatar={avatar} />
      </Animated.View>
      <Text style={styles.title} numberOfLines={2} accessibilityRole="header">
        {title}
      </Text>
      {pill ? <Tag label={pill} color={PALETTE.cloudWhite} style={styles.pill} /> : null}
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 18,
  },
  tag: {
    alignSelf: 'center',
  },
  mascot: {
    marginTop: 8,
  },
  title: {
    marginTop: 6,
    fontFamily: FONTS.nunitoBlack,
    fontSize: DESIGN.TITLE_SIZE,
    lineHeight: DESIGN.TITLE_LINE,
    color: COLORS.heading,
    textAlign: 'center',
  },
  pill: {
    alignSelf: 'center',
    marginTop: 6,
  },
  caption: {
    marginTop: 6,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
