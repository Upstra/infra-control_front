import { createI18n } from 'vue-i18n';
import pulseFr from '@/locales/pulse/fr.json';

export const createTestI18n = () =>
  createI18n({
    legacy: false,
    locale: 'fr',
    missingWarn: false,
    fallbackWarn: false,
    messages: { fr: pulseFr },
  });
