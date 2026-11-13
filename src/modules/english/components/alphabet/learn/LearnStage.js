// LEARN STAGE - stage 1 of a letter: Look -> Listen -> Say, cross-fading in place (no sliding).
// The lesson screen owns which mini-step is shown and when Next unlocks.

import React from 'react';
import CrossFade from '../../../../../shared/components/CrossFade';
import LookStep from './LookStep';
import ListenStep from './ListenStep';
import SayStep from './SayStep';

export const LEARN_STEPS = ['look', 'listen', 'say'];

export const LEARN_INSTRUCTIONS = {
  look: (item) => `This is the letter ${item.letter}.`,
  listen: () => 'Tap each picture.',
  say: () => 'Your turn! Say it with me.',
};

export default function LearnStage({ step, item, voice, cardSize, contentWidth, onReady, onHappy, onSaid }) {
  const name = LEARN_STEPS[step];

  return (
    <CrossFade stepKey={name}>
      {name === 'look' && <LookStep item={item} voice={voice} cardSize={cardSize} onReady={onReady} />}
      {name === 'listen' && (
        <ListenStep item={item} voice={voice} contentWidth={contentWidth} onReady={onReady} onHappy={onHappy} />
      )}
      {name === 'say' && <SayStep item={item} voice={voice} cardSize={cardSize} onDone={onSaid} />}
    </CrossFade>
  );
}
