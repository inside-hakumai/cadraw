import { useCallback, useEffect, useRef } from 'react'
import { useRecoilState, useResetRecoilState } from 'recoil'
import { operationModeState, temporaryShapeBaseState } from './states'

/**
 * キー操作をキャプチャして処理を行うカスタムフックです。
 */
const useKeyboardEvent = () => {
  const [operationMode, setOperationMode] = useRecoilState(operationModeState)
  const resetTemporaryShapeBase = useResetRecoilState(temporaryShapeBaseState)

  // operationModeの更新を検知して値を取得する
  const operationModeRef = useRef(operationMode)
  useEffect(() => {
    operationModeRef.current = operationMode
  }, [operationMode])

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    console.debug(`Key pressed: ${e.key}`)

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
  }, [])
}

export default useKeyboardEvent