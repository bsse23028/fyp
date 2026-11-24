// START - where a logged-in parent begins (the app's getParentStartScreen):
//   has a child profile            -> Parent Home (always Parent Mode first)
//   no child, permissions asked    -> Create child profile
//   no child, permissions not yet  -> Permissions (asked once per browser)

import { KEYS, loadData } from './misc';

export function permissionsAsked() {
  return Boolean(loadData(KEYS.permissions, null));
}

export function parentStartPath(children) {
  if (children && children.length > 0) return '/parent';
  return permissionsAsked() ? '/children/new' : '/permissions';
}
