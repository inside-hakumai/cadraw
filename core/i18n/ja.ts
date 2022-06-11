import { ResourceLanguage } from 'i18next'

const ja: ResourceLanguage & TranslationSchema = {
  shape: {
    line: '直線',
    circle: '円',
    arc: '円弧',
    supplementalLine: '補助線',
  },
  operation: {
    select: '選択',
    undo: '元に戻す',
    showShortcut: 'ショートカットを表示',
    export: 'エクスポート',
  },
}

export default ja
