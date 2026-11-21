// PAGE TITLE - the top of an inspo-style screen: a small line ("Psst,"), a big purple title and
// the child's buddy peeking in on the right. Optional `tag` = a small pill above the title.
//
//   <PageTitle eyebrow="Psst," title="Who is learning today?" avatar="fox" />
//
// Props: eyebrow, title, tag, avatar (an avatar id; leave out = the buddy shown everywhere),
//        mascot (false = no buddy), right (anything to draw instead of the buddy), style

import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Text from './AppText';
import Mascot from './Mascot';
import Tag from './Tag';
import { useIdleBob } from '../utils/motion';
import { DESIGN } from '../theme/designConfig';
import { COLORS, FONTS } from '../theme/theme';

export default function PageTitle({ eyebrow, title, tag, avatar, mascot = true, right, style }) {
  const bob = useIdleBob({ height: 4 });

  return (
    <View style={[styles.row, style]}>
      <View style={styles.text}>
        {tag ? <Tag label={tag} style={styles.tag} /> : null}
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
      </View>
      {right ? (
        right
      ) : mascot ? (
        <Animated.View style={bob}>
          <Mascot size={DESIGN.TITLE_MASCOT} avatar={avatar} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 6,
    paddingBottom: 12,
  },
  text: {
    flex: 1,
    marginEnd: 8,
    alignItems: 'flex-start',
  },
  tag: {
    marginBottom: 8,
  },
  eyebrow: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: DESIGN.EYEBROW_SIZE,
    color: COLORS.primary,
  },
  title: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: DESIGN.TITLE_SIZE,
    lineHeight: DESIGN.TITLE_LINE,
    color: COLORS.heading,
  },
});
