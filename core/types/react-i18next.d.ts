import 'react-i18next'

declare global {
  interface TranslationSchema {
    drawType: {
      solid: string
      supplemental: string
    }
    shape: {
      line: string
      circle: string
      arc: string
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
