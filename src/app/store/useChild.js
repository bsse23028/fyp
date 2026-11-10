// USE CHILD - the hook every screen uses to read and change the child profiles.
//
//   const { childProfiles, activeChild, addChild, updateChild, deleteChild } = useChild();
//
// The data lives in Redux (childSlice.js). This hook only reads it with useSelector and
// hands out functions that dispatch the right actions, so a screen never has to know
// about Redux. It also passes the parent's email (from AuthContext) so the children are
// saved under the right account.

import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_AVATAR } from '../../shared/theme/avatars';
import {
  addChild,
  addReadingResult,
  childModeExited,
  deleteChild,
  enterChildMode,
  loadChildren,
  updateChild,
} from './childSlice';

export function useChild() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const email = user ? user.email : null;
  const { list, activeId, childMode, loading } = useSelector((state) => state.child);

  const activeChild = list.find((c) => c.id === activeId) || null;
  // The avatar the header logo and mascots show: the child's own in Child Mode, the rabbit everywhere else.
  const displayAvatar = childMode && activeChild ? activeChild.avatar : DEFAULT_AVATAR;

  return {
    childProfiles: list,
    activeChild,
    childMode,
    displayAvatar,
    loading,
    loadChildren: (parentEmail) => dispatch(loadChildren(parentEmail)),
    addChild: (profile) => dispatch(addChild(email, profile)),
    updateChild: (id, changes) => dispatch(updateChild(email, id, changes)),
    deleteChild: (id) => dispatch(deleteChild(email, id)),
    enterChildMode: (id) => dispatch(enterChildMode(email, id)),
    exitChildMode: () => dispatch(childModeExited()),
    addReadingResult: (stars) => dispatch(addReadingResult(email, stars)),
  };
}
