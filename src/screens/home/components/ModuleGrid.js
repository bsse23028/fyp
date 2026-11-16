// MODULE GRID - the six module cards of Child Home in two columns with generous spacing
// (English, Numbers, Feelings, Talk, My Day, Sounds). The same cards in the same place every time.
// Each card is a ModuleCard. `wobbleId` + `wobbleKey` make one card do its shy "not yet" wobble.
// Props: { modules, active, isPreview, wobbleId, wobbleKey, onOpen(module) }

import React from 'react';
import { StyleSheet, View } from 'react-native';
import ModuleCard from './ModuleCard';

export default function ModuleGrid({ modules, active, isPreview, wobbleId, wobbleKey, onOpen }) {
  return (
    <View style={styles.grid}>
      {modules.map((module, index) => (
        <ModuleCard
          key={module.id}
          module={module}
          index={index}
          active={active}
          isPreview={isPreview}
          wobbleKey={wobbleId === module.id ? wobbleKey : 0}
          onPress={onOpen}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
