/* eslint-disable @typescript-eslint/no-explicit-any */

export const isObject = (value: any): boolean => {
  return typeof value === 'object' && value !== null
}

export const isLineShape = (shape: any): shape is LineShape => {
  const expectedType: ShapeType = 'line'
  return (
    shape?.type === expectedType &&
    isObject(shape?.start) &&
    typeof shape?.start?.x === 'number' &&
    typeof shape?.start?.y === 'number' &&
    isObject(shape?.end) &&
    typeof shape?.end?.x === 'number' &&
    typeof shape?.end?.y === 'number'
  )
}

export const isCircleShape = (shape: any): shape is CircleShape => {
  const expectedType: ShapeType = 'circle'
  return (
    shape?.type === expectedType &&
    isObject(shape?.center) &&
    typeof shape?.center?.x === 'number' &&
    typeof shape?.center?.y === 'number' &&
    typeof shape?.radius === 'number'
  )
}

export const isSupplementalLineShape = (shape: any): shape is SupplementalLineShape => {
  const expectedType: ShapeType = 'supplementalLine'
  return (
    shape?.type === expectedType &&
    isObject(shape?.start) &&
    typeof shape?.start?.x === 'number' &&
    typeof shape?.start?.y === 'number' &&
    isObject(shape?.end) &&
    typeof shape?.end?.x === 'number' &&
    typeof shape?.end?.y === 'number'
  )
}

export const isTemporaryLineShape = (shape: any): shape is TemporaryLineShape => {
  const expectedType: TemporaryShapeType = 'tmp-line'
  return (
    shape?.type === expectedType &&
    isObject(shape?.start) &&
    typeof shape?.start?.x === 'number' &&
    typeof shape?.start?.y === 'number' &&
    isObject(shape?.end) &&
    typeof shape?.end?.x === 'number' &&
    typeof shape?.end?.y === 'number'
  )
}

export const isTemporaryCircleShape = (shape: any): shape is TemporaryCircleShape => {
  const expectedType: TemporaryShapeType = 'tmp-circle'
  return (
    shape?.type === expectedType &&
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

export const isTemporarySupplementalLineShape = (shape: any): shape is TemporaryLineShape => {
  const expectedType: TemporaryShapeType = 'tmp-supplementalLine'
  return (
    shape?.type === expectedType &&
    isObject(shape?.start) &&
    typeof shape?.start?.x === 'number' &&
    typeof shape?.start?.y === 'number' &&
    isObject(shape?.end) &&
    typeof shape?.end?.x === 'number' &&
    typeof shape?.end?.y === 'number'
  )
}
