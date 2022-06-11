/* eslint-disable @typescript-eslint/no-explicit-any */

import { drawCommandList, shapeList } from './constants'

export const isShapeType = (value: any): value is ShapeType => {
  return typeof value === 'string' && shapeList.some(shape => shape === value)
}

export const isValidLineCommand = (command: any): command is ShapeDrawCommand<'line'> => {
  return [...drawCommandList['line']].includes(command)
}

export const isValidCircleCommand = (command: any): command is ShapeDrawCommand<'circle'> => {
  return [...drawCommandList['circle']].includes(command)
}

export const isValidArcCommand = (command: any): command is ShapeDrawCommand<'arc'> => {
  return [...drawCommandList['arc']].includes(command)
}

export const isValidSupplementalLineCommand = (
  command: any
): command is ShapeDrawCommand<'supplementalLine'> => {
  return [...drawCommandList['supplementalLine']].includes(command)
}

export const isObject = (value: any): boolean => {
  return typeof value === 'object' && value !== null
}

export const isCoordinate = (value: any): value is Coordinate => {
  return isObject(value) && typeof value?.x === 'number' && typeof value?.y === 'number'
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

export const isArcShape = (shape: any): shape is ArcShape => {
  const expectedType: ShapeType = 'arc'
  return (
    shape?.type === expectedType &&
    isCoordinate(shape?.center) &&
    typeof shape?.radius === 'number' &&
    isCoordinate(shape?.startCoord) &&
    isCoordinate(shape?.endCoord) &&
    typeof shape?.startAngle === 'number' &&
    typeof shape?.endAngle === 'number' &&
    typeof shape?.angleDeltaFromStart === 'number'
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

export const isTemporaryArcCenter = (shape: any): shape is TemporaryArcCenter => {
  const expectedType: TemporaryShapeType = 'tmp-arc'
  return (
    shape?.type === expectedType &&
    isObject(shape?.center) &&
    typeof shape?.center.x === 'number' &&
    typeof shape?.center.y === 'number'
  )
}

export const isTemporaryArcRadius = (shape: any): shape is TemporaryArcRadius => {
  const expectedType: TemporaryShapeType = 'tmp-arc'
  return (
    shape?.type === expectedType &&
    isObject(shape?.center) &&
    typeof shape?.center.x === 'number' &&
    typeof shape?.center.y === 'number' &&
    typeof shape?.radius === 'number' &&
    typeof shape?.startAngle === 'number'
  )
}

export const isTemporaryArcShape = (shape: any): shape is TemporaryArcShape => {
  const expectedType: TemporaryShapeType = 'tmp-arc'
  return (
    shape?.type === expectedType &&
    isObject(shape?.center) &&
    typeof shape?.center.x === 'number' &&
    typeof shape?.center.y === 'number' &&
    typeof shape?.radius === 'number' &&
    typeof shape?.startAngle === 'number' &&
    typeof shape?.endAngle === 'number'
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
