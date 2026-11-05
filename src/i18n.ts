import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import fr from './locales/fr.json';
import pulseEn from './locales/pulse/en.json';
import pulseFr from './locales/pulse/fr.json';

export const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'fr',
  fallbackLocale: 'fr',
  messages: {
    en: { ...en, ...pulseEn },
    fr: { ...fr, ...pulseFr },
  },
});
