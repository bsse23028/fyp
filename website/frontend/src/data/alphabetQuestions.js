// ALPHABET QUESTIONS - the 5 Star Check questions for one letter (the app's buildQuestions.js):
//   hear       the voice says the letter, tap it
//   picture    a letter is shown, tap the picture that starts with it
//   letterFor  a picture is shown, tap the letter it starts with
//   small      a capital is shown, tap its small letter (or the other way round in small-letter mode)
//   which      "Which one is A?" with look-alike letters
// Stars from first-try answers: 4-5 -> 3, 2-3 -> 2, 0-1 -> 1.

import { ALPHABET, LOOKALIKES, otherLetters, pickLetters, shuffle, soundAlikes } from './alphabetData';

const letterOption = (item, correct, role = 'same') => ({ key: item.letter, kind: 'letter', item, role, correct });
const pictureOption = (example, correct) => ({ key: example.word, kind: 'picture', example, correct });

export default function buildQuestions(item) {
  const { letter, lower } = item;
  const atEnd = item.examples.some((ex) => ex.endsWith);
  const picture = item.examples[1] || item.examples[0];
  const word = picture.word.toLowerCase();

  const heard = pickLetters(letter, 2, soundAlikes(letter));
  const pictureOthers = otherLetters(letter, 2).map((other) => other.examples[0]);
  const notInWord = pickLetters(letter, 2, picture.word.toUpperCase().split(''));
  const smallOthers = pickLetters(letter, 2);
  const lookalikes = (LOOKALIKES[letter] || []).map((c) => ALPHABET.find((a) => a.letter === c)).filter(Boolean);
  const which = lookalikes.length >= 2 ? lookalikes.slice(0, 2) : pickLetters(letter, 2);

  return [
    { id: 'hear', prompt: () => ['Which letter did you hear?', {}], say: item.nameSpeech, options: shuffle([letterOption(item, true), ...heard.map((o) => letterOption(o, false))]) },
    {
      id: 'picture',
      prompt: (caseMode) => [atEnd ? 'Which picture has {letter}?' : 'Which picture starts with {letter}?', { letter: caseMode === 'lower' ? lower : letter }],
      showLetter: true,
      options: shuffle([pictureOption(picture, true), ...pictureOthers.map((ex) => pictureOption(ex, false))]),
    },
    {
      id: 'letterFor',
      prompt: () => [atEnd ? 'Which letter is at the end of {word}?' : 'Which letter does {word} start with?', { word }],
      showPicture: picture,
      options: shuffle([letterOption(item, true), ...notInWord.map((o) => letterOption(o, false))]),
    },
    {
      id: 'small',
      prompt: (caseMode) => (caseMode === 'lower' ? ['Tap the big letter for {letter}.', { letter: lower }] : ['Tap the small letter for {letter}.', { letter }]),
      showLetter: true,
      options: shuffle([letterOption(item, true, 'opposite'), ...smallOthers.map((o) => letterOption(o, false, 'opposite'))]),
    },
    {
      id: 'which',
      prompt: (caseMode) => ['Which one is {letter}?', { letter: caseMode === 'lower' ? lower : letter }],
      options: shuffle([letterOption(item, true), ...which.map((o) => letterOption(o, false))]),
    },
  ];
}

export function starsFor(firstTryCorrect) {
  if (firstTryCorrect >= 4) return 3;
  if (firstTryCorrect >= 2) return 2;
  return 1;
}
