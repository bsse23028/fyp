// LANGUAGE CONTEXT - remembers which language is selected in the header
// toggle ("English" / "اردو") so every screen can read it.
//
// The choice is saved on the phone (AsyncStorage), so it is still selected
// the next time the app opens.
//
// The words themselves are translated by components/AppText.js using the list
// in src/shared/i18n/ur.json (see src/shared/i18n/translate.js). `t('English text')` does the
// same for things that are not <Text>, e.g. a pop-up message or a placeholder.

import React, { createContext, useContext, useEffect, useState } from 'react';
import { KEYS, loadData, saveData } from '../../shared/utils/storage';
import { setCurrentLanguage, translate } from '../../shared/i18n/translate';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en'); // 'en' or 'ur'

  // Tell the translator which language is on (must happen before the screens draw).
  setCurrentLanguage(language);

  // When the app starts, load the saved choice.
  useEffect(() => {
    loadData(KEYS.language, 'en').then(setLanguageState);
  }, []);

  // Change the language AND save it.
  function setLanguage(newLanguage) {
    setLanguageState(newLanguage);
    saveData(KEYS.language, newLanguage);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Use inside any screen/component:  const { language, setLanguage, t } = useLanguage();
export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return value;
}
