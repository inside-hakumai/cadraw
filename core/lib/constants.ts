export const shapeList = ['line', 'circle', 'arc', 'supplementalLine'] as const

export const drawCommandList = {
  line: ['start-end'],
  circle: ['center-diameter'],
  arc: ['center-two-points', 'three-points'],
  supplementalLine: ['start-end'],
} as const
