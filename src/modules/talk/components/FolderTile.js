// FOLDER TILE - one topic folder on the AAC board (Food & drinks, Play, Feelings ...): its picture on a white
// card and its name, in the folder's word-type colour, with a small "folder" tab at the top.
// Props: { topic: { title, icon, accent }, width, height, onPress }

import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Text from '../../../shared/components/AppText';
import AppIcon from '../../../shared/components/AppIcon';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import { WORD_TYPES, pictureNamed } from '../data/aacWords';
import { AAC } from '../aacConfig';
import { FONTS, PALETTE } from '../../../shared/theme/theme';

export default function FolderTile({ topic, width, height, onPress }) {
  const type = WORD_TYPES[topic.accent] || WORD_TYPES.thing;
  const card = Math.max(24, Math.min(width - 22, height - 44));

  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityLabel={topic.title}
      style={[styles.tile, { width, height, backgroundColor: type.fill, borderColor: type.edge }]}
    >
      <View style={[styles.tab, { backgroundColor: type.edge }]}>
        <AppIcon name="folder" size={12} color={PALETTE.white} />
      </View>
      <View style={[styles.card, { width: card, height: card, borderRadius: card * 0.22 }]}>
        <Image source={pictureNamed(topic.icon)} style={{ width: card * 0.86, height: card * 0.86 }} resizeMode="contain" />
      </View>
      <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
        {topic.title}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: AAC.CELL_RADIUS + 4,
    borderWidth: AAC.CELL_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingTop: 10,
    paddingBottom: 6,
  },
  // the little folder tab in the top corner
  tab: {
    position: 'absolute',
    top: 6,
    start: 6,
    width: 22,
    height: 18,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.cloudWhite,
  },
  title: {
    marginTop: 5,
    fontFamily: FONTS.nunitoBlack,
    fontSize: AAC.FOLDER_LABEL_SIZE,
    color: PALETTE.deepPlum,
    textAlign: 'center',
  },
});
