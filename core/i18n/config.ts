import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import jaTranslation from './ja'

i18n.use(initReactI18next).init({
  resources: {
    ja: {
      app: jaTranslation,
    },
  },
  lng: 'ja',
  defaultNS: 'app',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
