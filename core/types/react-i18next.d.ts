import 'react-i18next'

declare global {
  interface TranslationSchema {
    shape: {
      line: string
      circle: string
      arc: string
      supplementalLine: string
    }
    operation: {
      select: string
      undo: string
      showShortcut: string
      export: string
    }
    command: {
      line: {
        'start-end': string
      }
      circle: {
        'center-diameter': string
      }
      arc: {
        'center-two-points': string
        'three-points': string
      }
      supplementalLine: {
        'start-end': string
      }
    }
  }
}

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'app'
    resources: {
      app: TranslationSchema
    }
  }
}
