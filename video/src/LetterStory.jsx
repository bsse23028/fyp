// LETTER STORY - a 7-second picture-book video for one letter (props: { letter: 'A' }).
//   1. a sunny sky with drifting clouds; the capital (the app's own letter picture) pops in and the
//      letter's recorded sound plays
//   2. the small letter slides in and the sound plays again
//   3. the letters move up; the two picture words pop in ("Apple", "Ant") with the letter coloured
//   4. confetti and a happy jump
// The letters, pictures and sounds come from the app (see scripts/copyAssets.mjs). Numbers: storyConfig.js.

import { AbsoluteFill, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Audio } from '@remotion/media';
import { loadFont } from '@remotion/google-fonts/Fredoka';
import { getLetter, highlightIndex } from '../../src/modules/english/data/alphabetData';
import manifest from '../../assets/manifest.json';
import { STORY as S } from './storyConfig';

const { fontFamily } = loadFont();
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
const colourOf = (char) => (manifest.letters.find((l) => l.letter === char) || {}).main_colour || '#4FA3A5';

function Sky() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${S.SKY[0]}, ${S.SKY[1]} 60%, ${S.SKY[2]})` }}>
      <div
        style={{
          position: 'absolute',
          left: 560,
          top: 50,
          width: 110,
          height: 110,
          borderRadius: 60,
          backgroundColor: S.SUN,
          boxShadow: '0 0 60px 24px rgba(255, 230, 140, 0.7)',
          scale: interpolate(Math.sin(frame / 18), [-1, 1], [0.96, 1.05]),
        }}
      />
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: 70 + i * 90,
            left: -160 + ((frame * (0.6 + i * 0.3) + i * 380) % 1040),
            width: 170 - i * 40,
            height: 60 - i * 12,
            borderRadius: 60,
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
          }}
        />
      ))}
      <div style={{ position: 'absolute', left: -200, bottom: -260, width: 900, height: 400, borderRadius: 450, backgroundColor: S.HILLS[0] }} />
      <div style={{ position: 'absolute', left: 260, bottom: -300, width: 760, height: 420, borderRadius: 420, backgroundColor: S.HILLS[1] }} />
    </AbsoluteFill>
  );
}

function Letters({ item }) {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 9) * S.BOB;
  const jump = interpolate(frame, [S.PARTY, S.PARTY + 8, S.PARTY + 18], [0, -60, 0], clamp);
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        translate: `0px ${interpolate(frame, [S.MOVE_UP, S.MOVE_UP + 16], [0, -175], { ...clamp, easing: Easing.bezier(0.4, 0, 0.2, 1) }) + jump}px`,
        scale: interpolate(frame, [S.MOVE_UP, S.MOVE_UP + 16], [1, S.MOVE_UP_SCALE], clamp),
      }}
    >
      <Img
        src={staticFile(`letters/upper/${item.letter}.png`)}
        style={{
          width: S.BIG_SIZE,
          height: S.BIG_SIZE,
          marginRight: -90,
          translate: `0px ${bob}px`,
          scale: interpolate(frame, [S.BIG_IN, S.BIG_IN + 22], [0, 1], { ...clamp, easing: Easing.spring({ damping: 9 }) }),
          rotate: `${interpolate(frame, [S.BIG_IN + 14, S.BIG_IN + 20, S.BIG_IN + 26, S.BIG_IN + 32], [0, -6, 5, 0], clamp)}deg`,
        }}
      />
      <Img
        src={staticFile(`letters/lower/${item.lower}.png`)}
        style={{
          width: S.SMALL_SIZE,
          height: S.SMALL_SIZE,
          marginLeft: -90,
          translate: `${interpolate(frame, [S.SMALL_IN, S.SMALL_IN + 20], [520, 0], { ...clamp, easing: Easing.spring({ damping: 11 }) })}px ${-bob}px`,
        }}
      />
    </AbsoluteFill>
  );
}

function Picture({ example, letter, colour, start, left }) {
  const frame = useCurrentFrame();
  const mark = highlightIndex(example, letter);
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top: 360,
        width: 300,
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        scale: interpolate(frame, [start, start + 18], [0, 1], { ...clamp, easing: Easing.spring({ damping: 10 }) }),
        rotate: `${interpolate(frame, [start + 18, start + 24, start + 30, start + 36], [0, 6, -5, 0], clamp)}deg`,
      }}
    >
      <div style={{ fontSize: S.PICTURE_SIZE, lineHeight: 1.1 }}>{example.emoji}</div>
      <div style={{ fontFamily, fontWeight: 700, fontSize: 58, color: '#2E2A26' }}>
        {example.word.split('').map((char, i) => (
          <span key={i} style={{ color: i === mark ? colour : '#2E2A26' }}>
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}

function Confetti() {
  const frame = useCurrentFrame();
  const t = frame - S.PARTY;
  if (t < 0) return null;
  return (
    <AbsoluteFill>
      {Array.from({ length: S.CONFETTI }).map((_, i) => {
        const fromLeft = i % 2 === 0;
        const speed = 22 + random(`speed${i}`) * 14; // launch speed (higher = flies higher)
        const angle = (55 + random(`angle${i}`) * 30) * (Math.PI / 180);
        const x = (fromLeft ? 30 : 690) + (fromLeft ? 1 : -1) * Math.cos(angle) * speed * t;
        const y = 720 - Math.sin(angle) * speed * t + 0.45 * t * t; // 0.45 = gravity
        const size = 12 + random(`size${i}`) * 12;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: i % 3 === 0 ? size : 4,
              backgroundColor: S.CONFETTI_COLORS[i % S.CONFETTI_COLORS.length],
              rotate: `${t * (random(`spin${i}`) * 16 - 8)}deg`,
              opacity: interpolate(t, [0, 22, 34], [1, 1, 0], clamp),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

export const LetterStory = ({ letter }) => {
  const item = getLetter(String(letter || 'A').toUpperCase());
  const sound = staticFile(`audio/${item.lower}.mp3`);
  const colour = colourOf(item.letter);

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Sky />
      <Letters item={item} />
      <Sequence name="Picture 1" from={S.PICTURE_1_IN} layout="none">
        <Picture example={item.examples[0]} letter={item.letter} colour={colour} start={0} left={40} />
      </Sequence>
      <Sequence name="Picture 2" from={S.PICTURE_2_IN} layout="none">
        <Picture example={item.examples[1] || item.examples[0]} letter={item.letter} colour={colour} start={0} left={380} />
      </Sequence>
      <Confetti />

      <Audio name="Pop" src={staticFile('sounds/pop.wav')} from={S.BIG_IN} volume={S.EFFECT_VOLUME} />
      <Audio name="Letter sound 1" src={sound} from={S.SOUND_BIG} volume={S.SOUND_VOLUME} />
      <Audio name="Whistle" src={staticFile('sounds/whistle-up.wav')} from={S.SMALL_IN - 4} volume={S.EFFECT_VOLUME} />
      <Audio name="Letter sound 2" src={sound} from={S.SOUND_SMALL} volume={S.SOUND_VOLUME} />
      <Audio name="Twinkle" src={staticFile('sounds/twinkle.wav')} from={S.PICTURE_1_IN} volume={S.EFFECT_VOLUME} />
      <Audio name="Letter sound 3" src={sound} from={S.SOUND_PICTURE_1} volume={S.SOUND_VOLUME} />
      <Audio name="Pop 2" src={staticFile('sounds/pop.wav')} from={S.PICTURE_2_IN} volume={S.EFFECT_VOLUME} />
      <Audio name="Letter sound 4" src={sound} from={S.SOUND_PICTURE_2} volume={S.SOUND_VOLUME} />
      <Audio name="Party" src={staticFile('sounds/xylophone.wav')} from={S.PARTY} volume={S.EFFECT_VOLUME} />
    </AbsoluteFill>
  );
};
