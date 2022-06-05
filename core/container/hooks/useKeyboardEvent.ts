import { useCallback, useEffect, useRef } from 'react'
import { useRecoilValue } from 'recoil'
import { operationModeState } from '../states'
import useHistory from './useHistory'

type eventList = 'remove' | 'escape' | 'shapeSwitch'
interface CallbackTypeList {
  remove: (() => void | Promise<void>) | null
  escape: (() => void | Promise<void>) | null
  shapeSwitch: ((shapeIndex: number) => void | Promise<void>) | null
}
type EventCallbackType<T extends eventList> = CallbackTypeList[T]

/**
 * キー操作をキャプチャして処理を行うカスタムフックです。
 */
const useKeyboardEvent = () => {
  const { undo } = useHistory()

  const operationMode = useRecoilValue(operationModeState)

  const keyLister = useRef<CallbackTypeList>({
    remove: null,
    escape: null,
    shapeSwitch: null,
  })

  // operationModeの更新を検知して値を取得する
  const operationModeRef = useRef(operationMode)
  useEffect(() => {
    operationModeRef.current = operationMode
  }, [operationMode])

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
          const listener = keyLister.current['escape']
          if (listener) listener()
          break
        }
        case 'Backspace':
        case 'Delete': {
          const listener = keyLister.current['remove']
          if (listener) listener()
          break
        }
        case '1':
        case '2':
        case '3':
        case '4': {
          const listener = keyLister.current['shapeSwitch']
          if (listener) listener(parseInt(e.key))
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
