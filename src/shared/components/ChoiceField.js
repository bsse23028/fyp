// CHOICE FIELD - "pick from the list, or type your own". Used by the story form.
//
//   One answer:    <ChoiceField label="Favourite animal" options={ANIMALS} value={animal} onChange={setAnimal} />
//   Several:       <ChoiceField label="Hobbies" options={HOBBIES} value={hobbies} onChange={setHobbies} multiple />
//
// - Tap a chip to pick it. Tap it again to un-pick it. (Nothing is required.)
// - Below the chips there is a small box for something that is not in the list.
//     one answer -> what you type becomes the answer
//     several    -> type it and press "Add"; it appears as an extra chip (tap it to remove)
//
// Props: label, options, value (text, or a list when `multiple`), onChange,
//        multiple, otherPlaceholder, hint (small grey line under the label)

import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Text from './AppText';
import Chip from './Chip';
import { useLanguage } from '../../app/context/LanguageContext';
import { COLORS, FONTS } from '../theme/theme';

export default function ChoiceField({ label, options, value, onChange, multiple = false, otherPlaceholder = 'Type your own', hint }) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState(''); // text typed for "Add" (several answers)

  // ----- several answers -----
  if (multiple) {
    const chosen = value || [];
    const custom = chosen.filter((item) => !options.includes(item)); // the ones the parent typed

    function toggle(item) {
      onChange(chosen.includes(item) ? chosen.filter((x) => x !== item) : [...chosen, item]);
    }

    function addDraft() {
      const text = draft.trim();
      if (text && !chosen.includes(text)) onChange([...chosen, text]);
      setDraft('');
    }

    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        <View style={styles.chips}>
          {options.map((option) => (
            <Chip key={option} label={option} selected={chosen.includes(option)} onPress={() => toggle(option)} />
          ))}
          {custom.map((item) => (
            <Chip key={item} label={`${item}  ✕`} selected onPress={() => toggle(item)} />
          ))}
        </View>
        <View style={styles.otherRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t(otherPlaceholder)}
            placeholderTextColor={COLORS.textMuted}
            returnKeyType="done"
            onSubmitEditing={addDraft}
            style={[styles.other, styles.otherFlex]}
          />
          <Pressable onPress={addDraft} accessibilityRole="button" style={styles.addButton}>
            <Text style={styles.addText}>Add</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ----- one answer -----
  const isCustom = !!value && !options.includes(value);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <View style={styles.chips}>
        {options.map((option) => (
          <Chip key={option} label={option} selected={value === option} onPress={() => onChange(value === option ? '' : option)} />
        ))}
      </View>
      <TextInput
        value={isCustom ? value : ''}
        onChangeText={onChange}
        placeholder={t(otherPlaceholder)}
        placeholderTextColor={COLORS.textMuted}
        returnKeyType="done"
        style={[styles.other, isCustom && styles.otherOn]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 22,
  },
  label: {
    marginBottom: 8,
    fontFamily: FONTS.interSemiBold,
    fontSize: 13,
    color: COLORS.text,
  },
  hint: {
    marginTop: -4,
    marginBottom: 8,
    fontFamily: FONTS.interRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  other: {
    height: 42,
    marginTop: 10,
    paddingHorizontal: 12,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    fontFamily: FONTS.interRegular,
    fontSize: 13,
    color: COLORS.text,
  },
  otherOn: {
    borderColor: COLORS.primary,
    // backgroundColor: COLORS.primaryPale,
  },
  otherRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  otherFlex: {
    flex: 1,
  },
  addButton: {
    height: 42,
    marginTop: 10,
    marginStart: 8,
    paddingHorizontal: 16,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontFamily: FONTS.interBold,
    fontSize: 13,
    color: COLORS.white,
  },
});
