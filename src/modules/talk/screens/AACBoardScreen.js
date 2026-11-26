// AAC BOARD SCREEN - "Talk": the child taps pictures to say what they want (AAC = Augmentative and
// Alternative Communication). Built like the boards speech therapists use worldwide (TD Snap Core First,
// Proloquo2Go, TouchChat WordPower):
//   * top       the SENTENCE STRIP: the picked words in order + Speak, delete-last and clear
//   * quick     yes · no · please · thank you · wait · toilet, ALWAYS on screen
//   * switch    "Core words" | "Topics", and the size switch: BIG buttons (3 pages of 16: SWIPE left / right or use
//               the arrows) or ALL words (6 x 8)
//   * board     the CORE words (they never move: motor planning), or the 13 TOPIC folders; a folder opens
//               its 12 pictures (Food & drinks, Play, Feelings, People, Places, My body, Clothes, Animals,
//               Colours, My day, School, Weather, Moving)
// Every button has its word-type colour (Fitzgerald Key). A tap speaks the word at once and adds it to the
// strip; Speak says the whole sentence. In Urdu the words and the voice are Urdu, but every word keeps its
// place (the board is not mirrored). The size choice is remembered on the phone (KEYS.aacBig).
// All words, colours and pictures: data/aacWords.js · every number: aacConfig.js · nothing else is saved.
//
// Props: { navigation }

import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Text from '../../../shared/components/AppText';
import Screen from '../../../shared/components/Screen';
import AppIcon from '../../../shared/components/AppIcon';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import SegmentedControl from '../../../shared/components/SegmentedControl';
import SentenceStrip from '../components/SentenceStrip';
import QuickWords from '../components/QuickWords';
import WordButton from '../components/WordButton';
import FolderTile from '../components/FolderTile';
import { speak, stopSpeaking } from '../../../shared/utils/speech';
import { getCurrentLanguage, translate } from '../../../shared/i18n/translate';
import { KEYS, loadData, saveData } from '../../../shared/utils/storage';
import {
  BIG_COLUMNS,
  CORE,
  CORE_BIG_PAGES,
  CORE_COLUMNS,
  FOLDER_COLUMNS,
  QUICK,
  TOPICS,
  TOPIC_COLUMNS,
} from '../data/aacWords';
import { AAC } from '../aacConfig';
import { CALM_SHADOW, FONTS, PALETTE } from '../../../shared/theme/theme';

const VIEWS = [
  { id: 'core', label: 'Core words' },
  { id: 'topics', label: 'Topics' },
];

// Say some words in the language the app is in (each word translated on its own).
function say(words) {
  const urdu = getCurrentLanguage() === 'ur';
  const text = words.map((item) => translate(item.word)).join(' ');
  speak(text, { language: urdu ? 'ur-PK' : 'en-US', rate: AAC.RATE });
}

// Equal buttons that fill `area` without scrolling.
function cellSize(area, columns, rows) {
  const width = (area.width - AAC.GAP * (columns - 1)) / columns;
  const height = Math.min((area.height - AAC.GAP * (rows - 1)) / rows, width * AAC.MAX_CELL_RATIO);
  return { width, height };
}

// a small round icon button (page arrows, back, size switch)
function RoundButton({ icon, label, onPress, disabled }) {
  return (
    <AnimatedPressable onPress={onPress} disabled={disabled} accessibilityLabel={label} style={[styles.round, CALM_SHADOW.soft]}>
      <AppIcon name={icon} size={24} color={PALETTE.purple} />
    </AnimatedPressable>
  );
}

export default function AACBoardScreen({ navigation }) {
  const [sentence, setSentence] = useState([]);
  const [view, setView] = useState('core');
  const [big, setBig] = useState(AAC.START_BIG);
  const [page, setPage] = useState(0); // the big-button core page (0-2)
  const [folder, setFolder] = useState(null); // the open topic folder
  const [width, setWidth] = useState(0); // the board's width (for the quick row)
  const [area, setArea] = useState(null); // the size of the board area, measured on screen
  const pager = useRef(null); // the swipeable Big pages

  // go to a Big page (the arrows); swiping sets `page` by itself (onMomentumScrollEnd)
  function goToPage(next) {
    const target = Math.max(0, Math.min(CORE_BIG_PAGES.length - 1, next));
    setPage(target);
    if (pager.current && area) pager.current.scrollTo({ x: target * area.width, animated: true });
  }

  // stop talking when the child leaves the board; remember the size choice of this phone
  useEffect(() => navigation.addListener('blur', stopSpeaking), [navigation]);
  useEffect(() => {
    loadData(KEYS.aacBig, AAC.START_BIG).then(setBig);
  }, []);
  function switchSize() {
    setBig(!big);
    saveData(KEYS.aacBig, !big);
  }

  function pick(item) {
    if (AAC.SPEAK_ON_TAP) say([item]);
    setSentence((old) => [...old, item].slice(-AAC.MAX_WORDS));
  }

  // ---- what the board shows now ----
  let words = null;
  let columns = 3;
  let bar = null; // the row under the switch: page arrows, or the open folder's name + back
  if (view === 'core') {
    if (big) {
      words = CORE_BIG_PAGES[page];
      columns = BIG_COLUMNS;
      bar = (
        <View style={styles.bar}>
          <RoundButton icon="chevron-left" label="Previous page" onPress={() => goToPage(page - 1)} disabled={page === 0} />
          <View style={styles.dots}>
            {CORE_BIG_PAGES.map((_, i) => (
              <View key={i} style={[styles.dot, i === page && styles.dotOn]} />
            ))}
          </View>
          <RoundButton
            icon="chevron-right"
            label="Next page"
            onPress={() => goToPage(page + 1)}
            disabled={page === CORE_BIG_PAGES.length - 1}
          />
        </View>
      );
    } else {
      words = CORE;
      columns = CORE_COLUMNS;
    }
  } else if (folder) {
    words = folder.words;
    columns = TOPIC_COLUMNS;
    bar = (
      <View style={styles.bar}>
        <RoundButton icon="arrow-left" label="All topics" onPress={() => setFolder(null)} />
        <Text style={styles.folderName} numberOfLines={1}>
          {folder.title}
        </Text>
        <View style={styles.roundSpace} />
      </View>
    );
  }

  const rows = words ? Math.ceil(words.length / columns) : Math.ceil(TOPICS.length / FOLDER_COLUMNS);
  let cell = area ? cellSize(area, words ? columns : FOLDER_COLUMNS, rows) : null;
  // the views that scroll up / down get buttons of at least AAC.MIN_CELL_RATIO x their width, so the pictures stay big
  if (cell && !(view === 'core' && big)) cell = { ...cell, height: Math.max(cell.height, cell.width * AAC.MIN_CELL_RATIO) };

  return (
    <Screen mode="child" contentStyle={styles.content}>
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <SentenceStrip
          words={sentence}
          onSpeak={() => say(sentence)}
          onDeleteLast={() => setSentence((old) => old.slice(0, -1))}
          onClear={() => {
            stopSpeaking();
            setSentence([]);
          }}
        />
        {width ? (
          <View style={styles.quick}>
            <QuickWords words={QUICK} width={width} onPress={pick} />
          </View>
        ) : null}
      </View>

      {/* Core words | Topics, and the size switch (core only) */}
      <View style={styles.switchRow}>
        <View style={styles.switcher}>
          <SegmentedControl
            options={VIEWS}
            value={view}
            onChange={(id) => {
              setView(id);
              setFolder(null);
            }}
          />
        </View>
        {view === 'core' ? (
          <AnimatedPressable onPress={switchSize} accessibilityLabel={big ? 'Show all words' : 'Show big buttons'} style={[styles.size, CALM_SHADOW.soft]}>
            <AppIcon name={big ? 'view-grid' : 'magnify-plus-outline'} size={20} color={PALETTE.purple} />
            <Text style={styles.sizeText}>{big ? 'All' : 'Big'}</Text>
          </AnimatedPressable>
        ) : null}
      </View>

      {bar}

      <View style={styles.board} onLayout={(e) => setArea(e.nativeEvent.layout)}>
        {cell && view === 'core' && big ? (
          // the Big core pages: swipe left / right (or use the arrows); each page is one 4 x 4 grid
          <ScrollView
            ref={pager}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: page * area.width, y: 0 }}
            onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / area.width))}
            style={styles.pager}
          >
            {CORE_BIG_PAGES.map((pageWords, p) => (
              <View key={p} style={[styles.grid, { width: area.width }]}>
                {pageWords.map((item, i) => (
                  <WordButton key={`${item.word}-${i}`} item={item} width={cell.width} height={cell.height} big onPress={pick} />
                ))}
              </View>
            ))}
          </ScrollView>
        ) : cell ? (
          // All words, the topic folders and a folder's words: scroll up / down when they do not fit
          <ScrollView showsVerticalScrollIndicator contentContainerStyle={styles.scrollGrid}>
          <View style={styles.grid}>
            {words
              ? words.map((item, i) => (
                  <WordButton
                    key={`${item.word}-${i}`}
                    item={item}
                    width={cell.width}
                    height={cell.height}
                    big={columns <= BIG_COLUMNS}
                    onPress={pick}
                  />
                ))
              : TOPICS.map((topic) => (
                  <FolderTile key={topic.id} topic={topic} width={cell.width} height={cell.height} onPress={() => setFolder(topic)} />
                ))}
          </View>
          </ScrollView>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: AAC.SIDE_PADDING,
    paddingTop: 6,
    paddingBottom: 8,
  },
  quick: {
    marginTop: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  switcher: {
    flex: 1,
  },
  size: {
    minWidth: 56,
    minHeight: 52,
    marginStart: 8,
    paddingHorizontal: 8,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.cloudWhite,
  },
  sizeText: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 11,
    color: PALETTE.purple,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  round: {
    width: AAC.ARROW_SIZE,
    height: AAC.ARROW_SIZE,
    borderRadius: AAC.ARROW_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.cloudWhite,
  },
  roundSpace: {
    width: AAC.ARROW_SIZE,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PALETTE.pastelLilac,
  },
  dotOn: {
    width: 26,
    backgroundColor: PALETTE.purple,
  },
  folderName: {
    flex: 1,
    marginHorizontal: 10,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 20,
    color: PALETTE.purple,
    textAlign: 'center',
  },
  board: {
    flex: 1,
    marginTop: 8,
  },
  // the swipeable Big pages stay left to right in Urdu too (page 1 is always the first)
  pager: {
    direction: 'ltr',
  },
  scrollGrid: {
    paddingBottom: 12,
  },
  // always left to right, also in Urdu: the words keep their places (motor planning)
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AAC.GAP,
    direction: 'ltr',
  },
});
