import { useRecoilCallback } from 'recoil'
import { activeCoordState, mouseDownState } from '../state'
import { isLine } from '../../lib/typeguard'
import { cloneShape } from '../../lib/function'
import { dragShadowShapeState, shapesState } from '../state/shapeState'

const useDrag = () => {
  const dragShape = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const { isClicking, activeCoordWhenMouseDown, targetShapeId } = await snapshot.getPromise(
          mouseDownState
        )
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
                    const newShape = cloneShape(shape)
                    const originalLine = shadowShape as Line
                    newShape.constraints.startPoint.x = originalLine.constraints.startPoint.x + dx
                    newShape.constraints.startPoint.y = originalLine.constraints.startPoint.y + dy
                    newShape.constraints.endPoint.x = originalLine.constraints.endPoint.x + dx
                    newShape.constraints.endPoint.y = originalLine.constraints.endPoint.y + dy
                    newShape.computed.startPoint.x = originalLine.computed.startPoint.x + dx
                    newShape.computed.startPoint.y = originalLine.computed.startPoint.y + dy
                    newShape.computed.endPoint.x = originalLine.computed.endPoint.x + dx
                    newShape.computed.endPoint.y = originalLine.computed.endPoint.y + dy

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
        }
      },
    []
  )

  return { dragShape }
}

export default useDrag
