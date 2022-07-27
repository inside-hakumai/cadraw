export const drawType = ['solid', 'supplemental'] as const
export const shapeList = ['line', 'rectangle', 'circle', 'arc'] as const

export const drawCommandList = {
  line: ['start-end'],
  rectangle: ['two-corners'],
  circle: ['center-diameter'],
  arc: ['center-two-points', 'three-points'],
} as const
