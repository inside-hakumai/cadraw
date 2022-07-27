const ja: TranslationSchema = {
  drawType: {
    solid: '実線',
    supplemental: '補助線',
  },
  shape: {
    line: '直線',
    circle: '円',
    arc: '円弧',
    rectangle: '長方形',
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
    rectangle: {
      'two-corners': '2点指定',
    },
  },
  snapInfo: {
    circleCenter: '円の中心',
    lineEdge: '線の端',
    arcCenter: '円弧の中心',
    arcEdge: '円弧の端',
    gridIntersection: 'グリッドの交点',
    circumference: '円周上',
    onLine: '線上',
    onArc: '円弧上',
    onRectangle: '長方形上',
  },
} as const

export default ja
