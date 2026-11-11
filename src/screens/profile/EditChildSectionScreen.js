// EDIT CHILD SECTION SCREEN - edits ONE part of a child's profile, with its own Save.
// Which part is decided by the route param `section`:
//
//   'basics'   nickname, age band, avatar, language
//   'support'  areas of support (optional chips)
//   'modules'  activities switched on / off (+ "Suggest from areas of support")
//
// Every input is separate and optional (except the nickname and the age band).
// "Save" stores the changes on the server with updateChild and goes back.
// The header logo previews the avatar while it is being chosen.
//
// Route params: { childId, section }
// Props: { navigation, route }

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import TextField from '../../shared/components/TextField';
import Chip from '../../shared/components/Chip';
import AvatarPicker from '../../shared/components/AvatarPicker';
import SegmentedControl from '../../shared/components/SegmentedControl';
import Toggle from '../../shared/components/Toggle';
import Button from '../../shared/components/Button';
import { useChild } from '../../app/store/useChild';
import { useChildOptions } from '../../app/store/useChildOptions';
import { toggleInList } from '../../shared/utils/childOptions';
import { globalStyles } from '../../shared/theme/globalStyles';
import { COLORS, FONTS } from '../../shared/theme/theme';

const TITLES = {
  basics: 'Basics',
  support: 'Areas of support',
  modules: 'Activities',
};

export default function EditChildSectionScreen({ navigation, route }) {
  const { childId, section } = route.params;
  const { childProfiles, updateChild } = useChild();
  // The choice lists from the server (named like the old constants, so the form below did not change).
  const {
    ageBands: AGE_BANDS,
    languages: LANGUAGES,
    modules: MODULES,
    supports: SUPPORT_OPTIONS,
    suggestModules,
  } = useChildOptions();
  const child = childProfiles.find((c) => c.id === childId) || null;

  // Start with the saved values.
  const [name, setName] = useState(child ? child.name : '');
  const [ageBand, setAgeBand] = useState(child ? child.ageBand : '');
  const [avatar, setAvatar] = useState(child ? child.avatar : 'rabbit');
  const [language, setLanguage] = useState(child ? child.language : 'en');
  const [supports, setSupports] = useState((child && child.supports) || []);
  const [modules, setModules] = useState((child && child.modules) || []);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const nameProblem = name.trim() ? '' : 'Enter your child’s nickname.';
  const ageProblem = ageBand ? '' : 'Choose an age band.';

  if (!child) {
    return (
      <Screen mode="parent">
        <Text style={styles.heading}>Profile not found</Text>
      </Screen>
    );
  }

  async function handleSave() {
    let changes;
    if (section === 'basics') {
      setSubmitted(true);
      if (nameProblem || ageProblem) return;
      changes = { name: name.trim(), ageBand, avatar, language };
    } else if (section === 'support') {
      changes = { supports };
    } else {
      changes = { modules };
    }
    setSaving(true);
    // Saved on the server. If that fails, a pop-up explains why and we stay here.
    const saved = await updateChild(child.id, changes);
    setSaving(false);
    if (saved) navigation.goBack();
  }

  return (
    <Screen scroll mode="parent" avatar={section === 'basics' ? avatar : child.avatar}>
      <View style={styles.body}>
        <Text style={styles.heading}>{TITLES[section]}</Text>
        <Text style={styles.subheading}>{child.name}</Text>

        {/* ---------- BASICS ---------- */}
        {section === 'basics' && (
          <View>
            <TextField
              label="Nickname"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Zara"
              autoCapitalize="words"
              returnKeyType="done"
              error={submitted ? nameProblem : ''}
              style={styles.firstField}
            />

            <Text style={[styles.label, globalStyles.fieldGap]}>Age band</Text>
            <View style={styles.chipRow}>
              {AGE_BANDS.map((band) => (
                <Chip key={band} label={band} selected={ageBand === band} onPress={() => setAgeBand(band)} />
              ))}
            </View>
            {submitted && ageProblem ? <Text style={styles.error}>{ageProblem}</Text> : null}

            <Text style={[styles.label, globalStyles.fieldGap]}>Choose an avatar</Text>
            <AvatarPicker selectedId={avatar} onSelect={setAvatar} />

            <Text style={[styles.label, globalStyles.fieldGap]}>Primary language</Text>
            <SegmentedControl options={LANGUAGES} value={language} onChange={setLanguage} />
          </View>
        )}

        {/* ---------- AREAS OF SUPPORT ---------- */}
        {section === 'support' && (
          <View>
            <Text style={[globalStyles.subheading, styles.intro]}>
              Choose anything that would be helpful. This is optional.
            </Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>This does not diagnose anything.</Text>
            </View>
            <View style={styles.chipRow}>
              {SUPPORT_OPTIONS.map((option) => (
                <Chip
                  key={option}
                  label={option}
                  selected={supports.includes(option)}
                  onPress={() => setSupports(toggleInList(supports, option))}
                />
              ))}
            </View>
          </View>
        )}

        {/* ---------- ACTIVITIES ---------- */}
        {section === 'modules' && (
          <View>
            <Text style={[globalStyles.subheading, styles.intro]}>Switch activities on or off. You stay in control.</Text>
            <Button
              title="Suggest from areas of support"
              variant="secondary"
              onPress={() => setModules(suggestModules(child.supports || []))}
              style={styles.suggest}
            />
            {MODULES.map((module) => (
              <View key={module.name} style={styles.moduleRow}>
                <Text style={styles.moduleName}>{module.name}</Text>
                {module.sensor ? <Text style={styles.badge}>{module.sensor}</Text> : null}
                <Toggle on={modules.includes(module.name)} onPress={() => setModules(toggleInList(modules, module.name))} />
              </View>
            ))}
          </View>
        )}

        <View style={styles.spacer} />

        <View style={styles.buttons}>
          <Button title="Cancel" variant="secondary" onPress={() => navigation.goBack()} style={styles.cancel} />
          <Button title="Save" onPress={handleSave} loading={saving} style={styles.save} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  heading: {
    fontFamily: FONTS.interBold,
    fontSize: 24,
    color: COLORS.text,
  },
  subheading: {
    marginTop: 2,
    fontFamily: FONTS.interRegular,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  firstField: {
    marginTop: 18,
  },
  intro: {
    marginTop: 14,
    marginBottom: 14,
  },
  label: {
    marginBottom: 8,
    fontFamily: FONTS.interSemiBold,
    fontSize: 13,
    color: COLORS.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  error: {
    marginTop: 8,
    fontFamily: FONTS.interRegular,
    fontSize: 12,
    color: COLORS.error,
  },
  infoBox: {
    marginBottom: 16,
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderRadius: 13,
    backgroundColor: COLORS.primaryPale,
  },
  infoText: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.primary,
  },
  suggest: {
    marginBottom: 14,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    marginBottom: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  moduleName: {
    flex: 1,
    fontFamily: FONTS.interSemiBold,
    fontSize: 13,
    color: COLORS.text,
  },
  badge: {
    overflow: 'hidden',
    marginEnd: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 7,
    backgroundColor: COLORS.primaryPale,
    fontFamily: FONTS.interBold,
    fontSize: 10,
    color: COLORS.primary,
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
  },
  cancel: {
    flex: 1,
    marginEnd: 10,
  },
  save: {
    flex: 2,
  },
});
