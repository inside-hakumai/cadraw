const ja: TranslationSchema = {
  drawType: {
    solid: '実線',
    supplemental: '補助線',
  },
  shape: {
    line: '直線',
    circle: '円',
    arc: '円弧',
  },
  operation: {
    select: '選択',
    undo: '元に戻す',
    showShortcut: 'ショートカットを表示',
    export: 'エクスポート',
  },
  command: {
    line: {
      'start-end': '両端指定',
    },
    circle: {
      'center-diameter': '中心・直径指定',
    },
    arc: {
      'center-two-points': '中心・両端指定',
      'three-points': '3点指定',
    },
  },
} as const

export default ja