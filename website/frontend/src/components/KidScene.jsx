// KID SCENE - the soft animated sky behind the English pages (the app's KidScene + kidSceneConfig):
//   day      blue sky, breathing sun, slow clouds, green hills (hubs, topic + level pages)
//   lesson   calmer: paler sky, no sun, low hills (lessons, reading)
//   spelling a calm evening (the spelling game)
//   sunset   peach sky, sun, lavender hills (the spelling word list)
// Colours are copied from the app's kidSceneConfig.js.

const SCENES = {
  day: { sky: ['#BFE6FB', '#E3F4FC', '#F6FBF2'], sun: { x: '82%', y: '8%', size: 74, color: '#FFD86B', glow: '#FFEFB0' }, hills: [['#BFE3A8', 22], ['#A7D88F', 17]] },
  lesson: { sky: ['#D3ECFA', '#EAF6FC', '#F8FBF4'], sun: null, hills: [['#D6EDC6', 12], ['#C6E6B2', 9]] },
  spelling: { sky: ['#FFE3D1', '#FDF0E6', '#FAF5EE'], sun: null, hills: [['#E4D9F2', 10], ['#D6C8EC', 7]] },
  sunset: { sky: ['#FFD9C2', '#FDEBDD', '#FAF3EC'], sun: { x: '18%', y: '10%', size: 64, color: '#FFC48A', glow: '#FFE2C4' }, hills: [['#D9CCEF', 20], ['#C6B6E6', 15]] },
};

export default function KidScene({ scene = 'day' }) {
  const s = SCENES[scene] || SCENES.day;
  return (
    <div className="kid-scene" aria-hidden="true" style={{ background: `linear-gradient(180deg, ${s.sky[0]}, ${s.sky[1]} 55%, ${s.sky[2]})` }}>
      {s.sun && (
        <span
          className="kid-sun"
          style={{ left: s.sun.x, top: s.sun.y, width: s.sun.size, height: s.sun.size, background: s.sun.color, boxShadow: `0 0 0 14px ${s.sun.glow}88, 0 0 40px ${s.sun.glow}` }}
        />
      )}
      <span className="kid-cloud c1" />
      <span className="kid-cloud c2" />
      <span className="kid-cloud c3" />
      <span className="kid-hill back" style={{ background: s.hills[0][0], height: `${s.hills[0][1]}vh` }} />
      <span className="kid-hill front" style={{ background: s.hills[1][0], height: `${s.hills[1][1]}vh` }} />
    </div>
  );
}
