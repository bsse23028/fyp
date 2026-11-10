// DEVICE CONTEXT - things that belong to the PHONE, not to one account:
//   - introSeen:   has the welcome intro been shown on this phone before?
//   - permissions: did we already ask for camera + microphone?
//
// Both are saved with AsyncStorage. `loading` is true until they are read.

import React, { createContext, useContext, useEffect, useState } from 'react';
import { KEYS, loadData, saveData } from '../../shared/utils/storage';
import { getSavedPermissions } from '../../shared/utils/permissions';

const DeviceContext = createContext(null);

export function DeviceProvider({ children }) {
  const [introSeen, setIntroSeen] = useState(false);
  const [permissions, setPermissions] = useState({ asked: false, camera: false, microphone: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIntroSeen(await loadData(KEYS.introSeen, false));
      setPermissions(await getSavedPermissions());
      setLoading(false);
    }
    load();
  }, []);

  // Called by the Splash screen, so the next launch skips the splash.
  function markIntroSeen() {
    setIntroSeen(true);
    saveData(KEYS.introSeen, true);
  }

  const value = { introSeen, markIntroSeen, permissions, setPermissions, loading };
  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
}

export function useDevice() {
  const value = useContext(DeviceContext);
  if (!value) throw new Error('useDevice must be used inside <DeviceProvider>');
  return value;
}
