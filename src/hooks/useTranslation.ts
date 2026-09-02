import { useContext } from 'react';
import { translations, TranslationKey, Language } from '../locales/translations';
import { FinanceContext } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';

export function useTranslation() {
  const finance = useContext(FinanceContext);
  const langContext = useLanguage();

  if (finance) {
    const lang: Language = (finance.settings.language as Language) || langContext.language || 'en';
    const dict = translations[lang] || translations.en;

    const t = (key: TranslationKey, values: Record<string, string | number> = {}): string => {
      const text = dict[key] || translations.en[key] || (key as string);
      return text.replace(/{{(\w+)}}/g, (_, name: string) => String(values[name] ?? `{{${name}}}`));
    };

    const setLanguage = (newLang: Language) => {
      finance.updateSettings({ language: newLang });
      langContext.setLanguage(newLang);
    };

    return {
      t,
      language: lang,
      setLanguage,
    };
  }

  return langContext;
}
