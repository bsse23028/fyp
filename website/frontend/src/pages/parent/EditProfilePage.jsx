// EDIT PROFILE (Overview) - one child's profile at a glance: a card per section (Basics, Areas of support,
// Activities, Personalize stories) with its summary and Edit, and the "Delete profile" danger zone.

import { useNavigate, useParams } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import { useUI } from '../../context/UIContext';
import { translate } from '../../i18n/translate';
import { countStoryDetails } from '../../data/storyOptions';
import { getAvatar } from '../../data/avatars';
import { ageText } from '../../utils/progress';
import { Page, useLogoAvatar } from '../../layouts/Layouts';
import { Badge, Button, EmptyState } from '../../components/ui';
import Icon from '../../components/Icon';
import ProfileTabs from './ProfileTabs';

export default function EditProfilePage() {
  const { childId } = useParams();
  const { childProfiles, deleteChild } = useChild();
  const { confirm } = useUI();
  const navigate = useNavigate();
  const child = childProfiles.find((c) => c.id === childId) || null;
  useLogoAvatar(child ? child.avatar : null);

  if (!child) {
    return (
      <Page>
        <div className="panel"><EmptyState title="Profile not found" text="This child profile does not exist any more." action={<Button to="/parent/children">Go back</Button>} /></div>
      </Page>
    );
  }

  const storyCount = countStoryDetails(child);
  const supports = child.supports || [];
  const modules = child.modules || [];
  const base = `/parent/children/${child.id}`;
  const cards = [
    { key: 'basics', icon: 'account-outline', title: 'Basics', body: <p>{child.name} · {translate(ageText(child))} · {child.language === 'ur' ? 'اردو' : 'English'} · {translate(getAvatar(child.avatar).name)}</p> },
    {
      key: 'support',
      icon: 'puzzle-outline',
      title: 'Areas of support',
      body: supports.length > 0 ? <div className="badge-row">{supports.map((s) => <Badge key={s} tone="neutral">{translate(s)}</Badge>)}</div> : <p className="muted">{translate('None chosen (optional)')}</p>,
    },
    {
      key: 'modules',
      icon: 'toy-brick-outline',
      title: 'Activities',
      body: modules.length > 0 ? <div className="badge-row">{modules.map((m) => <Badge key={m} tone="leaf">{translate(m)}</Badge>)}</div> : <p className="muted">{translate('{n} switched on', { n: 0 })}</p>,
    },
    { key: 'stories', icon: 'book-open-page-variant-outline', title: 'Personalize stories', body: <p className={storyCount ? '' : 'muted'}>{storyCount > 0 ? translate('{n} details added', { n: storyCount }) : translate('Nothing added yet (optional)')}</p> },
  ];

  async function handleDelete() {
    const yes = await confirm({
      title: translate('Delete {name}?', { name: child.name }),
      message: 'This deletes the profile and all of its progress from your account. It cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (yes && (await deleteChild(child.id))) navigate('/parent/children', { replace: true });
  }

  return (
    <Page>
      <ProfileTabs child={child} />
      <div className="section-cards">
        {cards.map((card) => (
          <section key={card.key} className="panel section-card">
            <div className="panel-head">
              <h2><Icon name={card.icon} size={20} /> {translate(card.title)}</h2>
              <Button size="sm" variant="ghost" icon="pencil-outline" to={`${base}/${card.key}`}>Edit</Button>
            </div>
            <div className="panel-body small">{card.body}</div>
          </section>
        ))}
      </div>
      <section className="danger-zone">
        <div>
          <h2>{translate('Delete profile')}</h2>
          <p className="small muted">{translate('This deletes the profile and all of its progress from your account. It cannot be undone.')}</p>
        </div>
        <Button variant="danger" icon="trash-can-outline" onClick={handleDelete}>Delete profile</Button>
      </section>
    </Page>
  );
}
