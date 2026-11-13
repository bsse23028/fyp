// HEADER CONTEXT - the header is drawn ONCE, above the navigator, so it never
// moves or changes while screens slide underneath it.
//
// Each <Screen> tells the header what it needs (which mode it is in, and an
// optional avatar to preview, and whether it wants a ☰ menu button). The header shows the settings of the screen that
// is open now. Settings are kept per screen (by route key), so a screen that is
// closing can never wipe the settings of the screen that is opening.

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const HeaderContext = createContext(null);

export function HeaderProvider({ children }) {
  const [configs, setConfigs] = useState({}); // { [routeKey]: { mode, avatar } }

  const setConfig = useCallback((key, config) => {
    setConfigs((old) => {
      const prev = old[key];
      if (prev && prev.mode === config.mode && prev.avatar === config.avatar && prev.menu === config.menu) return old;
      return { ...old, [key]: config };
    });
  }, []);

  const removeConfig = useCallback((key) => {
    setConfigs((old) => {
      if (!(key in old)) return old;
      const next = { ...old };
      delete next[key];
      return next;
    });
  }, []);

  // The ☰ menu button: the screen's press handler is kept in a ref (not state), so it never re-renders the header.
  const menuHandlers = useRef({});
  const setMenuHandler = useCallback((key, handler) => {
    if (handler) menuHandlers.current[key] = handler;
    else delete menuHandlers.current[key];
  }, []);
  const pressMenu = useCallback((key) => {
    const handler = menuHandlers.current[key];
    if (handler) handler();
  }, []);

  const value = useMemo(
    () => ({ configs, setConfig, removeConfig, setMenuHandler, pressMenu }),
    [configs, setConfig, removeConfig, setMenuHandler, pressMenu]
  );
  return <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>;
}

export function useHeaderConfig() {
  const value = useContext(HeaderContext);
  if (!value) throw new Error('useHeaderConfig must be used inside <HeaderProvider>');
  return value;
}
