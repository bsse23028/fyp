// ENTRY ART - the soft illustrations of the entry flow, drawn in CSS as in the Figma, with the real
// KidBuddy bunny instead of a drawn one.
//   scene 0  parent and child on the sofa with a tablet (Welcome)
//   scene 1  the therapist's plan: a checked paper and a target (Onboarding 1)
//   scene 2  activities circling the buddy (Onboarding 2)
//   scene 3  a shield with sparkles: a safe space (Onboarding 3)
//   scene 4  a tablet and the puppy: "Try KidBuddy first" (Onboarding 4)

import { Mascot } from './ui';
import Icon from './Icon';

export default function EntryArt({ scene = 0 }) {
  return (
    <div className={`entry-art scene-${scene}`} aria-hidden="true">
      <i className="ea-shape one" />
      <i className="ea-shape two" />
      <i className="ea-shape three" />
      {scene === 0 && (
        <div className="ea-scene">
          <div className="ea-sofa">
            <span className="ea-sofa-back" />
            <span className="ea-sofa-seat" />
            <i />
            <i />
          </div>
          <div className="ea-person parent">
            <span className="ea-head" />
            <span className="ea-body" />
          </div>
          <div className="ea-person child">
            <span className="ea-head" />
            <span className="ea-body" />
          </div>
          <div className="ea-tablet">
            <Icon name="creation" size={18} />
          </div>
        </div>
      )}
      {scene === 1 && (
        <div className="ea-scene">
          <div className="ea-paper">
            <span />
            <span />
            <span />
            <Icon name="check-circle-outline" size={34} />
          </div>
          <div className="ea-target">
            <i />
            <i />
            <i />
          </div>
        </div>
      )}
      {scene === 2 && (
        <div className="ea-scene">
          <div className="ea-orbit">
            <span><Icon name="book-open-variant" size={34} /></span>
            <span><Icon name="chat-outline" size={34} /></span>
            <span><Icon name="heart-outline" size={34} /></span>
            <span><Icon name="numeric" size={34} /></span>
            <span><Icon name="format-list-checks" size={34} /></span>
          </div>
        </div>
      )}
      {scene === 3 && (
        <div className="ea-scene">
          <div className="ea-shield">
            <Icon name="shield-check-outline" size={96} />
          </div>
          <div className="ea-stars">
            <Icon name="creation" size={28} />
            <Icon name="creation" size={22} />
            <Icon name="creation" size={18} />
          </div>
        </div>
      )}
      {scene === 4 && (
        <div className="ea-scene">
          <div className="ea-device">
            <div className="ea-device-screen">
              <Icon name="gesture-tap" size={64} />
            </div>
          </div>
          <div className="ea-stars">
            <Icon name="creation" size={28} />
            <Icon name="creation" size={22} />
            <Icon name="creation" size={18} />
          </div>
        </div>
      )}
      <div className={`ea-buddy s${scene}`}>
        <Mascot avatar={scene === 4 ? 'puppy' : 'rabbit'} size={scene === 0 ? 150 : 130} bob alt="" />
      </div>
    </div>
  );
}
