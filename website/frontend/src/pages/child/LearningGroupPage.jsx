// LEARNING GROUP - one Child Home group (Speech Sounds, Feelings & Stories, Numbers, My Day ...): its modules from the FYP
// proposal as big tiles, only the ones the parent switched on for this child. A module that is built opens its page;
// one that is not built yet shows "Coming soon" and a tap only says so (no pop-up). Groups + modules: utils/modules.js.

import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import { useLanguage } from '../../context/LanguageContext';
import { translate } from '../../i18n/translate';
import { activityOn, getGroup, moduleScreen } from '../../utils/modules';
import { playSound, speakUi } from '../../services/audio';
import { ChildTitle } from '../../layouts/Layouts';
import KidTile from '../../components/KidTile';
import NothingOn from './NothingOn';

export default function LearningGroupPage() {
  const { groupId } = useParams();
  const { activeChild } = useChild();
  const navigate = useNavigate();
  useLanguage();
  const group = getGroup(groupId);
  if (!group) return <Navigate to="/child" replace />;
  const items = group.modules.filter((item) => activityOn(activeChild, item.no));
  if (items.length === 0) return <Navigate to="/child" replace />;

  function open(item) {
    const page = moduleScreen(item);
    if (page) {
      playSound('pop');
      navigate(page);
    } else {
      playSound('boing');
      speakUi('Coming soon!');
    }
  }

  return (
    <main className="screen child" id="main">
      <div className="screen-inner">
        <ChildTitle title={translate('What shall we try?')} back="/child" speakText="What shall we try?" eyebrow={group.label} />
        <div className="ktiles">
          {items.length === 0 && <NothingOn />}
          {items.map((item, i) => (
            <KidTile key={item.no} index={i} icon={item.icon} tone={group.tone} title={item.title} subtitle={item.subtitle} soon={!moduleScreen(item)} onClick={() => open(item)} />
          ))}
        </div>
      </div>
    </main>
  );
}
