import { useRecoilCallback } from 'recoil'
import { activeCoordState, isClickingState, selectedShapeIdsState, shapesState } from '../states'
import { isLine } from '../../lib/typeguard'
import { cloneShape } from '../../lib/function'

const useDrag = () => {
  const dragShape = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const { isClicking, activeCoordWhenMouseDown, draggingShapeOriginalData } =
          await snapshot.getPromise(isClickingState)
        const selectedShapeIds = await snapshot.getPromise(selectedShapeIdsState)
        const activeCoord = await snapshot.getPromise(activeCoordState)

        console.debug(
          isClicking,
          activeCoordWhenMouseDown,
          draggingShapeOriginalData,
          selectedShapeIds,
          activeCoord
        )

        if (
          isClicking &&
          activeCoordWhenMouseDown !== null &&
          draggingShapeOriginalData !== null &&
          selectedShapeIds.length > 0 &&
          activeCoord !== null
        ) {
          const dx = activeCoord.x - activeCoordWhenMouseDown.x
          const dy = activeCoord.y - activeCoordWhenMouseDown.y
          console.debug(`dragShape: dx: ${dx}, dy: ${dy}`)

          set(shapesState, shapes => {
            return shapes.map(shape => {
              if (selectedShapeIds.includes(shape.id)) {
                const originalShape = draggingShapeOriginalData.get(shape.id)

                if (originalShape !== undefined) {
                  console.debug(shape)
                  if (isLine(shape)) {
                    const newShape = cloneShape(shape)
                    const originalLine = originalShape as Line
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
