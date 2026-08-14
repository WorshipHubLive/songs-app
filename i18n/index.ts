/* eslint-disable import/no-named-as-default-member */

import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { LANGUAGE_KEY } from '@/consts/keys';
import { getKvJson, setKvJson } from '@/utils/kv-store';
import en from './locales/en';

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
