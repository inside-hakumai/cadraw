export const drawType = ['solid', 'supplemental'] as const
export const shapeList = ['line', 'rectangle', 'circle', 'arc'] as const

export const drawCommandList = {
  line: ['start-end'],
  rectangle: ['two-corners', 'center-corner'],
  circle: ['center-diameter'],
  arc: ['center-two-points', 'three-points'],
} as const

export const drawStepList = {
  line: {
    'start-end': ['startPoint', 'endPoint'],
  },
  rectangle: {
    'two-corners': ['corner-1', 'corner-2'],
    'center-corner': ['center', 'corner'],
  },
  circle: {
    'center-diameter': ['center', 'diameter'],
  },
  arc: {
    'center-two-points': ['center', 'startPoint', 'endPoint'],
    'three-points': ['startPoint', 'endPoint', 'onLinePoint'],
  },
} as const

export const color = {
  strokeColor: '#000000',
  strokeColorOnSelected: '#FF0000',
  strokeColorOnFocused: '#ff9797',
}
