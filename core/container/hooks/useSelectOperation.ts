import { useRecoilCallback } from 'recoil'
import { mouseDownState } from '../state'
import { cloneShape } from '../../lib/function'
import { selectedShapeIdsState, shapeSelectorFamily } from '../state/shapeState'
import { indicatingShapeIdState } from '../state/cursorState'

const useSelectOperation = () => {
  const triggerSelectOperation = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const indicatingShapeId = await snapshot.getPromise(indicatingShapeIdState)

        // ポインタが図形を指していない場合は何もしない
        if (indicatingShapeId === null) {
          return
        }

        const indicatingShape = await snapshot.getPromise(shapeSelectorFamily(indicatingShapeId))

        set(selectedShapeIdsState, oldValue => {
          if (oldValue.includes(indicatingShapeId)) {
            return oldValue.filter(id => id !== indicatingShapeId)
          } else {
            return [...oldValue, indicatingShapeId]
          }
        })

        set(mouseDownState, state => ({
          ...state,
          draggingShapeOriginalData: (state.draggingShapeOriginalData ?? new Map()).set(
            indicatingShapeId,
            cloneShape(indicatingShape)
          ),
        }))
      },
    []
  )

  return { triggerSelectOperation }
}

export default useSelectOperation
