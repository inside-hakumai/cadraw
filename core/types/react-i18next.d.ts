import 'react-i18next'

declare global {
  interface TranslationSchema {
    drawType: { [key in DrawType]: string }
    shape: { [key in ShapeType]: string }
    operation: {
      select: string
      undo: string
      showShortcut: string
      export: string
    }
    command: { [shape in ShapeType]: { [command in ShapeDrawCommand<shape>]: string } }
    snapInfo: { [key in SnapType]: string }
    drawOperation: { [key in DrawOperation]: string }
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
