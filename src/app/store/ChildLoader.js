// CHILD LOADER - a tiny component with no screen of its own.
// It sits inside <AuthProvider> (see App.js) and fills the Redux store with the
// logged-in parent's children when somebody logs in, and empties it when they log out.

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { childrenCleared, loadChildren } from './childSlice';

export default function ChildLoader() {
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return; // wait until we know who is logged in
    if (user) dispatch(loadChildren(user.email));
    else dispatch(childrenCleared());
  }, [user, authLoading]);

  return null; // draws nothing
}
