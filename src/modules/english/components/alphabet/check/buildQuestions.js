// BUILD QUESTIONS - the 5 Star Check questions for one letter, each with 3 shuffled options:
//   1 hear       the voice says the letter, tap it
//   2 picture    a letter is shown, tap the picture that starts with it
//   3 letterFor  a picture is shown, tap the letter it starts with
//   4 small      a capital is shown, tap its small letter
//   5 which      "Which one is A?" with look-alike letters
// X uses words that END with x, so its prompts say "has" / "at the end of" instead of "starts with".
// Options only keep the letter (`item`) and a `role`: 'same' = drawn in the chosen case, 'opposite' = the other
// case. `prompt(caseMode)` builds the text, so switching the case never rebuilds or reshuffles the questions.

import { ALPHABET, LOOKALIKES, otherLetters, pickLetters, shuffle, soundAlikes } from '../../../data/alphabetData';

const letterOption = (item, correct, role = 'same') => ({ key: item.letter, kind: 'letter', item, role, correct });
const pictureOption = (example, correct) => ({ key: example.word, kind: 'picture', example, correct });

function makePrompt(text, params) {
  let shown = text;
  Object.keys(params).forEach((name) => {
    shown = shown.replace(`{${name}}`, params[name]);
  });
  return { text, params, shown };
}

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
    {
      id: 'hear',
      prompt: () => makePrompt('Which letter did you hear?', {}),
      say: item.nameSpeech,
      options: shuffle([letterOption(item, true), ...heard.map((o) => letterOption(o, false))]),
    },
    {
      id: 'picture',
      prompt: (caseMode) =>
        makePrompt(atEnd ? 'Which picture has {letter}?' : 'Which picture starts with {letter}?', {
          letter: caseMode === 'lower' ? lower : letter,
        }),
      showLetter: 'same',
      options: shuffle([pictureOption(picture, true), ...pictureOthers.map((ex) => pictureOption(ex, false))]),
    },
    {
      id: 'letterFor',
      prompt: () => makePrompt(atEnd ? 'Which letter is at the end of {word}?' : 'Which letter does {word} start with?', { word }),
      showPicture: picture,
      options: shuffle([letterOption(item, true), ...notInWord.map((o) => letterOption(o, false))]),
    },
    {
      id: 'small',
      prompt: (caseMode) =>
        caseMode === 'lower'
          ? makePrompt('Tap the big letter for {letter}.', { letter: lower })
          : makePrompt('Tap the small letter for {letter}.', { letter }),
      showLetter: 'same',
      options: shuffle([letterOption(item, true, 'opposite'), ...smallOthers.map((o) => letterOption(o, false, 'opposite'))]),
    },
    {
      id: 'which',
      prompt: (caseMode) => makePrompt('Which one is {letter}?', { letter: caseMode === 'lower' ? lower : letter }),
      options: shuffle([letterOption(item, true), ...which.map((o) => letterOption(o, false))]),
    },
  ];
}

// First-try correct answers -> stars. Everyone gets at least 1 star.
export function starsFor(firstTryCorrect) {
  if (firstTryCorrect >= 4) return 3;
  if (firstTryCorrect >= 2) return 2;
  return 1;
}
