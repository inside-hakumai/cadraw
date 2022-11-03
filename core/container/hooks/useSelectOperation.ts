import { useRecoilCallback } from 'recoil'
import {
  indicatingShapeIdState,
  isClickingState,
  selectedShapeIdsState,
  shapeSelectorFamily,
} from '../states'
import { cloneShape } from '../../lib/function'

const useSelectOperation = () => {
  const triggerSelectOperation = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const indicatingShapeId = await snapshot.getPromise(indicatingShapeIdState)

        if (indicatingShapeId !== null) {
          const indicatingShape = await snapshot.getPromise(shapeSelectorFamily(indicatingShapeId))

          set(selectedShapeIdsState, oldValue => {
            if (oldValue.includes(indicatingShapeId)) {
              return oldValue.filter(id => id !== indicatingShapeId)
            } else {
              return [...oldValue, indicatingShapeId]
            }
          })

          set(isClickingState, state => ({
            ...state,
            draggingShapeOriginalData: (state.draggingShapeOriginalData ?? new Map()).set(
              indicatingShapeId,
              cloneShape(indicatingShape)
            ),
          }))
        }
      },
    []
  )

  return { triggerSelectOperation }
}

export default useSelectOperation
