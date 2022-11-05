import { useRecoilCallback } from 'recoil'
import { currentSnapshotVersionState, snapshotsState } from '../state/snapshotsState'

const useSnapshotUpdater = () => {
  const addSnapshot = useRecoilCallback(
    ({ snapshot, set }) =>
      async (shapes: Shape[], operation: DrawOperation) => {
        const currentSnapshotVersion = await snapshot.getPromise(currentSnapshotVersionState)

        set(snapshotsState, oldState => {
          // 新しい図形を追加する時、最新のスナップショットが表示に反映されている場合は
          // 既存のスナップショットリストの末尾に新規にスナップショットを追加するだけだが、
          // 元に戻す操作をして古いスナップショットが表示に反映されている場合は
          // 反映中のスナップショットより新しいスナップショットを削除してから新しいスナップショットを末尾に追加する
          return [
            ...oldState.slice(0, currentSnapshotVersion + 1),
            {
              lastOperation: operation,
              shapes: shapes,
            },
          ]
        })
        set(currentSnapshotVersionState, oldState => oldState + 1)
      },
    []
  )

  return { addSnapshot }
}

export default useSnapshotUpdater
