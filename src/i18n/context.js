import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useLocales } from 'expo-localization';
import { repository, keys } from '../storage/repository';
import { languageOptions, resolveLanguage, translate } from './core';
const LanguageContext = createContext({
  language: 'hu',
  preference: 'auto',
  setPreference: async () => false
});
export function LanguageProvider({
  children
}) {
  const locales = useLocales();
  const [preference, setValue] = useState('auto');
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    repository.read(keys.language, value => languageOptions.includes(value), 'auto').then(value => {
      if (active) setValue(value);
    }).catch(() => {
      if (active) setError('A nyelv mentése nem sikerült.');
    }).finally(() => {
      if (active) setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);
  const language = resolveLanguage(preference, locales.map(locale => locale.languageTag));
  async function setPreference(value) {
    if (!languageOptions.includes(value)) return false;
    try {
      await repository.write(keys.language, value);
      setValue(value);
      setError('');
      return true;
    } catch {
      setError('A nyelv mentése nem sikerült.');
      return false;
    }
  }
  return <LanguageContext.Provider value={{
    language,
    preference,
    setPreference,
    error
  }}>{loaded ? children : null}</LanguageContext.Provider>;
}
export const useLanguage = () => useContext(LanguageContext);
export function useTranslation() {
  const {
    language
  } = useLanguage();
  return useCallback(value => translate(value, language), [language]);
}
