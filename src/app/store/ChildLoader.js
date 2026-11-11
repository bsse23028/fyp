// CHILD LOADER - a tiny component with no screen of its own.
// It sits inside <AuthProvider> (see App.js) and:
//   - loads the choice lists (GET /api/options) once, when the app opens
//   - loads the logged-in parent's children from the server when somebody logs in,
//     signs up, or the app restores the saved login
//   - empties the list when the parent logs out
// If loading fails, the error is kept in Redux and AppNavigator shows it with a Retry button.

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { childrenCleared, loadChildren, loadOptions } from './childSlice';

export default function ChildLoader() {
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useAuth();
  // The id only: changing the parent's NAME must not load the children again.
  const userId = user ? user.id : null;

  // The choice lists are public, so they can be loaded straight away.
  useEffect(() => {
    dispatch(loadOptions());
  }, []);

  useEffect(() => {
    if (authLoading) return; // wait until we know who is logged in
    if (userId) {
      // The error is saved in the state (AppNavigator / Log In show it), so nothing to do here.
      dispatch(loadChildren()).catch(() => {});
    } else {
      dispatch(childrenCleared());
    }
  }, [userId, authLoading]);

  return null; // draws nothing
}
