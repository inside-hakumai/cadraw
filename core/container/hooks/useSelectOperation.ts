import { useRecoilCallback } from 'recoil'
import { indicatingShapeIdState, selectedShapeIdsState } from '../states'

const useSelectOperation = () => {
  const triggerSelectOperation = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const indicatingShapeId = await snapshot.getPromise(indicatingShapeIdState)

        if (indicatingShapeId !== null) {
          set(selectedShapeIdsState, oldValue => {
            if (oldValue.includes(indicatingShapeId)) {
              return oldValue.filter(id => id !== indicatingShapeId)
            } else {
              return [...oldValue, indicatingShapeId]
            }
          })
        }
      },
    []
  )

  return { triggerSelectOperation }
}

export default useSelectOperation
