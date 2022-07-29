/* eslint-disable @typescript-eslint/no-explicit-any */

import { drawCommandList, shapeList } from './constants'

export const isShapeType = (value: any): value is ShapeType => {
  return typeof value === 'string' && shapeList.some(shape => shape === value)
}

export const isValidLineCommand = (command: any): command is ShapeDrawCommand<'line'> => {
  return [...drawCommandList['line']].includes(command)
}

export const isValidRectangleCommand = (command: any): command is ShapeDrawCommand<'rectangle'> => {
  return [...drawCommandList['rectangle']].includes(command)
}

export const isValidCircleCommand = (command: any): command is ShapeDrawCommand<'circle'> => {
  return [...drawCommandList['circle']].includes(command)
}

export const isValidArcCommand = (command: any): command is ShapeDrawCommand<'arc'> => {
  return [...drawCommandList['arc']].includes(command)
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
    shape?.shape === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    isCoordinate(shape?.constraints?.startPoint) &&
    isCoordinate(shape?.constraints?.endPoint)
  )
}

export const isRectangle = (shape: any): shape is Rectangle => {
  return (
    isRectangleWithCenterCornerConstraints(shape) || isRectangleWithTwoCornersConstraints(shape)
  )
}

export const isRectangleWithCenterCornerConstraints = (
  shape: any
): shape is Rectangle<CenterCornerConstraints> => {
  const expectedType: ShapeType = 'rectangle'
  const expectedDrawCommand: ShapeDrawCommand<'rectangle'> = 'center-corner'

  return (
    typeof shape?.id === 'number' &&
    shape?.shape === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    isCoordinate(shape?.computed?.upperLeftPoint) &&
    isCoordinate(shape?.computed?.upperRightPoint) &&
    isCoordinate(shape?.computed?.lowerLeftPoint) &&
    isCoordinate(shape?.computed?.lowerRightPoint) &&
    isCoordinate(shape.constraints?.center) &&
    isCoordinate(shape.constraints?.cornerPoint)
  )
}

export const isRectangleWithTwoCornersConstraints = (
  shape: any
): shape is Rectangle<TwoCornersConstraints> => {
  const expectedType: ShapeType = 'rectangle'
  const expectedDrawCommand: ShapeDrawCommand<'rectangle'> = 'two-corners'

  return (
    typeof shape?.id === 'number' &&
    shape?.shape === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    isCoordinate(shape?.computed?.upperLeftPoint) &&
    isCoordinate(shape?.computed?.upperRightPoint) &&
    isCoordinate(shape?.computed?.lowerLeftPoint) &&
    isCoordinate(shape?.computed?.lowerRightPoint) &&
    isCoordinate(shape.constraints?.corner1Point) &&
    isCoordinate(shape.constraints?.corner2Point)
  )
}

export const isCircle = (shape: any): shape is Circle => {
  const expectedType: ShapeType = 'circle'
  const expectedDrawCommand: ShapeDrawCommand<'circle'> = 'center-diameter'
  return (
    typeof shape?.id === 'number' &&
    shape?.shape === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    isCoordinate(shape?.constraints?.center) &&
    typeof shape?.constraints?.radius === 'number'
  )
}

export const isArc = (shape: any): shape is Arc => {
  return isArcWithCenterTwoPointsConstraints(shape) || isArcWithThreePointsConstraints(shape)
}

export const isArcWithCenterTwoPointsConstraints = (
  shape: any
): shape is Arc<CenterAndTwoPointsConstraints> => {
  const expectedType: ShapeType = 'arc'
  const expectedDrawCommand: ShapeDrawCommand<'arc'> = 'center-two-points'

  return (
    typeof shape?.id === 'number' &&
    shape?.shape === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    isCoordinate(shape?.constraints?.center) &&
    isCoordinate(shape?.constraints?.startPoint) &&
    isCoordinate(shape?.constraints?.endPoint) &&
    typeof shape?.constraints?.angleDeltaFromStart === 'number' &&
    isCoordinate(shape?.computed?.center) &&
    isCoordinate(shape?.computed?.startPoint) &&
    isCoordinate(shape?.computed?.endPoint) &&
    typeof shape?.computed?.startPointAngle === 'number' &&
    typeof shape?.computed?.endPointAngle === 'number' &&
    typeof shape?.computed?.radius === 'number' &&
    typeof shape?.computed?.angleDeltaFromStart === 'number'
  )
}

export const isArcWithThreePointsConstraints = (
  shape: any
): shape is Arc<ThreePointsConstraints> => {
  const expectedType: ShapeType = 'arc'
  const expectedDrawCommand: ShapeDrawCommand<'arc'> = 'three-points'

  return (
    typeof shape?.id === 'number' &&
    shape?.shape === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    isCoordinate(shape?.constraints?.startPoint) &&
    isCoordinate(shape?.constraints?.endPoint) &&
    isCoordinate(shape?.constraints?.onLinePoint) &&
    isCoordinate(shape?.computed?.center) &&
    isCoordinate(shape?.computed?.startPoint) &&
    isCoordinate(shape?.computed?.endPoint) &&
    typeof shape?.computed?.startPointAngle === 'number' &&
    typeof shape?.computed?.endPointAngle === 'number' &&
    typeof shape?.computed?.radius === 'number' &&
    typeof shape?.computed?.angleDeltaFromStart === 'number'
  )
}

export const isLineStartEndSeed1 = (shape: any): shape is LineStartEndSeed1 => {
  const expectedType: ShapeType = 'line'
  const expectedDrawCommand: ShapeDrawCommand<'line'> = 'start-end'
  const expectedDrawStep: CommandDrawStep<'line', 'start-end'> = 'startPoint'
  return (
    shape?.isSeed === true &&
    shape?.shape === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    shape?.drawStep === expectedDrawStep &&
    isCoordinate(shape?.startPoint)
  )
}

export const isLineStartEndSeed2 = (shape: any): shape is LineStartEndSeed2 => {
  const expectedType: ShapeType = 'line'
  const expectedDrawCommand: ShapeDrawCommand<'line'> = 'start-end'
  const expectedDrawStep: CommandDrawStep<'line', 'start-end'> = 'endPoint'
  return (
    shape?.isSeed === true &&
    shape?.shape === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    shape?.drawStep === expectedDrawStep &&
    isCoordinate(shape?.startPoint) &&
    isCoordinate(shape?.endPoint)
  )
}

export const isRectangleTwoCornersSeed2 = (shape: any): shape is RectangleTwoCornersSeed2 => {
  const expectedType: ShapeType = 'rectangle'
  const expectedDrawCommand: ShapeDrawCommand<'rectangle'> = 'two-corners'
  const expectedDrawStep: CommandDrawStep<'rectangle', 'two-corners'> = 'corner-2'
  return (
    shape?.isSeed === true &&
    shape?.shape === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    shape?.drawStep === expectedDrawStep &&
    isCoordinate(shape?.corner1Point) &&
    isCoordinate(shape?.corner2Point)
  )
}

export const isRectangleCenterCornerSeed2 = (shape: any): shape is RectangleCenterCornerSeed2 => {
  const expectedType: ShapeType = 'rectangle'
  const expectedDrawCommand: ShapeDrawCommand<'rectangle'> = 'center-corner'
  const expectedDrawStep: CommandDrawStep<'rectangle', 'center-corner'> = 'corner'
  return (
    shape?.isSeed === true &&
    shape?.shape === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    shape?.drawStep === expectedDrawStep &&
    isCoordinate(shape?.center) &&
    isCoordinate(shape?.cornerPoint) &&
    isCoordinate(shape?.upperLeftPoint)
  )
}

export const isCircleCenterDiameterSeed1 = (shape: any): shape is CircleCenterDiameterSeed1 => {
  const expectedType: ShapeType = 'circle'
  const expectedDrawCommand: ShapeDrawCommand<'circle'> = 'center-diameter'
  const expectedDrawStep: CommandDrawStep<'circle', 'center-diameter'> = 'center'
  return (
    shape?.isSeed === true &&
    shape?.shape === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    shape?.drawStep === expectedDrawStep &&
    isCoordinate(shape?.center)
  )
}

export const isCircleCenterDiameterSeed2 = (shape: any): shape is CircleCenterDiameterSeed2 => {
  const expectedType: ShapeType = 'circle'
  const expectedDrawCommand: ShapeDrawCommand<'circle'> = 'center-diameter'
  const expectedDrawStep: CommandDrawStep<'circle', 'center-diameter'> = 'diameter'
  return (
    shape?.isSeed === true &&
    shape?.shape === expectedType &&
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
  const expectedDrawStep: CommandDrawStep<'arc', 'center-two-points'> = 'center'
  return (
    shape?.isSeed === true &&
    shape?.shape === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    shape?.drawStep === expectedDrawStep &&
    isCoordinate(shape?.center)
  )
}

export const isArcCenterTwoPointsSeed2 = (shape: any): shape is ArcCenterTwoPointsSeed2 => {
  const expectedType: ShapeType = 'arc'
  const expectedDrawCommand: ShapeDrawCommand<'arc'> = 'center-two-points'
  const expectedDrawStep: CommandDrawStep<'arc', 'center-two-points'> = 'startPoint'
  return (
    shape?.isSeed === true &&
    shape?.shape === expectedType &&
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
  const expectedDrawStep: CommandDrawStep<'arc', 'center-two-points'> = 'endPoint'
  return (
    shape?.isSeed === true &&
    shape?.shape === expectedType &&
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
  const expectedDrawStep: CommandDrawStep<'arc', 'three-points'> = 'startPoint'
  return (
    shape?.isSeed === true &&
    shape?.shape === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    shape?.drawStep === expectedDrawStep &&
    isCoordinate(shape?.startPoint)
  )
}

export const isArcThreePointsSeed2 = (shape: any): shape is ArcThreePointsSeed2 => {
  const expectedType: ShapeType = 'arc'
  const expectedDrawCommand: ShapeDrawCommand<'arc'> = 'three-points'
  const expectedDrawStep: CommandDrawStep<'arc', 'three-points'> = 'endPoint'
  return (
    shape?.isSeed === true &&
    shape?.shape === expectedType &&
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
  const expectedDrawStep: CommandDrawStep<'arc', 'three-points'> = 'onLinePoint'
  return (
    shape?.isSeed === true &&
    shape?.shape === expectedType &&
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
