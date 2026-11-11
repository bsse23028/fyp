// READING VALIDATION - a custom (personalised) topic made for one child.
//
// Same shape as a topic in the app's readingTopics.json:
//   {
//     title: 'Zara at the park', icon: '🌳', tint: 'sagePale',
//     levels: {
//       easy: [ { words: ['Zara','runs.'], focus: 0, ur: { words: ['زارا','دوڑتی','ہے۔'], focus: 0 } } ],
//       medium: [...], hard: [...]          (any of the three, at least one)
//     }
//   }
// focus = position of the glowing word, 0 = first word (or null for none).

const { isText, isOptionalText, isWholeNumber, isPlainObject } = require('./rules');
const { onlyProblems } = require('./authValidation');

const LEVELS = ['easy', 'medium', 'hard'];
const MAX_SENTENCES = 20;
const MAX_WORDS = 40;

function sentencePartProblem(part, where) {
  if (!isPlainObject(part)) return `${where} must be an object with words and focus.`;
  if (!Array.isArray(part.words) || part.words.length === 0 || part.words.length > MAX_WORDS) {
    return `${where}.words must be a list of 1 to ${MAX_WORDS} words.`;
  }
  if (!part.words.every((word) => isText(word, 80) && !/\s/.test(word.trim()))) {
    return `${where}.words must be single words (no spaces, 80 characters at most).`;
  }
  if (part.focus !== undefined && part.focus !== null && !isWholeNumber(part.focus, 0, part.words.length - 1)) {
    return `${where}.focus must be the position of one of its words (0 = first word).`;
  }
  return '';
}

function checkCustomTopic(body) {
  const problems = [
    isText(body.title, 80) ? '' : 'Enter a title for the topic (80 characters at most).',
    isOptionalText(body.icon, 16) ? '' : 'icon is too long.',
    isOptionalText(body.tint, 20) ? '' : 'tint is too long.',
  ];

  if (!isPlainObject(body.levels)) {
    problems.push('levels must be an object like { "easy": [ ...sentences ] }.');
    return onlyProblems(problems);
  }
  const levelNames = Object.keys(body.levels);
  if (levelNames.length === 0) problems.push('Add sentences for at least one level.');
  levelNames.forEach((level) => {
    if (!LEVELS.includes(level)) {
      problems.push(`"${level}" is not a level. Use easy, medium or hard.`);
      return;
    }
    const sentences = body.levels[level];
    if (!Array.isArray(sentences) || sentences.length === 0 || sentences.length > MAX_SENTENCES) {
      problems.push(`levels.${level} must be a list of 1 to ${MAX_SENTENCES} sentences.`);
      return;
    }
    sentences.forEach((sentence, i) => {
      const where = `levels.${level}[${i}]`;
      problems.push(sentencePartProblem(sentence, where));
      // The app shows every sentence in Urdu too, so the Urdu version is required.
      problems.push(sentencePartProblem(isPlainObject(sentence) ? sentence.ur : undefined, `${where}.ur`));
    });
  });
  return onlyProblems(problems);
}

module.exports = { checkCustomTopic };
