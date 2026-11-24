// ENGLISH ACTIVITIES - the activities of ONE proposal module of the English hub (utils/modules.js), the same as the app:
//   Module 3 Words & Phonics          -> Alphabets · Phonics (Coming soon)
//   Module 4 Spelling & Letter Sounds -> Spelling · Bubble Pop · Match Pairs · Letter stories
// An activity that is not built yet shows "Coming soon" and a tap only says so. Route: /child/english/activities/:moduleNo

import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { translate } from '../../i18n/translate';
import { playSound, speakUi } from '../../services/audio';
import { getEnglishModule } from '../../utils/modules';
import { ChildTitle } from '../../layouts/Layouts';
import { Mascot } from '../../components/ui';
import KidTile from '../../components/KidTile';

const GREETING = 'Pick one!';

export default function EnglishActivitiesPage() {
  const { moduleNo } = useParams();
  const navigate = useNavigate();
  const module = getEnglishModule(moduleNo);
  if (!module || !module.activities) return <Navigate to="/child/english" replace />;

  function open(activity) {
    if (activity.to) {
      playSound('pop');
      navigate(activity.to);
    } else {
      playSound('boing');
      speakUi('Coming soon!');
    }
  }

  return (
    <>
      <ChildTitle title={module.title} back="/child/english" speakText={GREETING} />
      <div className="buddy-ask">
        <Mascot size={84} bob alt="" />
        <div className="buddy-ask-bubble">{translate(GREETING)}</div>
      </div>
      <div className="ktiles">
        {module.activities.map((activity, i) => (
          <KidTile key={activity.title} index={i} icon={activity.icon} tone={activity.tone} title={activity.title} subtitle={activity.subtitle} soon={!activity.to} onClick={() => open(activity)} />
        ))}
      </div>
    </>
  );
}
