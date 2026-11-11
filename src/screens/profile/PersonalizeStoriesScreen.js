// PERSONALIZE STORIES SCREEN - "Personalize my child's stories" (opened from Edit profile).
//
// A short, OPTIONAL form that collects things a story can really use, so Read Along
// paragraphs feel familiar and meaningful to the child. It is split into 5 small steps.
// Nothing is required, and every step has a "Skip" button.
//
//   1. People in my child's life     name, mother, father, siblings, other important people
//   2. Favourite things              animal, toy, food, colour, character, game
//   3. Hobbies and interests         hobbies, favourite place, kinds of story
//   4. Everyday world                hometown, everyday activity, familiar places, routine
//   5. Special instructions          free text + tap-to-add ideas, and a sample sentence
//
// Every answer has its OWN field (no "mother, father, pet" in one box). Different input
// types keep it quick: text boxes, pick-from-a-list chips (with "type your own"), colour
// circles and a multi-line box. Skipping keeps whatever is already saved for that step.
// The answers are saved on the child (`child.story`, see utils/storyOptions.js).
//
// Route params: { childId }
// Props: { navigation, route }

import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import TextField from '../../shared/components/TextField';
import ChoiceField from '../../shared/components/ChoiceField';
import ColorChoice from '../../shared/components/ColorChoice';
import Chip from '../../shared/components/Chip';
import Button from '../../shared/components/Button';
import { useChild } from '../../app/store/useChild';
import {
  ANIMALS,
  COLOURS,
  EVERYDAY_ACTIVITIES,
  FAMILIAR_PLACES,
  FOODS,
  GAMES,
  HOBBIES,
  NOTE_IDEAS,
  PLACES,
  ROUTINES,
  STORY_TYPES,
  TOYS,
  cleanStory,
  getStory,
  previewSentence,
} from '../../shared/utils/storyOptions';
import { useChildOptions } from '../../app/store/useChildOptions';
import { COLORS, FONTS } from '../../shared/theme/theme';

const MAX_SIBLINGS = 5;
const MAX_OTHERS = 3;

// The 5 steps: a title and a one-line reason ("why do we ask?").
const STEPS = [
  { title: 'People in my child’s life', why: 'Helps create stories with familiar people.' },
  { title: 'Favourite things', why: 'Helps choose story topics the child enjoys.' },
  { title: 'Hobbies and interests', why: 'Helps create engaging story events.' },
  { title: 'Everyday world', why: 'Helps make stories relatable to daily life.' },
  { title: 'Special instructions', why: 'Anything else the stories should, or should not, include.' },
];

export default function PersonalizeStoriesScreen({ navigation, route }) {
  const { childProfiles, updateChild } = useChild();
  const { relations: RELATIONS } = useChildOptions(); // the relationship list comes from the server
  const child = childProfiles.find((c) => c.id === route.params.childId) || null;

  const [story, setStory] = useState(getStory(child));
  const [step, setStep] = useState(0);
  const scrollRef = useRef(null);

  if (!child) {
    return (
      <Screen mode="parent">
        <Text style={styles.heading}>Profile not found</Text>
      </Screen>
    );
  }

  const { people, favourites, interests, everyday } = story;
  const last = step === STEPS.length - 1;

  // Change ONE answer:  setIn('favourites', 'animal', 'Cat')
  function setIn(section, key, value) {
    setStory({ ...story, [section]: { ...story[section], [key]: value } });
  }

  // The sibling / other-person lists always show at least one empty box.
  const siblings = people.siblings.length > 0 ? people.siblings : [''];
  const others = people.others.length > 0 ? people.others : [{ name: '', relation: '' }];

  function changeStep(number) {
    setStep(number);
    if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: false });
  }

  // Saved on the server. If that fails, a pop-up explains why and the answers stay on screen.
  async function save() {
    if (await updateChild(child.id, { story: cleanStory(story) })) navigation.goBack();
  }

  // "Skip" and "Next" both move on (Skip does not erase anything). The last step saves.
  function goNext() {
    if (last) save();
    else changeStep(step + 1);
  }

  return (
    <Screen scroll mode="parent" scrollRef={scrollRef}>
      <View style={styles.body}>
        <Text style={styles.heading}>Personalize my child’s stories</Text>
        <Text style={styles.intro}>All optional. Fill in only what you know. You can skip any section.</Text>

        {/* progress */}
        <View style={styles.progressRow}>
          <Text style={styles.stepText}>Step {step + 1} of 5</Text>
          {step > 0 ? (
            <Pressable onPress={() => changeStep(step - 1)} hitSlop={8} accessibilityRole="button">
              <Text style={styles.previous}>‹ Previous</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${((step + 1) / STEPS.length) * 100}%` }]} />
        </View>

        <Text style={styles.stepTitle}>{STEPS[step].title}</Text>
        <Text style={styles.why}>{STEPS[step].why}</Text>

        {/* ---------- 1. PEOPLE ---------- */}
        {step === 0 && (
          <View>
            <TextField
              label="Preferred name for stories"
              value={people.preferredName}
              onChangeText={(text) => setIn('people', 'preferredName', text)}
              placeholder={`e.g. ${child.name}`}
              autoCapitalize="words"
              returnKeyType="next"
              style={styles.gap}
            />
            <TextField
              label="Mother’s name or nickname"
              value={people.mother}
              onChangeText={(text) => setIn('people', 'mother', text)}
              placeholder="e.g. Ammi"
              autoCapitalize="words"
              returnKeyType="next"
              style={styles.gap}
            />
            <TextField
              label="Father’s name or nickname"
              value={people.father}
              onChangeText={(text) => setIn('people', 'father', text)}
              placeholder="e.g. Abbu"
              autoCapitalize="words"
              returnKeyType="next"
              style={styles.gap}
            />

            {/* one box per sibling */}
            {siblings.map((name, i) => (
              <View key={i} style={styles.listRow}>
                <TextField
                  label={`Sibling ${i + 1}`}
                  value={name}
                  onChangeText={(text) => setIn('people', 'siblings', siblings.map((s, n) => (n === i ? text : s)))}
                  placeholder="Name or nickname"
                  autoCapitalize="words"
                  returnKeyType="next"
                  style={styles.listField}
                />
                {siblings.length > 1 || name ? (
                  <Pressable
                    onPress={() => setIn('people', 'siblings', siblings.filter((s, n) => n !== i))}
                    accessibilityRole="button"
                    accessibilityLabel="Remove"
                    style={styles.remove}
                  >
                    <Text style={styles.removeText}>✕</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
            {siblings.length < MAX_SIBLINGS && siblings[siblings.length - 1] !== '' ? (
              <Pressable onPress={() => setIn('people', 'siblings', [...siblings, ''])} style={styles.addLink}>
                <Text style={styles.addLinkText}>+ Add a sibling</Text>
              </Pressable>
            ) : null}

            {/* other important people: a name AND how they are related */}
            <Text style={styles.subTitle}>Other important people</Text>
            {others.map((person, i) => (
              <View key={i} style={styles.personCard}>
                <TextField
                  label="Name"
                  value={person.name}
                  onChangeText={(text) =>
                    setIn('people', 'others', others.map((o, n) => (n === i ? { ...o, name: text } : o)))
                  }
                  placeholder="e.g. Dadi"
                  autoCapitalize="words"
                  returnKeyType="done"
                />
                <View style={styles.relationGap}>
                  <ChoiceField
                    label="Relationship"
                    options={RELATIONS}
                    value={person.relation}
                    onChange={(value) =>
                      setIn('people', 'others', others.map((o, n) => (n === i ? { ...o, relation: value } : o)))
                    }
                  />
                </View>
                {others.length > 1 || person.name ? (
                  <Pressable
                    onPress={() => setIn('people', 'others', others.filter((o, n) => n !== i))}
                    accessibilityRole="button"
                    style={styles.removePerson}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
            {others.length < MAX_OTHERS && others[others.length - 1].name !== '' ? (
              <Pressable
                onPress={() => setIn('people', 'others', [...others, { name: '', relation: '' }])}
                style={styles.addLink}
              >
                <Text style={styles.addLinkText}>+ Add another person</Text>
              </Pressable>
            ) : null}
          </View>
        )}

        {/* ---------- 2. FAVOURITE THINGS ---------- */}
        {step === 1 && (
          <View style={styles.stepTop}>
            <ChoiceField
              label="Favourite animal"
              options={ANIMALS}
              value={favourites.animal}
              onChange={(value) => setIn('favourites', 'animal', value)}
            />
            <ChoiceField
              label="Favourite toy or object"
              options={TOYS}
              value={favourites.toy}
              onChange={(value) => setIn('favourites', 'toy', value)}
            />
            <ChoiceField
              label="Favourite food"
              options={FOODS}
              value={favourites.food}
              onChange={(value) => setIn('favourites', 'food', value)}
            />
            <ColorChoice
              label="Favourite colour"
              colours={COLOURS}
              value={favourites.colour}
              onChange={(value) => setIn('favourites', 'colour', value)}
            />
            <TextField
              label="Favourite cartoon or character"
              value={favourites.character}
              onChangeText={(text) => setIn('favourites', 'character', text)}
              placeholder="e.g. Peppa Pig, Burka Avenger"
              autoCapitalize="words"
              returnKeyType="done"
              style={styles.gapBottom}
            />
            <ChoiceField
              label="Favourite game or activity"
              options={GAMES}
              value={favourites.game}
              onChange={(value) => setIn('favourites', 'game', value)}
            />
          </View>
        )}

        {/* ---------- 3. HOBBIES AND INTERESTS ---------- */}
        {step === 2 && (
          <View style={styles.stepTop}>
            <ChoiceField
              label="Favourite hobbies"
              hint="Pick as many as you like."
              options={HOBBIES}
              value={interests.hobbies}
              onChange={(value) => setIn('interests', 'hobbies', value)}
              multiple
              otherPlaceholder="Another hobby"
            />
            <ChoiceField
              label="Favourite place"
              options={PLACES}
              value={interests.place}
              onChange={(value) => setIn('interests', 'place', value)}
            />
            <ChoiceField
              label="Favourite kinds of story"
              hint="Pick as many as you like."
              options={STORY_TYPES}
              value={interests.storyTypes}
              onChange={(value) => setIn('interests', 'storyTypes', value)}
              multiple
              otherPlaceholder="Another kind of story"
            />
          </View>
        )}

        {/* ---------- 4. EVERYDAY WORLD ---------- */}
        {step === 3 && (
          <View style={styles.stepTop}>
            <TextField
              label="Hometown or place you live"
              value={everyday.hometown}
              onChangeText={(text) => setIn('everyday', 'hometown', text)}
              placeholder="Lahore"
              autoCapitalize="words"
              returnKeyType="done"
              style={styles.gapBottom}
            />
            <ChoiceField
              label="Favourite everyday activity"
              options={EVERYDAY_ACTIVITIES}
              value={everyday.activity}
              onChange={(value) => setIn('everyday', 'activity', value)}
            />
            <ChoiceField
              label="Familiar places"
              hint="Places your child goes to often."
              options={FAMILIAR_PLACES}
              value={everyday.places}
              onChange={(value) => setIn('everyday', 'places', value)}
              multiple
              otherPlaceholder="Another place"
            />
            <ChoiceField
              label="Favourite routine or family activity"
              options={ROUTINES}
              value={everyday.routine}
              onChange={(value) => setIn('everyday', 'routine', value)}
            />
          </View>
        )}

        {/* ---------- 5. SPECIAL INSTRUCTIONS ---------- */}
        {step === 4 && (
          <View style={styles.stepTop}>
            <TextField
              label="Special instructions for story generation"
              value={story.notes}
              onChangeText={(text) => setStory({ ...story, notes: text })}
              placeholder="E.g. use familiar Pakistani settings, include simple daily-life situations, avoid scary animals..."
              multiline
            />
            <Text style={styles.optional}>Optional</Text>

            <Text style={styles.subTitle}>Tap an idea to add it</Text>
            <View style={styles.chips}>
              {NOTE_IDEAS.map((idea) => (
                <Chip
                  key={idea}
                  label={idea}
                  selected={story.notes.includes(idea)}
                  onPress={() =>
                    story.notes.includes(idea)
                      ? setStory({ ...story, notes: story.notes.replace(idea, '').replace(/\s{2,}/g, ' ').trim() })
                      : setStory({ ...story, notes: (story.notes ? story.notes.trim() + ' ' : '') + idea })
                  }
                />
              ))}
            </View>

            <View style={styles.preview}>
              <Text style={styles.previewLabel}>STORY PREVIEW</Text>
              <Text style={styles.previewText}>{previewSentence(child.name, story)}</Text>
              <Text style={styles.previewNote}>A sample of how your answers can be used in a story.</Text>
            </View>
          </View>
        )}

        <View style={styles.spacer} />

        <View style={styles.buttons}>
          <Button title="Skip" variant="secondary" onPress={goNext} style={styles.skip} />
          <Button title={last ? 'Save' : 'Next'} onPress={goNext} style={styles.next} />
        </View>

        <Pressable onPress={save} accessibilityRole="button" style={styles.saveClose}>
          <Text style={styles.saveCloseText}>Save and close</Text>
        </Pressable>
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
    fontSize: 22,
    color: COLORS.text,
  },
  intro: {
    marginTop: 4,
    fontFamily: FONTS.interRegular,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textMuted,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 8,
  },
  stepText: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 12,
    color: COLORS.primary,
  },
  previous: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  stepTitle: {
    marginTop: 20,
    fontFamily: FONTS.interBold,
    fontSize: 19,
    color: COLORS.text,
  },
  why: {
    marginTop: 3,
    marginBottom: 6,
    fontFamily: FONTS.interRegular,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textMuted,
  },
  stepTop: {
    marginTop: 12,
  },
  gap: {
    marginTop: 16,
  },
  gapBottom: {
    marginBottom: 22,
  },
  subTitle: {
    marginTop: 24,
    marginBottom: 10,
    fontFamily: FONTS.interBold,
    fontSize: 14,
    color: COLORS.text,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 16,
  },
  listField: {
    flex: 1,
  },
  remove: {
    width: 44,
    height: 50,
    marginStart: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontFamily: FONTS.interBold,
    fontSize: 13,
    color: COLORS.error,
  },
  addLink: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
  },
  addLinkText: {
    fontFamily: FONTS.interBold,
    fontSize: 13,
    color: COLORS.primary,
  },
  personCard: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FBFAFE',
  },
  relationGap: {
    marginTop: 16,
    marginBottom: -10,
  },
  removePerson: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
  },
  optional: {
    marginTop: 8,
    fontFamily: FONTS.interRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preview: {
    marginTop: 26,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  previewLabel: {
    fontFamily: FONTS.interBold,
    fontSize: 11,
    letterSpacing: 0.7,
    color: COLORS.textMuted,
  },
  previewText: {
    marginTop: 8,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 18,
    lineHeight: 29,
    color: COLORS.warmText,
  },
  previewNote: {
    marginTop: 8,
    fontFamily: FONTS.interRegular,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  spacer: {
    flex: 1,
    minHeight: 24,
  },
  buttons: {
    flexDirection: 'row',
  },
  skip: {
    flex: 1,
    marginEnd: 10,
  },
  next: {
    flex: 2,
  },
  saveClose: {
    alignSelf: 'center',
    marginTop: 12,
    padding: 8,
  },
  saveCloseText: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 13,
    color: COLORS.textMuted,
  },
});
