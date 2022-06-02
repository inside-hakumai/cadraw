import { useCallback, useEffect, useRef } from 'react'
import { useRecoilState, useResetRecoilState } from 'recoil'
import { operationModeState, temporaryShapeConstraintsState } from '../states'
import useHistory from './useHistory'

type eventList = 'remove'

/**
 * キー操作をキャプチャして処理を行うカスタムフックです。
 */
const useKeyboardEvent = () => {
  const { undo } = useHistory()

  const [operationMode, setOperationMode] = useRecoilState(operationModeState)
  const resetTemporaryShapeBase = useResetRecoilState(temporaryShapeConstraintsState)

  const keyLister = useRef<{ [key in eventList]: ((event: KeyboardEvent) => void) | null }>({
    remove: null,
  })

  // operationModeの更新を検知して値を取得する
  const operationModeRef = useRef(operationMode)
  useEffect(() => {
    operationModeRef.current = operationMode
  }, [operationMode])

  const addKeyListener = useCallback((event: eventList, callback: () => void) => {
    keyLister.current[event] = callback
  }, [])

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      console.debug(`Key pressed: ${e.key} Meta: ${e.metaKey} `)

      // 図形の描画中の場合は描画中の図形を破棄する
      if (e.key === 'Escape') {
        switch (operationModeRef.current) {
          case 'circle:fix-radius':
            setOperationMode('circle:point-center')
            resetTemporaryShapeBase()
            break
          case 'line:point-end':
            setOperationMode('line:point-start')
            resetTemporaryShapeBase()
            break
          default:
            // noop
            break
        }
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        const listener = keyLister.current['remove']
        if (listener) {
          listener(e)
        }
      }

      if (e.metaKey && e.key === 'z') {
        undo()
      }
    },
    [resetTemporaryShapeBase, setOperationMode, undo]
  )

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  return { addKeyListener }
}

export default useKeyboardEvent
