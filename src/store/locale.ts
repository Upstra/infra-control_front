import { defineStore } from 'pinia'
import { i18n } from '@/i18n'

export type Locale = 'en' | 'fr'

const LOCALE_KEY = 'locale'

export const useLocaleStore = defineStore('locale', {
  state: () => ({
    currentLocale: (localStorage.getItem(LOCALE_KEY) || 'fr') as Locale
  }),
  actions: {
    setLocale(locale: Locale) {
      this.currentLocale = locale
      localStorage.setItem(LOCALE_KEY, locale)
      i18n.global.locale.value = locale
    }
  }
})
