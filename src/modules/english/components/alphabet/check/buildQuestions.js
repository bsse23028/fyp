// BUILD QUESTIONS - the 5 Star Check questions for one letter, each with 3 shuffled options:
//   1 hear       the voice says the letter, tap it
//   2 picture    a letter is shown, tap the picture that starts with it
//   3 letterFor  a picture is shown, tap the letter it starts with
//   4 small      a capital is shown, tap its small letter
//   5 which      "Which one is A?" with look-alike letters
// X uses words that END with x, so its prompts say "has" / "at the end of" instead of "starts with".

import { ALPHABET, LOOKALIKES, otherLetters, pickLetters, shuffle, soundAlikes } from '../../../data/alphabetData';

const letterOption = (item, char, correct) => ({ key: `${item.letter}-${char}`, kind: 'letter', char, item, correct });
const pictureOption = (example, correct) => ({ key: example.word, kind: 'picture', example, correct });

function prompt(text, params) {
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
      prompt: prompt('Which letter did you hear?', {}),
      say: item.nameSpeech,
      options: shuffle([letterOption(item, letter, true), ...heard.map((o) => letterOption(o, o.letter, false))]),
    },
    {
      id: 'picture',
      prompt: prompt(atEnd ? 'Which picture has {letter}?' : 'Which picture starts with {letter}?', { letter }),
      showLetter: `${letter}${lower}`,
      options: shuffle([pictureOption(picture, true), ...pictureOthers.map((ex) => pictureOption(ex, false))]),
    },
    {
      id: 'letterFor',
      prompt: prompt(atEnd ? 'Which letter is at the end of {word}?' : 'Which letter does {word} start with?', { word }),
      showPicture: picture,
      options: shuffle([letterOption(item, letter, true), ...notInWord.map((o) => letterOption(o, o.letter, false))]),
    },
    {
      id: 'small',
      prompt: prompt('Tap the small letter for {letter}.', { letter }),
      showLetter: letter,
      options: shuffle([letterOption(item, lower, true), ...smallOthers.map((o) => letterOption(o, o.lower, false))]),
    },
    {
      id: 'which',
      prompt: prompt('Which one is {letter}?', { letter }),
      options: shuffle([letterOption(item, letter, true), ...which.map((o) => letterOption(o, o.letter, false))]),
    },
  ];
}

// First-try correct answers -> stars. Everyone gets at least 1 star.
export function starsFor(firstTryCorrect) {
  if (firstTryCorrect >= 4) return 3;
  if (firstTryCorrect >= 2) return 2;
  return 1;
}
