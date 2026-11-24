// CHILD SETUP - right after "Create profile": "{name}'s profile is ready!" and three OPTIONAL extras (the same as the app's
// ChildSetup screen):
//   1. Areas of support      -> the profile's Areas of support page (with the diagnosis guide)
//   2. Activities            -> the profile's Activities page (recommended from the areas first)
//   3. Personalize stories   -> Personalize stories (helps customise the child's stories and activities)
// Every card says "Optional" until something is added, then "Added". Each page saves and comes back here.
// "Skip for now" (nothing added) / "Finish" opens the Dashboard. Everything can be done later in the profile.
// Route: /parent/children/:childId/setup

import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import { useLanguage } from '../../context/LanguageContext';
import { translate } from '../../i18n/translate';
import { countStoryDetails } from '../../data/storyOptions';
import { getAvatar } from '../../data/avatars';
import { Page, useLogoAvatar } from '../../layouts/Layouts';
import { Badge, Button, Mascot, PageHeader } from '../../components/ui';
import { Row } from '../../components/rows';
import Icon from '../../components/Icon';

export default function ChildSetupPage() {
  const { childId } = useParams();
  const { childProfiles } = useChild();
  const navigate = useNavigate();
  useLanguage();
  const child = childProfiles.find((c) => c.id === childId) || null;
  useLogoAvatar(child ? child.avatar : null);
  if (!child) return <Navigate to="/parent" replace />;

  const base = `/parent/children/${child.id}`;
  const here = { state: { back: `${base}/setup` } }; // the pages below come back to this page after saving
  const supports = child.supports || [];
  const modules = child.modules || [];
  const storyCount = countStoryDetails(child);

  const extras = [
    {
      key: 'support',
      icon: 'puzzle-outline',
      tone: 'leaf',
      title: 'Areas of support',
      text: supports.length > 0 ? supports.map((s) => translate(s)).join(', ') : translate('Where your child needs help. We use it to recommend activities.'),
      done: supports.length > 0,
      to: `${base}/support`,
    },
    {
      key: 'modules',
      icon: 'target',
      tone: 'sun',
      title: 'Activities',
      text: modules.length > 0 ? translate('{n} switched on. Choose which ones your child can use.', { n: modules.length }) : translate('All are off for now. Switch on the ones your child can use.'),
      done: modules.length > 0, // a new child starts with every activity off
      to: `${base}/modules`,
    },
    {
      key: 'stories',
      icon: 'creation',
      tone: 'berry',
      title: 'Personalize stories',
      text: storyCount > 0 ? translate('{n} details added', { n: storyCount }) : translate('Familiar people, favourite things and places. This helps customise your child’s stories and activities.'),
      done: storyCount > 0,
      to: `${base}/stories`,
    },
  ];
  const anyDone = extras.some((e) => e.done);

  return (
    <Page narrow>
      <PageHeader title={translate('{name}’s profile is ready!', { name: child.name })} subtitle="Want to set up a little more? Everything here is optional." />
      <div className="setup-ready">
        <span className="profile-art" style={{ background: getAvatar(child.avatar).color }}>
          <Mascot avatar={child.avatar} size={64} bob alt="" />
        </span>
        <div className="callout">
          <Icon name="information-outline" size={20} />
          <p className="small">{translate('You can skip this and set it up later: Dashboard, open the child’s ⋯ menu, then Edit profile.')}</p>
        </div>
      </div>
      <section className="panel list">
        {extras.map((extra) => (
          <Row
            key={extra.key}
            icon={extra.icon}
            tone={extra.tone}
            title={extra.title}
            copy={extra.text}
            end={<Badge tone={extra.done ? 'leaf' : 'neutral'}>{translate(extra.done ? 'Added' : 'Optional')}</Badge>}
            onClick={() => navigate(extra.to, here)}
          />
        ))}
      </section>
      <div className="form-actions">
        <Button size="lg" onClick={() => navigate('/parent', { replace: true })}>{anyDone ? 'Finish' : 'Skip for now'}</Button>
      </div>
    </Page>
  );
}
