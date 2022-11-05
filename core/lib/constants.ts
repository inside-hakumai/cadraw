export const drawType = ['solid', 'supplemental', 'dragShadow'] as const
export const shapeList = ['line', 'rectangle', 'circle', 'arc'] as const

export const drawCommandList = {
  line: ['start-end'],
  rectangle: ['two-corners', 'center-corner'],
  circle: ['center-diameter', 'two-points', 'two-points-radius'],
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
    'two-points': ['point1', 'point2'],
    'two-points-radius': ['point1', 'point2', 'radius'],
  },
  arc: {
    'center-two-points': ['center', 'startPoint', 'endPoint'],
    'three-points': ['startPoint', 'endPoint', 'onLinePoint'],
  },
} as const

export const drawOperationList = [
  'noop',
  'add-line',
  'add-circle',
  'add-rectangle',
  'add-arc',
  'delete-line',
  'delete-circle',
  'delete-rectangle',
  'delete-arc',
  'move-line',
] as const

export const color = {
  stroke: {
    normal: '#000000',
    onSelected: '#FF0000',
    onFocused: '#ff9797',
    shadow: '#8c8c8c',
  },
  supplementalColor: '#8c8c8c',
}
