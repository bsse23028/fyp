// AAC BOARD SCREEN - "Talk": the child taps pictures to say what they want (AAC = Augmentative and
// Alternative Communication). Built like the boards speech therapists use worldwide:
//   * top     the SENTENCE STRIP: the picked words in order + Speak, delete-last and clear
//   * tabs    Core (the 36 Universal Core words) and the topic pages: Food, Play, Feelings, People, Places
//   * board   the CORE words in a fixed 6 x 6 grid (a word never moves, so the child learns its place),
//             or the 6 big words of a topic page; every button has its word-type colour (Fitzgerald Key)
// A tap speaks the word at once (AAC.SPEAK_ON_TAP) and adds it to the strip; Speak says the whole sentence.
// In Urdu the words and the voice are Urdu, but the board keeps the SAME places (it is not mirrored).
// All the words, colours and pictures are in data/aacWords.js; every number is in aacConfig.js.
// Nothing is saved.
//
// Props: { navigation }

import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Screen from '../../../shared/components/Screen';
import SentenceStrip from '../components/SentenceStrip';
import TopicTabs from '../components/TopicTabs';
import WordButton from '../components/WordButton';
import { speak, stopSpeaking } from '../../../shared/utils/speech';
import { getCurrentLanguage, translate } from '../../../shared/i18n/translate';
import { CORE, CORE_COLUMNS, TOPICS, TOPIC_COLUMNS } from '../data/aacWords';
import { AAC } from '../aacConfig';

// Say some words in the language the app is in (each word translated on its own).
function say(words) {
  const urdu = getCurrentLanguage() === 'ur';
  const text = words.map((item) => translate(item.word)).join(' ');
  speak(text, { language: urdu ? 'ur-PK' : 'en-US', rate: AAC.RATE });
}

export default function AACBoardScreen({ navigation }) {
  const [sentence, setSentence] = useState([]);
  const [page, setPage] = useState('core');
  const [area, setArea] = useState(null); // the size of the board area, measured on screen

  // stop talking when the child leaves the board
  useEffect(() => navigation.addListener('blur', stopSpeaking), [navigation]);

  function pick(item) {
    if (AAC.SPEAK_ON_TAP) say([item]);
    setSentence((old) => [...old, item].slice(-AAC.MAX_WORDS));
  }

  const topic = TOPICS.find((t) => t.id === page);
  const words = topic ? topic.words : CORE;
  const columns = topic ? TOPIC_COLUMNS : CORE_COLUMNS;
  const rows = Math.ceil(words.length / columns);

  // every button gets the same size, so the whole board fits the screen without scrolling
  let cellWidth = 0;
  let cellHeight = 0;
  if (area) {
    cellWidth = (area.width - AAC.GAP * (columns - 1)) / columns;
    cellHeight = Math.min((area.height - AAC.GAP * (rows - 1)) / rows, cellWidth * 1.6);
  }

  return (
    <Screen mode="child" contentStyle={styles.content}>
      <SentenceStrip
        words={sentence}
        onSpeak={() => say(sentence)}
        onDeleteLast={() => setSentence((old) => old.slice(0, -1))}
        onClear={() => {
          stopSpeaking();
          setSentence([]);
        }}
      />

      <View style={styles.tabs}>
        <TopicTabs topics={TOPICS} value={page} onChange={setPage} />
      </View>

      <View style={styles.board} onLayout={(e) => setArea(e.nativeEvent.layout)}>
        {area ? (
          <View style={styles.grid}>
            {words.map((item) => (
              <WordButton key={item.word} item={item} width={cellWidth} height={cellHeight} big={Boolean(topic)} onPress={pick} />
            ))}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: AAC.SIDE_PADDING,
    paddingTop: 8,
    paddingBottom: 10,
  },
  tabs: {
    marginTop: 10,
    marginBottom: 10,
  },
  board: {
    flex: 1,
  },
  // always left to right, also in Urdu: the words keep their places (motor planning)
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AAC.GAP,
    direction: 'ltr',
  },
});
