const ja: TranslationSchema = {
  drawType: {
    solid: '実線',
    supplemental: '補助線',
    dragShadow: 'ドラッグ前',
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
      'two-points': '2点指定',
      'two-points-radius': '2点・半径指定',
    },
    arc: {
      'center-two-points': '中心・両端指定',
      'three-points': '3点指定',
    },
    rectangle: {
      'two-corners': '2点指定',
      'center-corner': '中心・角指定',
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
  drawOperation: {
    noop: '操作なし',
    'add-line': '直線を追加',
    'add-circle': '円を追加',
    'add-rectangle': '長方形を追加',
    'add-arc': '円弧を追加',
    'delete-line': '直線を削除',
    'delete-circle': '円を削除',
    'delete-rectangle': '長方形を削除',
    'delete-arc': '円弧を削除',
    'move-line': '直線を移動',
  },
} as const

export default ja
