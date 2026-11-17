// ROOT - registers the videos of this Remotion project.
// LetterStory = one letter's story video; change `letter` to preview another letter in the Studio.

import { Composition } from 'remotion';
import { LetterStory } from './LetterStory';

export const RemotionRoot = () => {
  return (
    <Composition
      id="LetterStory"
      component={LetterStory}
      durationInFrames={210}
      fps={30}
      width={720}
      height={720}
      defaultProps={{ letter: 'A' }}
    />
  );
};
