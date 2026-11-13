// USE CHILD - the hook every screen uses to read and change the child profiles.
//
//   const { childProfiles, activeChild, addChild, updateChild, deleteChild } = useChild();
//
// The data lives in Redux (childSlice.js) and comes from the backend. This hook only reads
// it with useSelector and hands out functions that dispatch the right thunks, so a screen
// never has to know about Redux or the server.
//
// addChild, updateChild, deleteChild, enterChildMode and addReadingResult ask the server, so they take a
// moment. They return a PROMISE:
//   - it worked  -> the promise gives the result (the child, or true)
//   - it failed  -> a pop-up explains why (with "Retry" when the server could not be
//                   reached), and the promise gives  null
// So a screen only has to write:
//   if (await addChild(profile)) goToParentHome(navigation);

import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { translate } from '../../shared/i18n/translate';
import { DEFAULT_AVATAR } from '../../shared/theme/avatars';
import { DEMO_CHILD } from '../../shared/utils/demoChild';
import { selectPreviewActive } from './previewSlice';
import {
  childModeExited,
  createChild,
  loadChildren,
  loadOptions,
  removeChild,
  saveChildChanges,
  saveReadingSession,
  selectChild,
} from './childSlice';

// Runs a thunk; on failure shows a pop-up. `makeThunk` is a function so "Retry" can run it again.
function runWithPopup(dispatch, makeThunk, title) {
  return new Promise((resolve) => {
    function attempt() {
      dispatch(makeThunk())
        .unwrap()
        .then((result) => resolve(result || true))
        .catch((error) => {
          // 401: the API client already logged the parent out and showed "Please log in again".
          if (error.status === 401) return resolve(null);

          // No connection (status 0) or a server problem (500...): trying again can help.
          const canRetry = !error.status || error.status >= 500;
          const buttons = canRetry
            ? [
                { text: translate('Cancel'), style: 'cancel', onPress: () => resolve(null) },
                { text: translate('Retry'), onPress: attempt },
              ]
            : [{ text: translate('OK'), onPress: () => resolve(null) }];
          Alert.alert(translate(title), translate(error.message), buttons, { cancelable: false });
        });
    }
    attempt();
  });
}

export function useChild() {
  const dispatch = useDispatch();
  const { list, activeId, childMode, loading, error, optionsStatus, optionsError } = useSelector(
    (state) => state.child
  );

  // PREVIEW MODE (Explore KidBuddy): the demo child is the active child, and every function that
  // would save something does nothing and reports success. The real list is never touched.
  const isPreview = useSelector(selectPreviewActive);
  const previewSafe = (work) => (...args) => (isPreview ? Promise.resolve(true) : work(...args));

  const activeChild = isPreview ? DEMO_CHILD : list.find((c) => c.id === activeId) || null;
  const inChildMode = childMode || isPreview;
  // The avatar the header logo and mascots show: the child's own in Child Mode, the rabbit everywhere else.
  const displayAvatar = inChildMode && activeChild ? activeChild.avatar : DEFAULT_AVATAR;

  return {
    childProfiles: list,
    activeChild,
    childMode: inChildMode,
    displayAvatar,
    loading, // true until the first list has arrived
    error, // why the list could not be loaded (null = no problem)
    optionsStatus, // the choice lists: 'idle' | 'loading' | 'ready' | 'failed'
    optionsError,

    // Returns the list of children. Throws if the server could not be reached.
    loadChildren: () => dispatch(loadChildren()),
    loadOptions: () => dispatch(loadOptions()),

    addChild: previewSafe((profile) =>
      runWithPopup(dispatch, () => createChild(profile), 'Could not save').then((data) => (data ? data.child : null))
    ),
    updateChild: previewSafe((id, changes) =>
      runWithPopup(dispatch, () => saveChildChanges({ id, changes }), 'Could not save')
    ),
    deleteChild: previewSafe((id) => runWithPopup(dispatch, () => removeChild(id), 'Could not delete')),
    enterChildMode: previewSafe((id) => runWithPopup(dispatch, () => selectChild(id), 'Could not open Child Mode')),
    exitChildMode: () => dispatch(childModeExited()),
    // A Read-Along session finished. `session` = { childId, clientSessionId, stars, topicId,
    // level, language, sessionDate }. "Retry" sends the SAME object again, so the same
    // clientSessionId: the server then never counts the stars twice.
    addReadingResult: previewSafe((session) =>
      runWithPopup(dispatch, () => saveReadingSession(session), 'Your stars are not saved yet')
    ),
  };
}
