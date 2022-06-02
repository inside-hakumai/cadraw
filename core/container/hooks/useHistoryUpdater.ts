import { useRecoilSnapshot, useRecoilState, useRecoilValue } from 'recoil'
import { canUndoSelector, currentSnapshotVersionState, snapshotsState } from '../states'
import { useCallback, useEffect, useRef } from 'react'

/**
 * 図形の追加・削除などの操作履歴に関連するスナップショットを追加するためのカスタムフックです。
 */
const useHistoryUpdater = () => {
  const _snapshot = useRecoilSnapshot()

  const [_snapshots, setSnapshots] = useRecoilState(snapshotsState)
  const [_currentSnapshotVersion, setCurrentSnapshotVersion] = useRecoilState(
    currentSnapshotVersionState
  )

  const _canUndo = useRecoilValue(canUndoSelector)

  const addSnapshot = useCallback(() => {
    const snapshot = snapshotRef.current
    const snapshots = snapshotsRef.current
    const currentSnapshotVersion = currentSnapshotVersionRef.current

    const isShapeUpdated = Array.from(snapshot.getNodes_UNSTABLE({ isModified: true })).some(
      node => node.key === 'shapeIds'
    )

    if (isShapeUpdated && snapshots.every(s => s.getID() !== snapshot.getID())) {
      // TODO: 参照されなくなったsnapshotのrelease
      snapshot.retain()
      const newSnapshotVersion = currentSnapshotVersion === null ? 0 : currentSnapshotVersion + 1

      console.debug(`Added snapshot: ID = ${snapshot.getID()}, version = ${newSnapshotVersion}`)
      setSnapshots(oldValue => {
        if (oldValue.length === newSnapshotVersion) {
          // 新しいsnapshotVersionの場合
          return [...oldValue, snapshot]
        } else if (oldValue.length > newSnapshotVersion) {
          // undoした場合など、同じsnapshotVersionが存在し、過去の履歴を上書きする場合
          const tmp = [...oldValue]
          tmp[newSnapshotVersion] = snapshot
          return tmp
        } else {
          throw new Error(
            `Unexpected snapshot version: ${newSnapshotVersion}, snapshot length = ${oldValue.length}`
          )
        }
      })
      setCurrentSnapshotVersion(newSnapshotVersion)
    }
  }, [setCurrentSnapshotVersion, setSnapshots])

  const snapshotRef = useRef(_snapshot)
  useEffect(() => {
    snapshotRef.current = _snapshot
    addSnapshot()
  }, [_snapshot, addSnapshot])

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

  const initializeHistory = useCallback(() => {
    const snapshot = snapshotRef.current

    setSnapshots([snapshot])
    setCurrentSnapshotVersion(0)
  }, [setCurrentSnapshotVersion, setSnapshots])

  return {
    initializeHistory,
    addSnapshot,
  }
}

export default useHistoryUpdater
