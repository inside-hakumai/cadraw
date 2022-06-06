import { useCallback, useEffect, useRef } from 'react'
import { useRecoilValue } from 'recoil'
import { temporaryShapeConstraintsState } from '../states'
import useHistory from './useHistory'

type eventList = 'switchToSelect' | 'cancelDrawing' | 'remove' | 'shapeSwitch'
interface CallbackTypeList {
  switchToSelect: (() => void | Promise<void>) | null
  cancelDrawing: (() => void | Promise<void>) | null
  remove: (() => void | Promise<void>) | null
  shapeSwitch: ((shapeKey: string) => void | Promise<void>) | null
}
type EventCallbackType<T extends eventList> = CallbackTypeList[T]

/**
 * キー操作をキャプチャして処理を行うカスタムフックです。
 */
const useKeyboardEvent = () => {
  const { undo } = useHistory()

  const temporaryShapeConstraints = useRecoilValue(temporaryShapeConstraintsState)

  const keyLister = useRef<CallbackTypeList>({
    switchToSelect: null,
    cancelDrawing: null,
    remove: null,
    shapeSwitch: null,
  })

  // temporaryShapeConstraintsの更新を検知して値を取得する
  const temporaryShapeConstraintsRef = useRef(temporaryShapeConstraints)
  useEffect(() => {
    temporaryShapeConstraintsRef.current = temporaryShapeConstraints
  }, [temporaryShapeConstraints])

  const addKeyListener = useCallback(
    <T extends eventList>(event: T, callback: EventCallbackType<T>) => {
      keyLister.current[event] = callback
    },
    []
  )

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      console.debug(`Key pressed: ${e.key} Meta: ${e.metaKey} `)

      switch (e.key) {
        case 'Escape': {
          if (temporaryShapeConstraintsRef.current === null) {
            const listener = keyLister.current['switchToSelect']
            if (listener) listener()
          } else {
            const listener = keyLister.current['cancelDrawing']
            if (listener) listener()
          }
          break
        }
        case 'Backspace':
        case 'Delete': {
          const listener = keyLister.current['remove']
          if (listener) listener()
          break
        }
        case 's':
        case 'l':
        case 'e':
        case 'c': {
          const listener = keyLister.current['shapeSwitch']
          if (listener) listener(e.key)
          break
        }
        case 'z': {
          if (e.metaKey) {
            undo()
          }
          break
        }
        default:
        // noop
      }
    },
    [undo]
  )

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  return { addKeyListener }
}

export default useKeyboardEvent
