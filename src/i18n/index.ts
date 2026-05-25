import { createI18n } from 'vue-i18n';

import en from './locales/en';
import ru from './locales/ru';

const LOCALE_STORAGE_KEY = 'locale';

function getInitialLocale(): SupportedLanguages {
  if (typeof localStorage === 'undefined') {
    return 'en';
  }

  const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
  return saved === 'ru' || saved === 'en' ? saved : 'en';
}

export { LOCALE_STORAGE_KEY };

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: {
    en,
    ru,
  },
});

export type SupportedLanguages = 'en' | 'ru';
export type Translator = { t: (key: string, args?: Record<string, unknown>) => string };
