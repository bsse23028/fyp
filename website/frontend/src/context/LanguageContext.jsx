// LANGUAGE CONTEXT - English / اردو for the whole website (the app's LanguageContext).
//   const { language, setLanguage, t, isRtl } = useLanguage();
// Switching to Urdu also flips the page right-to-left (<html dir="rtl" lang="ur">).

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { setCurrentLanguage, translate } from '../i18n/translate';
import { KEYS, loadData, saveData } from '../utils/misc';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = loadData(KEYS.language, 'en');
    setCurrentLanguage(saved);
    return saved === 'ur' ? 'ur' : 'en';
  });

  useEffect(() => {
    setCurrentLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      isRtl: language === 'ur',
      setLanguage: (next) => {
        const safe = next === 'ur' ? 'ur' : 'en';
        setCurrentLanguage(safe);
        saveData(KEYS.language, safe);
        setLanguageState(safe);
      },
      t: translate,
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
