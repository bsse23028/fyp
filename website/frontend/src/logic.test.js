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
  test('the four app buddies exist; unknown ids fall back to the bunny', () => {
    expect(getAvatar('wolf').id).toBe('wolf');
    expect(getAvatar('dino').id).toBe('rabbit');
    expect(getAvatar('panda').id).toBe('panda');
  });
  test('where a parent starts', () => {
    expect(parentStartPath([{ id: '1' }])).toBe('/parent');
  });
});
