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
  return isRectangleConstrainedByCenterCorner(shape) || isRectangleConstrainedByTwoCorners(shape)
}

export const isRectangleConstrainedByCenterCorner = (
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

export const isRectangleConstrainedByTwoCorners = (
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
  return isCircleConstrainedByCenterRadius(shape)
}

export const isCircleConstrainedByCenterRadius = (
  shape: any
): shape is Circle<CenterRadiusConstraints> => {
  const expectedType: ShapeType = 'circle'
  const expectedDrawCommand: ShapeDrawCommand<'circle'> = 'center-diameter'

  return (
    typeof shape?.id === 'number' &&
    shape?.shape === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    isCoordinate(shape?.constraints?.center) &&
    typeof shape?.constraints?.radius === 'number' &&
    isCoordinate(shape?.computed?.center) &&
    typeof shape?.computed?.radius === 'number'
  )
}

export const isArc = (shape: any): shape is Arc => {
  return isArcConstrainedByCenterTwoPoints(shape) || isArcConstrainedByThreePoints(shape)
}

export const isArcConstrainedByCenterTwoPoints = (
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

export const isArcConstrainedByThreePoints = (shape: any): shape is Arc<ThreePointsConstraints> => {
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

export const isLineSeedConstrainedByStartEnd = (
  shape: any
): shape is LineSeedConstrainedByStartEnd => {
  const expectedType: ShapeType = 'line'
  const expectedDrawCommand: ShapeDrawCommand<'line'> = 'start-end'
  return (
    shape?.isSeed === true &&
    shape?.shape === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    isCoordinate(shape?.startPoint) &&
    isCoordinate(shape?.endPoint)
  )
}

export const isRectangleSeedConstrainedByTwoCorners = (
  shape: any
): shape is RectangleSeedConstrainedByTwoCorners => {
  const expectedType: ShapeType = 'rectangle'
  const expectedDrawCommand: ShapeDrawCommand<'rectangle'> = 'two-corners'
  return (
    shape?.isSeed === true &&
    shape?.shape === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    isCoordinate(shape?.corner1Point) &&
    isCoordinate(shape?.corner2Point) &&
    isCoordinate(shape?.upperLeftPoint)
  )
}

export const isRectangleSeedConstrainedByCenterCorner = (
  shape: any
): shape is RectangleSeedConstrainedByCenterCorner => {
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

export const isCircleSeedConstrainedByCenterDiameter = (
  shape: any
): shape is CircleSeedConstrainedByCenterDiameter => {
  const expectedType: ShapeType = 'circle'
  const expectedDrawCommand: ShapeDrawCommand<'circle'> = 'center-diameter'

  return (
    shape?.isSeed === true &&
    shape?.shape === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    isCoordinate(shape?.center) &&
    isCoordinate(shape?.diameterStart) &&
    isCoordinate(shape?.diameterEnd) &&
    typeof shape?.radius === 'number'
  )
}

export const isArcSeed1ConstrainedByCenterTwoPoints = (
  shape: any
): shape is ArcSeed1ConstrainedByCenterTwoPoints => {
  const expectedType: ShapeType = 'arc'
  const expectedDrawCommand: ShapeDrawCommand<'arc'> = 'center-two-points'

  return (
    shape?.isSeed === true &&
    shape?.shape === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    isCoordinate(shape?.center) &&
    isCoordinate(shape?.startPoint) &&
    typeof shape?.startPointAngle === 'number' &&
    typeof shape?.radius === 'number'
  )
}

export const isArcSeed2ConstrainedByCenterTwoPoints = (
  shape: any
): shape is ArcSeed2ConstrainedByCenterTwoPoints => {
  const expectedType: ShapeType = 'arc'
  const expectedDrawCommand: ShapeDrawCommand<'arc'> = 'center-two-points'

  return (
    shape?.isSeed === true &&
    shape?.shape === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    isCoordinate(shape?.center) &&
    isCoordinate(shape?.startPoint) &&
    typeof shape?.startPointAngle === 'number' &&
    typeof shape?.radius === 'number' &&
    isCoordinate(shape?.endPoint) &&
    typeof shape?.endPointAngle === 'number' &&
    typeof shape?.angleDeltaFromStart === 'number'
  )
}

export const isArcSeed1ConstrainedByThreePoints = (
  shape: any
): shape is ArcSeed1ConstrainedThreePoints => {
  const expectedType: ShapeType = 'arc'
  const expectedDrawCommand: ShapeDrawCommand<'arc'> = 'three-points'

  return (
    shape?.isSeed === true &&
    shape?.shape === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    isCoordinate(shape?.startPoint) &&
    isCoordinate(shape?.endPoint) &&
    typeof shape?.distance === 'number'
  )
}

export const isArcSeed2ConstrainedByThreePoints = (
  shape: any
): shape is ArcSeed2ConstrainedByThreePoints => {
  const expectedType: ShapeType = 'arc'
  const expectedDrawCommand: ShapeDrawCommand<'arc'> = 'three-points'

  return (
    shape?.isSeed === true &&
    shape?.shape === expectedType &&
    shape?.drawCommand === expectedDrawCommand &&
    isCoordinate(shape?.startPoint) &&
    isCoordinate(shape?.endPoint) &&
    typeof shape?.distance === 'number' &&
    isCoordinate(shape?.onLinePoint) &&
    isCoordinate(shape?.center) &&
    typeof shape?.startPointAngle === 'number' &&
    typeof shape?.endPointAngle === 'number' &&
    typeof shape?.radius === 'number' &&
    typeof shape?.angleDeltaFromStart === 'number'
  )
}
