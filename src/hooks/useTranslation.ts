import { useFinance } from '../context/FinanceContext';
import { translations, TranslationKey, Language } from '../locales/translations';

export function useTranslation() {
  const { settings, updateSettings } = useFinance();
  const lang: Language = (settings.language as Language) || 'en';
  const dict = translations[lang] || translations.en;

  const t = (key: TranslationKey, values: Record<string, string | number> = {}): string => {
    const text = dict[key] || translations.en[key] || (key as string);
    return text.replace(/{{(\w+)}}/g, (_, name: string) => String(values[name] ?? `{{${name}}}`));
  };

  const setLanguage = (newLang: Language) => {
    updateSettings({ language: newLang });
  };

  return {
    t,
    language: lang,
    setLanguage,
  };
}
