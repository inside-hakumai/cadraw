export const isObject = (value: any): boolean => {
  return typeof value === 'object' && value !== null
}

export const isLineShape = (shape: any): shape is LineShape => {
  return (
    shape?.type === 'line' &&
    isObject(shape?.start) &&
    typeof shape?.start?.x === 'number' &&
    typeof shape?.start?.y === 'number' &&
    isObject(shape?.end) &&
    typeof shape?.end?.x === 'number' &&
    typeof shape?.end?.y === 'number'
  )
}

export const isCircleShape = (shape: any): shape is CircleShape => {
  return (
    shape?.type === 'circle' &&
    isObject(shape?.center) &&
    typeof shape?.center?.x === 'number' &&
    typeof shape?.center?.y === 'number' &&
    typeof shape?.radius === 'number'
  )
}

export const isTemporaryLineShape = (shape: any): shape is TemporaryLineShape => {
  return (
    shape?.type === 'temporary-line' &&
    isObject(shape?.start) &&
    typeof shape?.start?.x === 'number' &&
    typeof shape?.start?.y === 'number' &&
    isObject(shape?.end) &&
    typeof shape?.end?.x === 'number' &&
    typeof shape?.end?.y === 'number'
  )
}

export const isTemporaryCircleShape = (shape: any): shape is TemporaryCircleShape => {
  return (
    shape?.type === 'temporary-circle' &&
    isObject(shape?.center) &&
    typeof shape?.center.x === 'number' &&
    typeof shape?.center.y === 'number' &&
    typeof shape?.radius === 'number' &&
    isObject(shape?.diameterStart) &&
    typeof shape?.diameterStart.x === 'number' &&
    typeof shape?.diameterStart.y === 'number' &&
    isObject(shape?.diameterEnd) &&
    typeof shape?.diameterEnd?.x === 'number' &&
    typeof shape?.diameterEnd?.y === 'number'
  )
}
