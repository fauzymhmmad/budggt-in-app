import React, { createContext, useContext, useState } from 'react';
import { translations, TranslationKey, Language } from '../locales/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('aurabudget_language');
      if (saved === 'en' || saved === 'id') return saved;
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('aurabudget_language', newLang);
    } catch {
      // ignore
    }
  };

  const t = (key: TranslationKey, values: Record<string, string | number> = {}): string => {
    const dict = translations[language] || translations.en;
    const text = dict[key] || translations.en[key] || (key as string);
    return text.replace(/{{(\w+)}}/g, (_, name: string) => String(values[name] ?? `{{${name}}}`));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    const fallbackLang: Language = 'en';
    const dict = translations.en;
    const t = (key: TranslationKey, values: Record<string, string | number> = {}): string => {
      const text = dict[key] || (key as string);
      return text.replace(/{{(\w+)}}/g, (_, name: string) => String(values[name] ?? `{{${name}}}`));
    };
    return {
      language: fallbackLang,
      setLanguage: () => {},
      t,
    };
  }
  return context;
};
