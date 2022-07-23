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

export const isLine = (shape: any): shape is Line => {
  const expectedType: ShapeType = 'line'
  const expectedDrawCommand: ShapeDrawCommand<'line'> = 'start-end'

  return (
    typeof shape?.id === 'number' &&
    shape?.type === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    isCoordinate(shape?.constraints?.startPoint) &&
    isCoordinate(shape?.constraints?.endPoint)
  )
}

export const isCircle = (shape: any): shape is Circle => {
  const expectedType: ShapeType = 'circle'
  const expectedDrawCommand: ShapeDrawCommand<'circle'> = 'center-diameter'
  return (
    typeof shape?.id === 'number' &&
    shape?.type === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    isCoordinate(shape?.constraints?.center) &&
    typeof shape?.constraints?.radius === 'number'
  )
}

export const isArcCenterTwoPoints = (
  shape: any
): shape is Arc<ArcConstraintsWithCenterAndTwoPoints> => {
  const expectedType: ShapeType = 'arc'
  const expectedDrawCommand: ShapeDrawCommand<'arc'> = 'center-two-points'
  return (
    typeof shape?.id === 'number' &&
    shape?.type === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    isCoordinate(shape?.constraints?.center) &&
    typeof shape?.constraints?.radius === 'number' &&
    isCoordinate(shape?.constraints?.startPoint) &&
    isCoordinate(shape?.constraints?.endPoint) &&
    typeof shape?.constraints?.startPointAngle === 'number' &&
    typeof shape?.constraints?.endPointAngle === 'number' &&
    typeof shape?.constraints?.angleDeltaFromStart === 'number'
  )
}

export const isArcThreePoints = (shape: any): shape is Arc<ArcConstraintsWithThreePoints> => {
  const expectedType: ShapeType = 'arc'
  const expectedDrawCommand: ShapeDrawCommand<'arc'> = 'three-points'
  return (
    typeof shape?.id === 'number' &&
    shape?.type === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    isCoordinate(shape?.constraints?.startPoint) &&
    isCoordinate(shape?.constraints?.endPoint) &&
    isCoordinate(shape?.constraints?.center) &&
    typeof shape?.constraints?.startPointAngle === 'number' &&
    typeof shape?.constraints?.endPointAngle === 'number' &&
    typeof shape?.constraints?.radius === 'number'
  )
}

export const isSupplementalLineShape = (shape: any): shape is SupplementalLine => {
  const expectedType: ShapeType = 'supplementalLine'
  const expectedDrawCommand: ShapeDrawCommand<'supplementalLine'> = 'start-end'
  return (
    typeof shape?.id === 'number' &&
    shape?.type === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    isCoordinate(shape?.constraints?.startPoint) &&
    isCoordinate(shape?.constraints?.endPoint)
  )
}

export const isLineStartEndSeed1 = (shape: any): shape is LineStartEndSeed1 => {
  const expectedType: ShapeType = 'line'
  const expectedDrawCommand: ShapeDrawCommand<'line'> = 'start-end'
  const expectedDrawStep: DrawCommandSteps<'line', 'start-end'> = 'startPoint'
  return (
    shape?.isSeed === true &&
    shape?.type === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    shape?.drawStep === expectedDrawStep &&
    isCoordinate(shape?.startPoint)
  )
}

export const isLineStartEndSeed2 = (shape: any): shape is LineStartEndSeed2 => {
  const expectedType: ShapeType = 'line'
  const expectedDrawCommand: ShapeDrawCommand<'line'> = 'start-end'
  const expectedDrawStep: DrawCommandSteps<'line', 'start-end'> = 'endPoint'
  return (
    shape?.isSeed === true &&
    shape?.type === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    shape?.drawStep === expectedDrawStep &&
    isCoordinate(shape?.startPoint) &&
    isCoordinate(shape?.endPoint)
  )
}

export const isCircleCenterDiameterSeed1 = (shape: any): shape is CircleCenterDiameterSeed1 => {
  const expectedType: ShapeType = 'circle'
  const expectedDrawCommand: ShapeDrawCommand<'circle'> = 'center-diameter'
  const expectedDrawStep: DrawCommandSteps<'circle', 'center-diameter'> = 'center'
  return (
    shape?.isSeed === true &&
    shape?.type === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    shape?.drawStep === expectedDrawStep &&
    isCoordinate(shape?.center)
  )
}

export const isCircleCenterDiameterSeed2 = (shape: any): shape is CircleCenterDiameterSeed2 => {
  const expectedType: ShapeType = 'circle'
  const expectedDrawCommand: ShapeDrawCommand<'circle'> = 'center-diameter'
  const expectedDrawStep: DrawCommandSteps<'circle', 'center-diameter'> = 'diameter'
  return (
    shape?.isSeed === true &&
    shape?.type === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    shape?.drawStep === expectedDrawStep &&
    isCoordinate(shape?.center) &&
    typeof shape?.radius === 'number' &&
    isCoordinate(shape?.diameterStart) &&
    isCoordinate(shape?.diameterEnd)
  )
}

export const isArcCenterTwoPointsSeed1 = (shape: any): shape is ArcCenterTwoPointsSeed1 => {
  const expectedType: ShapeType = 'arc'
  const expectedDrawCommand: ShapeDrawCommand<'arc'> = 'center-two-points'
  const expectedDrawStep: DrawCommandSteps<'arc', 'center-two-points'> = 'center'
  return (
    shape?.isSeed === true &&
    shape?.type === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    shape?.drawStep === expectedDrawStep &&
    isCoordinate(shape?.center)
  )
}

export const isArcCenterTwoPointsSeed2 = (shape: any): shape is ArcCenterTwoPointsSeed2 => {
  const expectedType: ShapeType = 'arc'
  const expectedDrawCommand: ShapeDrawCommand<'arc'> = 'center-two-points'
  const expectedDrawStep: DrawCommandSteps<'arc', 'center-two-points'> = 'startPoint'
  return (
    shape?.isSeed === true &&
    shape?.type === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    shape?.drawStep === expectedDrawStep &&
    isCoordinate(shape?.center) &&
    typeof shape?.radius === 'number' &&
    isCoordinate(shape?.startPoint) &&
    typeof shape?.startPointAngle === 'number'
  )
}

export const isArcCenterTwoPointsSeed3 = (shape: any): shape is ArcCenterTwoPointsSeed3 => {
  const expectedType: ShapeType = 'arc'
  const expectedDrawCommand: ShapeDrawCommand<'arc'> = 'center-two-points'
  const expectedDrawStep: DrawCommandSteps<'arc', 'center-two-points'> = 'endPoint'
  return (
    shape?.isSeed === true &&
    shape?.type === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    shape?.drawStep === expectedDrawStep &&
    isCoordinate(shape?.center) &&
    typeof shape?.radius === 'number' &&
    isCoordinate(shape?.startPoint) &&
    typeof shape?.startPointAngle === 'number' &&
    isCoordinate(shape?.endPoint) &&
    typeof shape?.endPointAngle === 'number' &&
    typeof shape?.angleDeltaFromStart === 'number'
  )
}

export const isArcThreePointsSeed1 = (shape: any): shape is ArcThreePointsSeed1 => {
  const expectedType: ShapeType = 'arc'
  const expectedDrawCommand: ShapeDrawCommand<'arc'> = 'three-points'
  const expectedDrawStep: DrawCommandSteps<'arc', 'three-points'> = 'startPoint'
  return (
    shape?.isSeed === true &&
    shape?.type === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    shape?.drawStep === expectedDrawStep &&
    isCoordinate(shape?.startPoint)
  )
}

export const isArcThreePointsSeed2 = (shape: any): shape is ArcThreePointsSeed2 => {
  const expectedType: ShapeType = 'arc'
  const expectedDrawCommand: ShapeDrawCommand<'arc'> = 'three-points'
  const expectedDrawStep: DrawCommandSteps<'arc', 'three-points'> = 'endPoint'
  return (
    shape?.isSeed === true &&
    shape?.type === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    shape?.drawStep === expectedDrawStep &&
    isCoordinate(shape?.startPoint) &&
    isCoordinate(shape?.endPoint) &&
    typeof shape?.distance === 'number'
  )
}

export const isArcThreePointsSeed3 = (shape: any): shape is ArcThreePointsSeed3 => {
  const expectedType: ShapeType = 'arc'
  const expectedDrawCommand: ShapeDrawCommand<'arc'> = 'three-points'
  const expectedDrawStep: DrawCommandSteps<'arc', 'three-points'> = 'onLinePoint'
  return (
    shape?.isSeed === true &&
    shape?.type === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    shape?.drawStep === expectedDrawStep &&
    isCoordinate(shape?.startPoint) &&
    isCoordinate(shape?.endPoint) &&
    typeof shape?.distance === 'number' &&
    isCoordinate(shape?.onLinePoint) &&
    isCoordinate(shape?.center) &&
    typeof shape?.startPointAngle === 'number' &&
    typeof shape?.endPointAngle === 'number' &&
    typeof shape?.radius === 'number'
  )
}

export const isSupplementalLineStartEndSeed1 = (
  shape: any
): shape is SupplementalLineStartEndSeed1 => {
  const expectedType: ShapeType = 'supplementalLine'
  const expectedDrawCommand: ShapeDrawCommand<'supplementalLine'> = 'start-end'
  const expectedDrawStep: DrawCommandSteps<'supplementalLine', 'start-end'> = 'startPoint'
  return (
    shape?.isSeed === true &&
    shape?.type === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    shape?.drawStep === expectedDrawStep &&
    isCoordinate(shape?.startPoint)
  )
}

export const isSupplementalLineStartEndSeed2 = (
  shape: any
): shape is SupplementalLineStartEndSeed2 => {
  const expectedType: ShapeType = 'supplementalLine'
  const expectedDrawCommand: ShapeDrawCommand<'supplementalLine'> = 'start-end'
  const expectedDrawStep: DrawCommandSteps<'supplementalLine', 'start-end'> = 'endPoint'
  return (
    shape?.isSeed === true &&
    shape?.type === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    shape?.drawStep === expectedDrawStep &&
    isCoordinate(shape?.startPoint) &&
    isCoordinate(shape?.endPoint)
  )
}
