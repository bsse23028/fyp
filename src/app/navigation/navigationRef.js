// NAVIGATION REF - lets code OUTSIDE the stack (the fixed header) navigate,
// and tells it which screen is open right now.

import { useEffect, useState } from 'react';
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

let currentKey = null;
const listeners = new Set();

// App.js calls this on every navigation change.
export function notifyRouteChange() {
  const route = navigationRef.isReady() ? navigationRef.getCurrentRoute() : null;
  const key = route ? route.key : null;
  if (key !== currentKey) {
    currentKey = key;
    listeners.forEach((fn) => fn(key));
  }
}

// The key of the screen that is open now (re-renders when it changes).
export function useCurrentRouteKey() {
  const [key, setKey] = useState(currentKey);
  useEffect(() => {
    listeners.add(setKey);
    setKey(currentKey);
    return () => listeners.delete(setKey);
  }, []);
  return key;
}
