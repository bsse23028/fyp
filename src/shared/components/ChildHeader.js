// CHILD HEADER - back button, big title and a speaker, at the top of every
// child activity screen.
//
//   <ChildHeader title="Words" onBack={() => navigation.goBack()} />
// `speakText` is what the speaker reads (defaults to the title).

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from './AppText';
import BackButton from './BackButton';
import SpeakButton from './SpeakButton';
import { COLORS, FONTS } from '../theme/theme';

export default function ChildHeader({ title, onBack, speakText }) {
  return (
    <View style={styles.row}>
      <BackButton onPress={onBack} />
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {/* <SpeakButton text={speakText || title} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    marginHorizontal: 12,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 23,
    color: COLORS.warmText,
  },
});
