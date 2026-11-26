// LOGIC TESTS - the rules the website shares with the mobile app.   npm test   (in website/frontend)

import { describe, expect, test } from 'vitest';
import { emailError, passwordChecks, passwordError, PIN_FORMAT } from './utils/validation';
import { setCurrentLanguage, translate } from './i18n/translate';
import ur from './i18n/ur.json';
import { ageText, allTimeTotals, dayKey, lastActiveText, streakDays, weekTotals } from './utils/progress';
import buildQuestions, { starsFor } from './data/alphabetQuestions';
import { ALPHABET, getLetter } from './data/alphabetData';
import { findSentences, getSentence, DEMO_TOPICS } from './data/readingData';
import { cleanStory, countStoryDetails, EMPTY_STORY } from './data/storyOptions';
import { getAvatar } from './data/avatars';
import { parentStartPath } from './utils/start';
import { ACTIVITY_BY_NO, ENGLISH_MODULES, LEARNING_GROUPS, activityOn, groupIsBuilt, groupTarget, visibleGroups } from './utils/modules';
import { ALL_DIAGNOSES, activitiesToOffer, recommendedFor } from './data/supportGuide';
import { CORE, CORE_BIG_PAGES, QUICK, TOPICS, symbolFor } from './data/aacWords';
import { previewGuideFor } from './utils/previewGuides';
import { MODULES as ALL_MODULES } from './data/childOptions';

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dayKey(d);
};

describe('validation (same rules as the app and the API)', () => {
  test('email', () => {
    expect(emailError('')).toBe('Enter your email address.');
    expect(emailError('nope')).toBe('Enter a valid email address.');
    expect(emailError(' sara@example.com ')).toBe('');
  });
  test('password rules', () => {
    expect(passwordError('')).toBe('Enter a password.');
    expect(passwordError('weakpass')).not.toBe('');
    expect(passwordError('Has Space#1')).not.toBe('');
    expect(passwordError('Kidbuddy#2026')).toBe('');
    expect(passwordError(`Aa1#${'x'.repeat(70)}`)).toBe('Use at most 72 characters.');
    expect(passwordChecks('Abc').filter((r) => r.ok).map((r) => r.id)).toEqual(['upper', 'lower', 'space']);
  });
  test('PIN is exactly 4 digits', () => {
    expect(PIN_FORMAT.test('1234')).toBe(true);
    expect(PIN_FORMAT.test('12a4')).toBe(false);
    expect(PIN_FORMAT.test('12345')).toBe(false);
  });
});

describe('translations', () => {
  test('English stays English, Urdu is looked up, patterns are filled', () => {
    setCurrentLanguage('en');
    expect(translate('Log In')).toBe('Log In');
    expect(translate('Delete {name}?', { name: 'Zara' })).toBe('Delete Zara?');
    setCurrentLanguage('ur');
    expect(translate('Log In')).toBe(ur['Log In']);
    expect(translate('Delete {name}?', { name: 'Zara' })).toContain('Zara');
    expect(translate('Unknown words stay as they are')).toBe('Unknown words stay as they are');
    setCurrentLanguage('en');
  });
  test('every Urdu value is a non-empty string and keeps its {placeholders}', () => {
    Object.entries(ur).forEach(([key, value]) => {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
      (key.match(/\{\w+\}/g) || []).forEach((ph) => expect(value).toContain(ph));
    });
  });
});

describe('progress maths (Parent Home / Progress)', () => {
  const child = { ageBand: '4–6 years', activity: { [daysAgo(0)]: { sessions: 2, stars: 6 }, [daysAgo(1)]: { sessions: 1, stars: 3 }, [daysAgo(9)]: { sessions: 1, stars: 3 } } };
  test('week totals, all-time totals, streak, last active, age', () => {
    expect(weekTotals(child)).toEqual({ sessions: 3, stars: 9 });
    expect(allTimeTotals(child)).toEqual({ sessions: 4, stars: 12 });
    expect(streakDays(child)).toBe(2);
    expect(lastActiveText(child)).toBe('Today');
    expect(lastActiveText({ activity: {} })).toBe('Not yet');
    expect(ageText(child)).toBe('Age 4–6');
  });
  test('a streak survives until the end of today', () => {
    expect(streakDays({ activity: { [daysAgo(1)]: { sessions: 1, stars: 3 }, [daysAgo(2)]: { sessions: 1, stars: 3 } } })).toBe(2);
  });
});

describe('Star Check questions', () => {
  test('5 questions, each with exactly one right answer among 3', () => {
    ALPHABET.forEach((item) => {
      const questions = buildQuestions(item);
      expect(questions).toHaveLength(5);
      questions.forEach((q) => {
        expect(q.options).toHaveLength(3);
        expect(q.options.filter((o) => o.correct)).toHaveLength(1);
        expect(new Set(q.options.map((o) => o.key)).size).toBe(3);
      });
    });
  });
  test('stars from first-try answers', () => {
    expect([0, 1, 2, 3, 4, 5].map(starsFor)).toEqual([1, 1, 2, 2, 3, 3]);
  });
  test('unknown letters fall back to A', () => {
    expect(getLetter('?').letter).toBe('A');
  });
});

describe('reading, stories, avatars, start page', () => {
  test('sentences and Urdu fallback', () => {
    const sentences = findSentences(DEMO_TOPICS, 'animals', 'easy');
    expect(sentences.length).toBeGreaterThan(0);
    expect(getSentence(sentences, 0, 'en').words.length).toBeGreaterThan(0);
    expect(getSentence([{ words: ['Hi'], focus: null }], 0, 'ur')).toEqual({ words: ['Hi'], focus: 0 });
  });
  test('story answers are trimmed and counted', () => {
    const story = { ...EMPTY_STORY, people: { ...EMPTY_STORY.people, mother: '  Ammi ', siblings: [' ', 'Ali'] }, favourites: { ...EMPTY_STORY.favourites, animal: 'Cat' } };
    expect(cleanStory(story).people).toMatchObject({ mother: 'Ammi', siblings: ['Ali'] });
    expect(countStoryDetails({ story })).toBe(3);
  });
  test('the 11 app buddies exist; unknown ids (the old wolf) fall back to the bunny', () => {
    ['rabbit', 'bear', 'panda', 'dino', 'elephant', 'fox', 'kitty', 'koala', 'lion', 'penguin', 'puppy'].forEach((id) => expect(getAvatar(id).id).toBe(id));
    expect(getAvatar('wolf').id).toBe('rabbit');
  });
  test('where a parent starts', () => {
    expect(parentStartPath([{ id: '1' }])).toBe('/parent');
  });
});

describe('the app rules, ported to the website', () => {
  const child = (modules) => ({ id: 'c1', modules });

  test('Child Mode shows only the activities switched on; the demo child sees everything', () => {
    expect(activityOn(child([]), 1)).toBe(false);
    expect(activityOn(child(['Read-Along']), 1)).toBe(true);
    expect(activityOn(child(['AAC Talk Board']), 9)).toBe(true);
    expect(activityOn({ isDemo: true, modules: [] }, 8)).toBe(true);
    expect(Object.keys(ACTIVITY_BY_NO)).toHaveLength(11);
  });

  test('Child Home groups: hidden when nothing is on, trimmed to what is on', () => {
    expect(LEARNING_GROUPS.map((g) => g.id)).toEqual(['reading', 'sounds', 'feelings', 'numbers', 'talk', 'myday']);
    expect(visibleGroups(child([]))).toHaveLength(0);
    const some = visibleGroups(child(['Spelling', 'AAC Talk Board', 'Social Stories']));
    expect(some.map((g) => g.id)).toEqual(['reading', 'feelings', 'talk']);
    expect(some[0].modules.map((m) => m.no)).toEqual([4]);
    expect(visibleGroups({ isDemo: true })).toHaveLength(6);
  });

  test('only Reading & Writing and Talk are built; the others are Coming soon', () => {
    const built = LEARNING_GROUPS.filter(groupIsBuilt).map((g) => g.id);
    expect(built).toEqual(['reading', 'talk']);
    expect(groupTarget(LEARNING_GROUPS[0])).toBe('/child/english');
    expect(groupTarget(LEARNING_GROUPS[4])).toBe('/child/talk');
    expect(groupTarget(LEARNING_GROUPS[3])).toBe('/child/group/numbers');
  });

  test('the English hub is proposal modules 1-5; Reading Assist is Coming soon', () => {
    expect(ENGLISH_MODULES.map((m) => m.no)).toEqual([1, 2, 3, 4, 5]);
    const assist = ENGLISH_MODULES[1];
    expect(assist.to || assist.activities).toBeFalsy();
    expect(ENGLISH_MODULES[3].activities.map((a) => a.title)).toEqual(['Spelling', 'Bubble Pop', 'Match Pairs', 'Letter stories']);
  });

  test('a chosen diagnosis offers exactly its proposal modules (names the server knows)', () => {
    expect(ALL_DIAGNOSES).toHaveLength(7);
    const adhd = ALL_DIAGNOSES.find((d) => d.name === 'ADHD');
    const offer = activitiesToOffer(ALL_MODULES, adhd.recommend, ['ADHD']);
    expect([...offer].sort()).toEqual([...adhd.modules].sort());
    expect(activitiesToOffer(ALL_MODULES, [], [])).toEqual([]);
  });

  test('areas ticked by hand recommend their activities, saying which area helps', () => {
    const rec = recommendedFor(ALL_MODULES, ['Numbers']);
    expect(rec.map((m) => m.name)).toEqual(['Number Sense']);
    expect(rec[0].because).toEqual(['Numbers']);
  });

  test('the AAC board: 48 core words that never move, 6 quick words, 13 topics, every word has a picture', () => {
    expect(CORE).toHaveLength(48);
    expect(CORE_BIG_PAGES.map((p) => p.length)).toEqual([16, 16, 16]);
    expect(QUICK).toHaveLength(6);
    expect(TOPICS).toHaveLength(13);
    const all = [...QUICK, ...CORE, ...TOPICS.flatMap((t) => t.words)];
    expect(all.filter((w) => !symbolFor(w)).map((w) => w.word)).toEqual([]);
    expect(TOPICS.filter((t) => !symbolFor({ word: t.title, pic: t.icon })).map((t) => t.id)).toEqual([]);
  });

  test('preview guide sentences exist for the child pages a parent explores', () => {
    expect(previewGuideFor('/child')).toMatch(/group/);
    expect(previewGuideFor('/child/talk')).toMatch(/pictures/);
    expect(previewGuideFor('/child/english/read/animals/easy/0/turn')).toMatch(/glowing word/);
    expect(previewGuideFor('/parent')).toBeNull();
  });
});

import { getGreeting } from './utils/misc';
describe('greeting', () => {
  const at = (h) => getGreeting(new Date(2026, 10, 25, h, 30)).text;
  test('says the right part of the day', () => {
    expect(at(6)).toBe('Good morning!');
    expect(at(13)).toBe('Good afternoon!');
    expect(at(18)).toBe('Good evening!');
    expect(at(21)).toBe('Good night!');
    expect(at(2)).toBe('Good night!');
  });
});

import { crumbsFor } from './utils/crumbs';
describe('breadcrumbs', () => {
  const kids = [{ id: '1', name: 'Zara K' }];
  const labels = (p) => crumbsFor(p, kids).map((c) => c.label);
  test('follow the sidebar and name the child', () => {
    expect(labels('/parent')).toEqual(['Dashboard']);
    expect(labels('/parent/children/1/support')).toEqual(['Dashboard', 'My Children', 'Zara K', 'Areas of support']);
    expect(labels('/parent/struggle-words')).toEqual(['Dashboard', 'Plan', 'Struggle words']);
    expect(labels('/parent/account/password')).toEqual(['Dashboard', 'Settings', 'My account', 'Change password']);
  });
  test('only the last step is not a link', () => {
    const trail = crumbsFor('/parent/children/1', kids);
    expect(trail.slice(0, -1).every((c) => c.to)).toBe(true);
    expect(trail[trail.length - 1].to).toBeUndefined();
  });
});

import { passwordStrength } from './utils/validation';
describe('password strength bar', () => {
  test('fills as rules are met and turns green at 5 of 6', () => {
    expect(passwordStrength('').bars).toBe(0);
    expect(passwordStrength('abc').met).toBe(2); // a small letter and no spaces
    expect(passwordStrength('abcdefgh').tone).toBe('mid');
    const strong = passwordStrength('Kid#2026');
    expect(strong.met).toBe(6);
    expect(strong.bars).toBe(4);
    expect(strong.tone).toBe('good');
    expect(passwordStrength('Kid2026ab').tone).toBe('good'); // no symbol: 5 of 6
  });
});
