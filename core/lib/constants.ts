export const drawType = ['solid', 'supplemental'] as const
export const shapeList = ['line', 'circle', 'arc'] as const

export const drawCommandList = {
  line: ['start-end'],
  circle: ['center-diameter'],
  arc: ['center-two-points', 'three-points'],
} as const
