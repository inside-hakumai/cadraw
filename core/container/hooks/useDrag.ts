import { useRecoilCallback } from 'recoil'
import { activeCoordState, mouseDownState } from '../state'
import {
  isArc,
  isArcConstrainedByCenterTwoPoints,
  isArcConstrainedByThreePoints,
  isCircle,
  isCircleConstrainedByCenterRadius,
  isCircleConstrainedByTwoPoints,
  isCircleConstrainedByTwoPointsRadius,
  isLine,
  isRectangle,
  isRectangleConstrainedByCenterCorner,
  isRectangleConstrainedByTwoCorners,
  isRectangleSeedConstrainedByTwoCorners,
} from '../../lib/typeguard'
import { addCoord } from '../../lib/function'
import { dragShadowShapeState, shapesState } from '../state/shapeState'

const useDrag = () => {
  const dragShape = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const { isClicking, activeCoordWhenMouseDown, targetShapeId, draggedShapeIds } =
          await snapshot.getPromise(mouseDownState)
        const activeCoord = await snapshot.getPromise(activeCoordState)
        const dragShadowShapes = await snapshot.getPromise(dragShadowShapeState)

        if (
          isClicking &&
          activeCoordWhenMouseDown !== null &&
          activeCoord !== null &&
          targetShapeId !== null
        ) {
          const dx = activeCoord.x - activeCoordWhenMouseDown.x
          const dy = activeCoord.y - activeCoordWhenMouseDown.y
          console.debug(`dragShape: dx: ${dx}, dy: ${dy}`)

          set(shapesState, shapes => {
            return shapes.map(shape => {
              if (targetShapeId === shape.id) {
                const shadowShape = dragShadowShapes.find(
                  shadowShape => shadowShape.id === shape.id
                )

                if (shadowShape !== undefined) {
                  if (isLine(shape)) {
                    const newShape = structuredClone(shape)
                    const originalLine = shadowShape as Line

                    newShape.constraints.startPoint = addCoord(
                      originalLine.constraints.startPoint,
                      dx,
                      dy
                    )
                    newShape.constraints.endPoint = addCoord(
                      originalLine.constraints.endPoint,
                      dx,
                      dy
                    )
                    newShape.computed.startPoint = addCoord(
                      originalLine.computed.startPoint,
                      dx,
                      dy
                    )
                    newShape.computed.endPoint = addCoord(originalLine.computed.endPoint, dx, dy)

                    return newShape
                  }

                  if (isRectangle(shape) && isRectangle(shadowShape)) {
                    const newShape = structuredClone(shape)

                    if (
                      isRectangleConstrainedByCenterCorner(newShape) &&
                      isRectangleConstrainedByCenterCorner(shadowShape)
                    ) {
                      newShape.constraints.center = addCoord(shadowShape.constraints.center, dx, dy)
                      newShape.constraints.cornerPoint = addCoord(
                        shadowShape.constraints.cornerPoint,
                        dx,
                        dy
                      )
                    } else if (
                      isRectangleConstrainedByTwoCorners(newShape) &&
                      isRectangleSeedConstrainedByTwoCorners(shape)
                    ) {
                      newShape.constraints.corner1Point = addCoord(
                        shadowShape.constraints.corner1Point,
                        dx,
                        dy
                      )
                      newShape.constraints.corner2Point = addCoord(
                        shadowShape.constraints.corner2Point,
                        dx,
                        dy
                      )
                    }

                    newShape.computed.upperLeftPoint = addCoord(
                      shadowShape.computed.upperLeftPoint,
                      dx,
                      dy
                    )
                    newShape.computed.upperRightPoint = addCoord(
                      shadowShape.computed.upperRightPoint,
                      dx,
                      dy
                    )
                    newShape.computed.lowerLeftPoint = addCoord(
                      shadowShape.computed.lowerLeftPoint,
                      dx,
                      dy
                    )
                    newShape.computed.lowerRightPoint = addCoord(
                      shadowShape.computed.lowerRightPoint,
                      dx,
                      dy
                    )

                    return newShape
                  }

                  if (isCircle(shape) && isCircle(shadowShape)) {
                    const newShape = structuredClone(shape)

                    if (
                      isCircleConstrainedByCenterRadius(newShape) &&
                      isCircleConstrainedByCenterRadius(shadowShape)
                    ) {
                      newShape.constraints.center = addCoord(shadowShape.constraints.center, dx, dy)
                    } else if (
                      isCircleConstrainedByTwoPoints(newShape) &&
                      isCircleConstrainedByTwoPoints(shadowShape)
                    ) {
                      newShape.constraints.point1 = addCoord(shadowShape.constraints.point1, dx, dy)
                      newShape.constraints.point2 = addCoord(shadowShape.constraints.point2, dx, dy)
                    } else if (
                      isCircleConstrainedByTwoPointsRadius(newShape) &&
                      isCircleConstrainedByTwoPointsRadius(shadowShape)
                    ) {
                      newShape.constraints.point1 = addCoord(shadowShape.constraints.point1, dx, dy)
                      newShape.constraints.point2 = addCoord(shadowShape.constraints.point2, dx, dy)
                    }

                    newShape.computed.center = addCoord(shadowShape.computed.center, dx, dy)

                    return newShape
                  }

                  if (isArc(shape) && isArc(shadowShape)) {
                    const newShape = structuredClone(shape)

                    if (
                      isArcConstrainedByCenterTwoPoints(newShape) &&
                      isArcConstrainedByCenterTwoPoints(shadowShape)
                    ) {
                      newShape.constraints.center = addCoord(shadowShape.constraints.center, dx, dy)
                      newShape.constraints.startPoint = addCoord(
                        shadowShape.constraints.startPoint,
                        dx,
                        dy
                      )
                      newShape.constraints.endPoint = addCoord(
                        shadowShape.constraints.endPoint,
                        dx,
                        dy
                      )
                    } else if (
                      isArcConstrainedByThreePoints(newShape) &&
                      isArcConstrainedByThreePoints(shadowShape)
                    ) {
                      newShape.constraints.startPoint = addCoord(
                        shadowShape.constraints.startPoint,
                        dx,
                        dy
                      )
                      newShape.constraints.endPoint = addCoord(
                        shadowShape.constraints.endPoint,
                        dx,
                        dy
                      )
                      newShape.constraints.onLinePoint = addCoord(
                        shadowShape.constraints.onLinePoint,
                        dx,
                        dy
                      )
                    }

                    newShape.computed.center = addCoord(shadowShape.computed.center, dx, dy)
                    newShape.computed.startPoint = addCoord(shadowShape.computed.startPoint, dx, dy)
                    newShape.computed.endPoint = addCoord(shadowShape.computed.endPoint, dx, dy)

                    return newShape
                  }

                  return shape
                } else {
                  return shape
                }
              } else {
                return shape
              }
            })
          })
          set(mouseDownState, mouseDownState => ({
            ...mouseDownState,
            draggedShapeIds: (mouseDownState.draggedShapeIds ?? new Set()).add(targetShapeId),
          }))
        }
      },
    []
  )

  return { dragShape }
}

export default useDrag
