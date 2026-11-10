// AUTH HEADING - the big title + grey sentence at the top of form screens.

import React from 'react';
import { View } from 'react-native';
import Text from './AppText';
import { globalStyles } from '../theme/globalStyles';

export default function AuthHeading({ title, subtitle }) {
  return (
    <View>
      <Text style={globalStyles.heading} accessibilityRole="header">
        {title}
      </Text>
      <Text style={globalStyles.subheading}>{subtitle}</Text>
    </View>
  );
}
