export const drawType = ['solid', 'supplemental'] as const
export const shapeList = ['line', 'circle', 'arc', 'rectangle'] as const

export const drawCommandList = {
  line: ['start-end'],
  circle: ['center-diameter'],
  arc: ['center-two-points', 'three-points'],
  rectangle: ['two-corners'],
} as const
