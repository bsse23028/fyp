// LANGUAGE CONTEXT - English / اردو for the whole website (the app's LanguageContext).
//   const { language, setLanguage, t, isRtl } = useLanguage();
// Switching to Urdu also flips the page right-to-left (<html dir="rtl" lang="ur">).

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { setCurrentLanguage, translate } from '../i18n/translate';
import { KEYS, loadData, saveData } from '../utils/misc';

const LanguageContext = createContext(null);

// The Urdu font (Noto Nastaliq, large) is only downloaded once Urdu is chosen (R17 of the website audit);
// English visitors never load it.
const URDU_FONT = 'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600;700&display=swap';
function loadUrduFont() {
  if (typeof document === 'undefined' || document.getElementById('font-urdu')) return;
  const link = document.createElement('link');
  link.id = 'font-urdu';
  link.rel = 'stylesheet';
  link.href = URDU_FONT;
  document.head.appendChild(link);
}

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
    if (language === 'ur') loadUrduFont();
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
