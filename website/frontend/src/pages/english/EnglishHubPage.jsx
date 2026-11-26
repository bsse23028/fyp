// ENGLISH HUB ("Reading & Writing") - the group of Child Home laid out as the FYP proposal's Modules 1-5
// (utils/modules.js ENGLISH_MODULES), the same as the mobile app:
//   1 Read-Along · 2 Reading Assist (Coming soon) · 3 Words & Phonics · 4 Spelling & Letter Sounds · 5 Handwriting
// Only the modules the parent switched on for this child are shown. A module with ONE activity opens it straight away
// (Read Along topics, Trace letters); a module with several opens its activity page (/child/english/activities/:no);
// one that is not built shows "Coming soon" and a tap only says so.

import { useNavigate } from 'react-router-dom';
import { translate } from '../../i18n/translate';
import { playSound, speakUi } from '../../services/audio';
import { useChild } from '../../context/ChildContext';
import { ENGLISH_MODULES, activityOn } from '../../utils/modules';
import { ChildTitle } from '../../layouts/Layouts';
import { Mascot } from '../../components/ui';
import KidTile from '../../components/KidTile';
import NothingOn from '../child/NothingOn';

const GREETING = 'What do you want to learn?';

export default function EnglishHubPage() {
  const navigate = useNavigate();
  const { activeChild } = useChild();
  const shown = ENGLISH_MODULES.filter((module) => activityOn(activeChild, module.no));

  function open(module) {
    if (module.to) {
      playSound('pop');
      navigate(module.to);
    } else if (module.activities) {
      playSound('pop');
      navigate(`activities/${module.no}`);
    } else {
      playSound('boing');
      speakUi('Coming soon!');
    }
  }

  return (
    <>
      <ChildTitle title="Reading & Writing" back="/child" speakText={GREETING} />
      <div className="buddy-ask">
        <Mascot size={84} bob alt="" />
        <div className="buddy-ask-bubble">{translate(GREETING)}</div>
      </div>
      <div className="ktiles">
        {shown.length === 0 && <NothingOn />}
        {[...shown].sort((a, b) => Number(!a.to && !a.activities) - Number(!b.to && !b.activities)).map((module, i) => (
          <KidTile key={module.no} index={i} icon={module.icon} tone={module.tone} title={module.title} subtitle={module.subtitle} soon={!module.to && !module.activities} onClick={() => open(module)} />
        ))}
      </div>
    </>
  );
}
