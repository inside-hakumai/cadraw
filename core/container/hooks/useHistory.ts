import {
  useGotoRecoilSnapshot,
  useRecoilSnapshot,
  useRecoilValue,
  useResetRecoilState,
} from 'recoil'
import {
  canUndoSelector,
  currentSnapshotVersionState,
  pointingCoordState,
  snapshotsState,
} from '../states'
import { useCallback, useEffect, useRef } from 'react'

/**
 * 図形の追加・削除などの操作履歴に関連する操作を行うためのカスタムフックです。
 */
const useHistory = () => {
  const _snapshot = useRecoilSnapshot()
  const gotoSnapshot = useGotoRecoilSnapshot()

  const _snapshots = useRecoilValue(snapshotsState)
  const _currentSnapshotVersion = useRecoilValue(currentSnapshotVersionState)
  const _canUndo = useRecoilValue(canUndoSelector)

  const resetPointingCoord = useResetRecoilState(pointingCoordState)

  const snapshotRef = useRef(_snapshot)
  useEffect(() => {
    snapshotRef.current = _snapshot
  }, [_snapshot])

  const snapshotsRef = useRef(_snapshots)
  useEffect(() => {
    snapshotsRef.current = _snapshots
  }, [_snapshots])

  const currentSnapshotVersionRef = useRef(_currentSnapshotVersion)
  useEffect(() => {
    currentSnapshotVersionRef.current = _currentSnapshotVersion
  }, [_currentSnapshotVersion])

  const canUndoRef = useRef(_canUndo)
  useEffect(() => {
    canUndoRef.current = _canUndo
  }, [_canUndo])

  const undo = useCallback(() => {
    const canUndo = canUndoRef.current
    const snapshots = snapshotsRef.current
    const currentSnapshotVersion = currentSnapshotVersionRef.current

    if (!canUndo) {
      console.warn('Few snapshots. Cannot undo.')
    } else if (currentSnapshotVersion === null) {
      console.warn('currentSnapshotVersion is null. Cannot undo.')
    } else if (currentSnapshotVersion === 0) {
      console.warn('currentSnapshotVersion is 0. Cannot undo.')
    } else {
      gotoSnapshot(snapshots[currentSnapshotVersion - 1])
      resetPointingCoord()
    }
  }, [])

  return {
    undo,
  }
}

export default useHistory
