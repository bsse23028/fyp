// SHEET - the big rounded pale panel that holds a screen's content under the title (the inspo look).
// It stretches to the left and right edges of the phone and down to the bottom of the page.
//
//   <Screen scroll> <PageTitle ... /> <Sheet> ...tiles and cards... </Sheet> </Screen>
//
// Props: color (default Pale Lilac), style, children

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DESIGN } from '../theme/designConfig';
import { PALETTE, SPACING } from '../theme/theme';

export default function Sheet({ color = PALETTE.paleLilac, style, children }) {
  return <View style={[styles.sheet, { backgroundColor: color }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  sheet: {
    flexGrow: 1,
    marginTop: -DESIGN.SHEET_OVERLAP,
    // Screen.js adds side and bottom padding: undo it, so the sheet reaches the phone's edges
    marginHorizontal: -SPACING.screen,
    marginBottom: -SPACING.medium,
    paddingHorizontal: DESIGN.SHEET_PADDING,
    paddingTop: DESIGN.SHEET_PADDING + 4,
    paddingBottom: DESIGN.SHEET_PADDING + SPACING.medium,
    borderTopLeftRadius: DESIGN.SHEET_RADIUS,
    borderTopRightRadius: DESIGN.SHEET_RADIUS,
  },
});
