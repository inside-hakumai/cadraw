import { useCallback, useEffect, useRef } from 'react'
import { useRecoilValue } from 'recoil'
import { temporaryShapeConstraintsState } from '../states'

type eventList =
  | 'switchToSelect'
  | 'cancelDrawing'
  | 'remove'
  | 'shapeSwitch'
  | 'showHint'
  | 'hideHint'
  | 'undo'
interface CallbackTypeList {
  switchToSelect: (() => void | Promise<void>) | null
  cancelDrawing: (() => void | Promise<void>) | null
  remove: (() => void | Promise<void>) | null
  shapeSwitch: ((shapeKey: string) => void | Promise<void>) | null
  showHint: (() => void | Promise<void>) | null
  hideHint: (() => void | Promise<void>) | null
  undo: (() => void | Promise<void>) | null
}
type EventCallbackType<T extends eventList> = CallbackTypeList[T]

/**
 * キー操作をキャプチャして処理を行うカスタムフックです。
 */
const useKeyboardEvent = () => {
  const temporaryShapeConstraints = useRecoilValue(temporaryShapeConstraintsState)

  const keyLister = useRef<CallbackTypeList>({
    switchToSelect: null,
    cancelDrawing: null,
    remove: null,
    shapeSwitch: null,
    showHint: null,
    hideHint: null,
    undo: null,
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

  const onKeyDown = useCallback((e: KeyboardEvent) => {
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
      case 'h': {
        const listener = keyLister.current['showHint']
        if (listener) listener()
        break
      }
      case 'z': {
        if (e.metaKey) {
          const listener = keyLister.current['undo']
          if (listener) listener()
        }
        break
      }
      default:
      // noop
    }
  }, [])

  const onKeyRelease = useCallback((e: KeyboardEvent) => {
    console.debug(`Key released: ${e.key} Meta: ${e.metaKey} `)

    switch (e.key) {
      case 'h': {
        const listener = keyLister.current['hideHint']
        if (listener) listener()
        break
      }
      default:
      // noop
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyRelease)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyRelease)
    }
  }, [onKeyDown, onKeyRelease])

  return { addKeyListener }
}

export default useKeyboardEvent
