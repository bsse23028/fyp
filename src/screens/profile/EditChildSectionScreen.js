// EDIT CHILD SECTION SCREEN - edits ONE part of a child's profile, with its own Save.
// Which part is decided by the route param `section`:
//
//   'basics'   nickname, age band, avatar, language
//   'support'  areas of support in 3 groups (Learning, Communication, Everyday life). Each area says
//              what it helps with; its tick box chooses it, tapping the rest of the card DROPS DOWN its
//              activities (e.g. Reading -> Read-Along, Reading Assist, Phonics, Spelling, each with a
//              short line). Each group has a small guide: "Diagnosed with X? We recommend
//              these areas + these activities" (the 7 conditions and Table 1.1 of the FYP proposal; one tap
//              chooses them). On Save the parent can switch on the matching activities.
//   'modules'  activities switched on / off: first "Recommended for {name}" (matching the areas of
//              support, each saying which area it helps), then the other activities.
//
// The lists of groups, diagnoses and activity lines live in supportGuide.js.
// Every input is separate and optional (except the nickname and the age band).
// "Save" stores the changes on the server with updateChild and goes back.
// The header logo previews the avatar while it is being chosen.
//
// Route params: { childId, section }
// Props: { navigation, route }

import React, { useState } from 'react';
import { Alert, Animated, StyleSheet, View } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import TextField from '../../shared/components/TextField';
import Chip from '../../shared/components/Chip';
import AvatarPicker from '../../shared/components/AvatarPicker';
import SegmentedControl from '../../shared/components/SegmentedControl';
import Toggle from '../../shared/components/Toggle';
import Button from '../../shared/components/Button';
import AnimatedPressable from '../../shared/components/AnimatedPressable';
import AppIcon from '../../shared/components/AppIcon';
import { useChild } from '../../app/store/useChild';
import { useChildOptions } from '../../app/store/useChildOptions';
import { toggleInList } from '../../shared/utils/childOptions';
import { translate } from '../../shared/i18n/translate';
import { useEntrance } from '../../shared/utils/motion';
import { globalStyles } from '../../shared/theme/globalStyles';
import { CATEGORY, COLORS, FONTS } from '../../shared/theme/theme';
import { MODULE_ABOUT, SUPPORT_GROUPS, activitiesToOffer, groupsFor, recommendedFor } from './supportGuide';

const TITLES = {
  basics: 'Basics',
  support: 'Areas of support',
  modules: 'Activities',
};

// the colours of the group an area of support belongs to
function colorsOfArea(area) {
  const group = SUPPORT_GROUPS.find((g) => g.areas.some((a) => a.name === area));
  return CATEGORY[group ? group.color : 'games'];
}

// "Reading · Writing" in the app language
const listText = (names) => names.map((n) => translate(n)).join(' · ');

// one activity in an area's drop-down: a dot, its name, a short line and the sensor badge (fades in, one by one)
function AreaActivity({ module, index, colors }) {
  const entrance = useEntrance(index, { distance: 8 });
  return (
    <Animated.View style={[styles.dropItem, entrance]}>
      <View style={[styles.dropDot, { backgroundColor: colors.main }]} />
      <View style={styles.areaText}>
        <Text style={styles.dropName}>{module.name}</Text>
        {MODULE_ABOUT[module.name] ? <Text style={styles.areaAbout}>{MODULE_ABOUT[module.name]}</Text> : null}
      </View>
      {module.sensor ? <Text style={styles.badge}>{module.sensor}</Text> : null}
    </Animated.View>
  );
}

export default function EditChildSectionScreen({ navigation, route }) {
  const { childId, section } = route.params;
  const { childProfiles, updateChild } = useChild();
  // The choice lists from the server (named like the old constants, so the form below did not change).
  const {
    ageBands: AGE_BANDS,
    languages: LANGUAGES,
    modules: MODULES,
    supports: SUPPORT_OPTIONS,
  } = useChildOptions();
  const child = childProfiles.find((c) => c.id === childId) || null;

  // Start with the saved values.
  const [name, setName] = useState(child ? child.name : '');
  const [ageBand, setAgeBand] = useState(child ? child.ageBand : '');
  const [avatar, setAvatar] = useState(child ? child.avatar : 'rabbit');
  const [language, setLanguage] = useState(child ? child.language : 'en');
  const [supports, setSupports] = useState((child && child.supports) || []);
  const [modules, setModules] = useState((child && child.modules) || []);
  // the diagnoses whose "Choose" was pressed (not saved: only used to offer the proposal's activities on Save)
  const [chosenDiagnoses, setChosenDiagnoses] = useState([]);
  const [openArea, setOpenArea] = useState(null); // the area of support whose activities are shown (drop-down)
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

  // the activities that fit the SAVED areas of support (the Activities section)
  const savedSupports = child.supports || [];
  const recommended = recommendedFor(MODULES, savedSupports);
  const others = MODULES.filter((m) => !recommended.some((r) => r.name === m.name));

  async function save(changes) {
    setSaving(true);
    // Saved on the server. If that fails, a pop-up explains why and we stay here.
    const saved = await updateChild(child.id, changes);
    setSaving(false);
    if (saved) navigation.goBack();
  }

  // Areas of support: offer to switch on the activities that match (a chosen diagnosis = exactly
  // its modules from the FYP proposal; areas ticked by hand = the activities of those areas).
  function saveSupports() {
    const fitting = activitiesToOffer(MODULES, supports, chosenDiagnoses);
    const missing = fitting.filter((m) => !modules.includes(m));
    if (missing.length === 0) {
      save({ supports });
      return;
    }
    Alert.alert(
      translate('Switch on matching activities?'),
      translate('These activities help with the areas you chose: {list}', { list: listText(missing) }),
      [
        { text: translate('Only save areas'), onPress: () => save({ supports }) },
        { text: translate('Switch them on'), onPress: () => save({ supports, modules: [...modules, ...missing] }) },
      ]
    );
  }

  function handleSave() {
    if (section === 'basics') {
      setSubmitted(true);
      if (nameProblem || ageProblem) return;
      save({ name: name.trim(), ageBand, avatar, language });
    } else if (section === 'support') {
      saveSupports();
    } else {
      save({ modules });
    }
  }

  // one activity row: name, a short line, (recommended: which areas it helps), the sensor badge, on / off
  function moduleRow(module, because) {
    return (
      <View key={module.name} style={styles.moduleRow}>
        <View style={styles.moduleText}>
          <Text style={styles.moduleName}>{module.name}</Text>
          {MODULE_ABOUT[module.name] ? <Text style={styles.moduleAbout}>{MODULE_ABOUT[module.name]}</Text> : null}
          {because ? (
            <View style={styles.forRow}>
              {because.map((area) => (
                <Text key={area} style={[styles.forTag, { backgroundColor: colorsOfArea(area).pale, color: colorsOfArea(area).deep }]}>
                  {area}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
        {module.sensor ? <Text style={styles.badge}>{module.sensor}</Text> : null}
        <Toggle on={modules.includes(module.name)} onPress={() => setModules(toggleInList(modules, module.name))} />
      </View>
    );
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

        {/* ---------- AREAS OF SUPPORT (3 groups + a diagnosis guide in each) ---------- */}
        {section === 'support' && (
          <View>
            <Text style={[globalStyles.subheading, styles.intro]}>
              Choose the areas where your child needs help. This is optional.
            </Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                This does not diagnose anything. If your child already has a diagnosis, the guide in each group shows
                where to start.
              </Text>
            </View>

            {groupsFor(SUPPORT_OPTIONS).map((group) => {
              const colors = CATEGORY[group.color];
              return (
                <View key={group.key} style={styles.group}>
                  {/* group title */}
                  <View style={styles.groupHead}>
                    <View style={[styles.groupIcon, { backgroundColor: colors.pale }]}>
                      <AppIcon name={group.icon} size={22} color={colors.deep} />
                    </View>
                    <Text style={styles.groupTitle}>{group.title}</Text>
                  </View>

                  {/* the areas: the tick box chooses it, the rest of the card opens its activities */}
                  {group.areas.map((area) => {
                    const on = supports.includes(area.name);
                    const open = openArea === area.name;
                    const areaModules = MODULES.filter((m) => (m.supports || []).includes(area.name));
                    return (
                      <View
                        key={area.name}
                        style={[styles.area, on && { borderColor: colors.main, backgroundColor: colors.pale }]}
                      >
                        <View style={styles.areaRow}>
                          <AnimatedPressable
                            onPress={() => setSupports(toggleInList(supports, area.name))}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: on }}
                            accessibilityLabel={translate(area.name)}
                            hitSlop={8}
                            style={styles.checkHit}
                          >
                            <View style={[styles.check, on && { backgroundColor: colors.main, borderColor: colors.main }]}>
                              {on ? <AppIcon name="check-bold" size={16} color={COLORS.white} /> : null}
                            </View>
                          </AnimatedPressable>
                          {/* AnimatedPressable puts `style` on its INNER view, so this outer View gives it the
                              free width of the row (without it the text is squeezed to zero width) */}
                          <View style={styles.areaOpenSlot}>
                            <AnimatedPressable
                              onPress={() => setOpenArea(open ? null : area.name)}
                              accessibilityRole="button"
                              accessibilityState={{ expanded: open }}
                              style={styles.areaOpen}
                            >
                              <View style={styles.areaText}>
                                <Text style={styles.areaName}>{area.name}</Text>
                                {area.about ? <Text style={styles.areaAbout}>{area.about}</Text> : null}
                                <Text style={[styles.areaCount, { color: colors.deep }]}>
                                  {translate(open ? 'Hide {n} activities' : 'Show {n} activities', { n: areaModules.length })}
                                </Text>
                              </View>
                              <AppIcon name={open ? 'chevron-up' : 'chevron-down'} size={26} color={colors.deep} />
                            </AnimatedPressable>
                          </View>
                        </View>

                        {/* the drop-down: every activity of this area with a short line */}
                        {open ? (
                          <View style={styles.dropDown}>
                            {areaModules.map((module, i) => (
                              <AreaActivity key={module.name} module={module} index={i} colors={colors} />
                            ))}
                          </View>
                        ) : null}
                      </View>
                    );
                  })}

                  {/* the guide: diagnosed with X? we recommend these areas */}
                  {group.diagnoses.length > 0 ? (
                    <View style={[styles.guide, { backgroundColor: colors.pale }]}>
                      <Text style={[styles.guideTitle, { color: colors.deep }]}>Has your child been diagnosed with…</Text>
                      {group.diagnoses.map((diagnosis) => {
                        const areas = diagnosis.recommend.filter((a) => SUPPORT_OPTIONS.includes(a));
                        const activities = diagnosis.modules.filter((m) => MODULES.some((x) => x.name === m));
                        const allChosen = chosenDiagnoses.includes(diagnosis.name) && areas.every((a) => supports.includes(a));
                        return (
                          <View key={diagnosis.name} style={styles.diagnosis}>
                            <View style={styles.areaText}>
                              <Text style={styles.diagnosisName}>{diagnosis.name}</Text>
                              <Text style={styles.areaAbout}>{diagnosis.about}</Text>
                              <Text style={styles.recommend}>
                                {translate('We recommend: {list}', { list: listText(areas) })}
                              </Text>
                              <Text style={styles.activities}>
                                {translate('Activities: {list}', { list: listText(activities) })}
                              </Text>
                            </View>
                            <AnimatedPressable
                              onPress={() => {
                                setSupports([...supports, ...areas.filter((a) => !supports.includes(a))]);
                                if (!chosenDiagnoses.includes(diagnosis.name)) setChosenDiagnoses([...chosenDiagnoses, diagnosis.name]);
                              }}
                              accessibilityLabel={translate('Choose the areas for {name}', { name: translate(diagnosis.name) })}
                              style={[styles.choose, { borderColor: colors.deep }, allChosen && { backgroundColor: colors.deep }]}
                            >
                              <Text style={[styles.chooseText, { color: allChosen ? COLORS.white : colors.deep }]}>
                                {allChosen ? 'Chosen' : 'Choose'}
                              </Text>
                            </AnimatedPressable>
                          </View>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        {/* ---------- ACTIVITIES (recommended from the areas of support first) ---------- */}
        {section === 'modules' && (
          <View>
            <Text style={[globalStyles.subheading, styles.intro]}>Switch activities on or off. You stay in control.</Text>

            {recommended.length > 0 ? (
              <View>
                <Text style={styles.listTitle}>{translate('Recommended for {name}', { name: child.name })}</Text>
                <Text style={styles.listNote}>
                  {translate('Based on the areas of support: {list}', { list: listText(savedSupports) })}
                </Text>
                <Button
                  title="Switch on all recommended"
                  variant="secondary"
                  onPress={() => setModules([...modules, ...recommended.map((m) => m.name).filter((m) => !modules.includes(m))])}
                  style={styles.suggest}
                />
                {recommended.map((module) => moduleRow(module, module.because))}
                <Text style={[styles.listTitle, styles.otherTitle]}>Other activities</Text>
              </View>
            ) : (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>Choose areas of support to see which activities we recommend.</Text>
                <Button
                  title="Choose areas of support"
                  variant="secondary"
                  onPress={() => navigation.replace('EditChildSection', { childId: child.id, section: 'support' })}
                  style={styles.goSupport}
                />
              </View>
            )}

            {others.map((module) => moduleRow(module))}
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
    color: COLORS.heading,
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
  // ----- areas of support -----
  group: {
    marginBottom: 22,
  },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 10,
  },
  groupTitle: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 18,
    color: COLORS.heading,
  },
  area: {
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // the tick box: a 48 x 48 touch area around the small square
  checkHit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // the rest of the card: opens / closes the drop-down
  areaOpenSlot: {
    flex: 1,
  },
  areaOpen: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingVertical: 4,
    paddingStart: 4,
    paddingEnd: 4,
  },
  areaCount: {
    marginTop: 4,
    fontFamily: FONTS.interBold,
    fontSize: 12,
  },
  dropDown: {
    marginTop: 4,
    marginBottom: 4,
    marginHorizontal: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  dropDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginEnd: 10,
  },
  dropName: {
    fontFamily: FONTS.interBold,
    fontSize: 13,
    color: COLORS.text,
  },
  areaText: {
    flex: 1,
  },
  areaName: {
    fontFamily: FONTS.interBold,
    fontSize: 14,
    color: COLORS.text,
  },
  areaAbout: {
    marginTop: 2,
    fontFamily: FONTS.interRegular,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textMuted,
  },
  guide: {
    marginTop: 4,
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 4,
    borderRadius: 14,
  },
  guideTitle: {
    marginBottom: 8,
    fontFamily: FONTS.interBold,
    fontSize: 13,
  },
  diagnosis: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  diagnosisName: {
    fontFamily: FONTS.interBold,
    fontSize: 13,
    color: COLORS.text,
  },
  recommend: {
    marginTop: 4,
    fontFamily: FONTS.interSemiBold,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.text,
  },
  activities: {
    marginTop: 3,
    fontFamily: FONTS.interRegular,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textMuted,
  },
  choose: {
    minWidth: 76,
    minHeight: 40,
    marginStart: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chooseText: {
    fontFamily: FONTS.interBold,
    fontSize: 12,
  },
  // ----- activities -----
  listTitle: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 18,
    color: COLORS.heading,
  },
  otherTitle: {
    marginTop: 16,
    marginBottom: 10,
  },
  listNote: {
    marginTop: 2,
    marginBottom: 10,
    fontFamily: FONTS.interRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  suggest: {
    marginBottom: 14,
  },
  goSupport: {
    marginTop: 10,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  moduleText: {
    flex: 1,
    marginEnd: 8,
  },
  moduleName: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 14,
    color: COLORS.text,
  },
  moduleAbout: {
    marginTop: 2,
    fontFamily: FONTS.interRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  forRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  forTag: {
    overflow: 'hidden',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    fontFamily: FONTS.interBold,
    fontSize: 11,
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
