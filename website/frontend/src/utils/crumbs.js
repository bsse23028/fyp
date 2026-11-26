// CRUMBS - the breadcrumb trail of a Parent Mode page (the top bar), built from the sidebar's own names.

// R14 of the website audit:
// Dashboard › My Children › Zara K › Areas of support. Every step but the last is a link.
// `children` = the parent's child profiles (for the child's name).
const CHILD_SECTIONS = { basics: 'Basics', support: 'Areas of support', modules: 'Activities', stories: 'Personalize stories', setup: 'Set up' };
export function crumbsFor(pathname, children = []) {
  const home = { label: 'Dashboard', to: '/parent' };
  const trail = [home];
  const parts = pathname.replace(/\/+$/, '').split('/').slice(2); // after /parent
  const [first, second, third] = parts;
  if (!first) return [{ label: 'Dashboard' }];
  if (first === 'children') {
    trail.push({ label: 'My Children', to: '/parent/children' });
    if (second === 'new') trail.push({ label: 'Add a child' });
    else if (second) {
      const child = children.find((c) => String(c.id) === String(second));
      const name = child ? child.name : 'Child';
      trail.push({ label: name, to: `/parent/children/${second}`, raw: Boolean(child) });
      if (third) trail.push({ label: CHILD_SECTIONS[third] || 'Edit' });
    }
  } else if (first === 'plan') trail.push({ label: 'Plan', to: '/parent/plan' });
  else if (first === 'struggle-words') trail.push({ label: 'Plan', to: '/parent/plan' }, { label: 'Struggle words' });
  else if (first === 'progress') trail.push({ label: 'Progress' });
  else if (first === 'settings') trail.push({ label: 'Settings' });
  else if (first === 'account') {
    trail.push({ label: 'Settings', to: '/parent/settings' }, { label: 'My account', to: '/parent/account' });
    if (second === 'password') trail.push({ label: 'Change password' });
  } else if (first === 'pin') trail.push({ label: 'Settings', to: '/parent/settings#safety' }, { label: 'Update PIN' });
  else trail.push({ label: 'Settings' });
  // the last step is the page you are on: no link
  const last = trail[trail.length - 1];
  trail[trail.length - 1] = { ...last, to: undefined };
  return trail;
}

