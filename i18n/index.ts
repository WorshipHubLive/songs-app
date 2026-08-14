/* eslint-disable import/no-named-as-default-member */

import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { LANGUAGE_KEY } from '@/consts/keys';
import { getKvJson, setKvJson } from '@/utils/kv-store';
import en from './locales/en';
import es from './locales/es';
import fr from './locales/fr';
import ht from './locales/ht';
import it from './locales/it';
import ko from './locales/ko';
import pl from './locales/pl';
import ru from './locales/ru';
import zh from './locales/zh';

export const lng = getLocales()[0].languageCode ?? 'en';

const resolveLanguage = (): string => {
  const stored = getKvJson<{ language: string }>(LANGUAGE_KEY);
  if (stored?.language) return stored.language;

  setKvJson(LANGUAGE_KEY, { language: lng });
  return lng;
};

i18n.use(initReactI18next).init({
  resources: {
    en,
    es,
    fr,
    ht,
    it,
    ko,
    pl,
    ru,
    zh,
  },
  lng: resolveLanguage(),
  fallbackLng: 'en',
  supportedLngs: [
    'ar',
    'ca',
    'zh',
    'hr',
    'cs',
    'da',
    'nl',
    'en',
    'fi',
    'fr',
    'de',
    'el',
    'ht',
    'he',
    'hi',
    'hu',
    'id',
    'it',
    'ja',
    'ko',
    'ms',
    'no',
    'pl',
    'pt',
    'ro',
    'ru',
    'sk',
    'es',
    'sv',
    'th',
    'tr',
    'uk',
    'vi',
  ],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
