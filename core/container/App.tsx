import React, { useCallback, useEffect, useRef } from 'react'
import ToolWindow from '../component/ToolWindow'

import Canvas from '../component/Canvas'
import { useRecoilCallback } from 'recoil'
import { activeCoordState, shapeSeedConstraintsState, mouseDownState } from './state'
import useKeyboardEvent from './hooks/useKeyboardEvent'
import {
  isShapeType,
  isValidArcCommand,
  isValidCircleCommand,
  isValidLineCommand,
  isValidRectangleCommand,
} from '../lib/typeguard'
import useDrawStep from './hooks/useDrawStep'

import useSelectOperation from './hooks/useSelectOperation'
import useDrag from './hooks/useDrag'
import {
  currentOperatingShapeSelector,
  drawCommandState,
  drawStepState,
  drawTypeState,
  operationModeState,
} from './state/userOperationState'
import {
  dragShadowShapeState,
  selectedShapeIdsState,
  shapeSelectorFamily,
  shapesState,
} from './state/shapeState'
import {
  canUndoSelector,
  currentSnapshotVersionState,
  snapshotsState,
} from './state/snapshotsState'
import { isShowingShortcutKeyHintState } from './state/hintState'
import {
  cursorClientPositionState,
  indicatingShapeIdState,
  pointingCoordState,
} from './state/cursorState'
import useDrawing from './hooks/useDrawing'
import useSnapshotUpdater from './hooks/useSnapshotUpdater'

interface Props {
  onExport?: (data: string) => void
}

const App: React.FC<Props> = ({ onExport }) => {
  const { addKeyListener } = useKeyboardEvent()
  const { goToFirstStep } = useDrawStep()
  const { triggerSelectOperation } = useSelectOperation()
  const { dragShape } = useDrag()
  const { proceedLineDraw, proceedRectangleDraw, proceedCircleDraw, proceedArcDraw } = useDrawing()
  const { addSnapshot } = useSnapshotUpdater()

  const didMountRef = useRef(false)
  const stageRef = useRef<SVGSVGElement>(null)

  const switchToSelect = useRecoilCallback(
    ({ set, reset }) =>
      async () => {
        set(operationModeState, 'select')
        reset(shapeSeedConstraintsState)
        reset(drawCommandState)
      },
    []
  )

  const removeSelectedShape = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const selectedShapeIdList = await snapshot.getPromise(selectedShapeIdsState)
        set(shapesState, oldValue =>
          oldValue.filter(shape => !selectedShapeIdList.includes(shape.id))
        )
        set(selectedShapeIdsState, [])
      },
    []
  )

  const cancelDrawing = useRecoilCallback(
    ({ snapshot, reset }) =>
      async () => {
        const mode = await snapshot.getPromise(operationModeState)

        if (isShapeType(mode)) {
          await goToFirstStep()
          reset(shapeSeedConstraintsState)
        }
      },
    [goToFirstStep]
  )

  const changeOperationMode = useRecoilCallback(
    ({ set }) =>
      async (mode: OperationMode) => {
        if (mode === 'line') {
          set(drawCommandState, 'start-end')
          set(drawStepState, 'startPoint')
        } else if (mode === 'rectangle') {
          set(drawCommandState, 'two-corners')
          set(drawStepState, 'corner-1')
        } else if (mode === 'circle') {
          set(drawCommandState, 'center-diameter')
          set(drawStepState, 'center')
        } else if (mode === 'arc') {
          set(drawCommandState, 'center-two-points')
          set(drawStepState, 'center')
        }

        set(selectedShapeIdsState, [])
        set(operationModeState, mode)
      },
    []
  )

  const switchShapeWithKey = useRecoilCallback(
    ({ snapshot, set, reset }) =>
      async (shapeKey: string) => {
        const mode = await snapshot.getPromise(operationModeState)
        switch (shapeKey) {
          case 'l':
            if (mode !== 'line') {
              await changeOperationMode('line')
            }
            break
          case 'e':
            if (mode !== 'arc') {
              await changeOperationMode('arc')
            }
            break
          case 'c':
            if (mode !== 'circle') {
              await changeOperationMode('circle')
            }
            break
          default:
            // noop
            break
        }
      },
    [changeOperationMode]
  )

  const showShortcutKeyHint = useRecoilCallback(
    ({ set }) =>
      async () => {
        set(isShowingShortcutKeyHintState, true)
      },
    []
  )

  const hideShortcutKeyHint = useRecoilCallback(
    ({ set }) =>
      async () => {
        set(isShowingShortcutKeyHintState, false)
      },
    []
  )

  const undo = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const canUndo = await snapshot.getPromise(canUndoSelector)
        const currentSnapshotVersion = await snapshot.getPromise(currentSnapshotVersionState)

        if (!canUndo) {
          console.warn('Few snapshots. Cannot undo.')
        } else if (currentSnapshotVersion === null) {
          console.warn('currentSnapshotVersion is null. Cannot undo.')
        } else if (currentSnapshotVersion === 0) {
          console.warn('currentSnapshotVersion is 0. Cannot undo.')
        } else {
          const rollbackTargetSnapshot = (await snapshot.getPromise(snapshotsState))[
            currentSnapshotVersion - 1
          ]

          set(shapesState, Array.from(rollbackTargetSnapshot.shapes))
          set(currentSnapshotVersionState, currentSnapshotVersion - 1)
        }
      },
    []
  )

  useEffect(() => {
    if (didMountRef.current) {
      return
    }

    didMountRef.current = true

    addKeyListener('switchToSelect', switchToSelect)
    addKeyListener('cancelDrawing', cancelDrawing)
    addKeyListener('remove', removeSelectedShape)
    addKeyListener('shapeSwitch', switchShapeWithKey)
    addKeyListener('showHint', showShortcutKeyHint)
    addKeyListener('hideHint', hideShortcutKeyHint)
    addKeyListener('undo', undo)
  }, [
    addKeyListener,
    removeSelectedShape,
    cancelDrawing,
    switchShapeWithKey,
    showShortcutKeyHint,
    hideShortcutKeyHint,
    switchToSelect,
    undo,
  ])

  const handleMouseDown = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const activeCoord = await snapshot.getPromise(activeCoordState)
        const pointingCoord = await snapshot.getPromise(pointingCoordState)
        const indicatingShapeId = await snapshot.getPromise(indicatingShapeIdState)

        set(mouseDownState, {
          isClicking: true,
          activeCoordWhenMouseDown: activeCoord,
          pointingCoordWhenMouseDown: pointingCoord,
          targetShapeId: indicatingShapeId,
          draggedShapeIds: new Set<number>(),
        })

        if (indicatingShapeId !== null) {
          const indicatingShape = await snapshot.getPromise(shapeSelectorFamily(indicatingShapeId))
          const shadowShape = structuredClone(indicatingShape)
          shadowShape.type = 'dragShadow'
          set(dragShadowShapeState, currVal => [...currVal, shadowShape])
        }
      },
    []
  )

  const handleMouseUp = useRecoilCallback(
    ({ snapshot, set }) =>
      async (event: React.MouseEvent) => {
        const pointingCoord = await snapshot.getPromise(pointingCoordState)
        const operationMode = await snapshot.getPromise(operationModeState)
        const { pointingCoordWhenMouseDown, draggedShapeIds } = await snapshot.getPromise(
          mouseDownState
        )

        if (pointingCoord !== null && pointingCoordWhenMouseDown !== null) {
          if (
            pointingCoord.x === pointingCoordWhenMouseDown.x &&
            pointingCoord.y === pointingCoordWhenMouseDown.y
          ) {
            // マウスを押下した時と離した時の座標が同じ場合、ドラッグではなく通常のクリックであるとみなし
            // 操作モードに応じた処理を実行する

            switch (operationMode) {
              case 'line':
                await proceedLineDraw()
                break
              case 'rectangle':
                await proceedRectangleDraw()
                break
              case 'circle':
                await proceedCircleDraw()
                break
              case 'arc':
                await proceedArcDraw()
                break
              case 'select':
                await triggerSelectOperation()
                break
            }
          } else {
            // マウスを押下した時と離した時の座標が異なる場合、ドラッグを実行したものとみなしスナップショットを追加する
            if (draggedShapeIds?.size) {
              const shapes = await snapshot.getPromise(shapesState)

              if (draggedShapeIds.size === 1) {
                const draggedShape = await snapshot.getPromise(
                  shapeSelectorFamily(Array.from(draggedShapeIds)[0])
                )

                switch (draggedShape.shape) {
                  case 'line':
                    await addSnapshot(shapes, 'move-line')
                    break
                  case 'circle':
                    await addSnapshot(shapes, 'move-circle')
                    break
                  case 'rectangle':
                    await addSnapshot(shapes, 'move-rectangle')
                    break
                  case 'arc':
                    await addSnapshot(shapes, 'move-arc')
                    break
                }
              } else {
                // await addSnapshot(shapes, '')
              }
            }
          }
        }

        set(mouseDownState, {
          isClicking: false,
          activeCoordWhenMouseDown: null,
          pointingCoordWhenMouseDown: null,
          targetShapeId: null,
          draggedShapeIds: null,
        })
        set(dragShadowShapeState, [])
      },
    [
      addSnapshot,
      proceedArcDraw,
      proceedCircleDraw,
      proceedLineDraw,
      proceedRectangleDraw,
      triggerSelectOperation,
    ]
  )

  const convertDomCoordToSvgCoord = useCallback((domCoord: Coordinate): Coordinate | null => {
    const stage = stageRef.current
    if (stage === null) {
      return null
    }

    const point = stage.createSVGPoint()
    point.x = domCoord.x
    point.y = domCoord.y

    const domMatrix = stage.getScreenCTM()
    if (domMatrix === null) {
      return null
    }

    const { x, y } = point.matrixTransform(domMatrix.inverse())
    return { x, y }
  }, [])

  const handleMouseMove = useRecoilCallback(
    ({ snapshot, set }) =>
      async (event: React.MouseEvent) => {
        const clientPosition = { x: event.clientX, y: event.clientY }
        set(cursorClientPositionState, clientPosition)
        set(pointingCoordState, convertDomCoordToSvgCoord(clientPosition))

        const mouseDown = await snapshot.getPromise(mouseDownState)
        if (mouseDown.isClicking && mouseDown.targetShapeId !== null) {
          await dragShape()
        }
      },
    [convertDomCoordToSvgCoord, dragShape]
  )

  const exportAsSvg = useCallback(() => {
    if (!stageRef.current) {
      return
    }

    const serializer = new XMLSerializer()
    let source = serializer.serializeToString(stageRef.current)
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source

    if (onExport) {
      onExport(source)
    } else {
      const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source)
      const anchor = document.createElement('a')
      anchor.download = 'exported.svg'
      anchor.href = url
      anchor.click()
      anchor.remove()
    }
  }, [onExport])

  const changeDrawCommand = useRecoilCallback(
    ({ set }) =>
      async (newDrawType: DrawType) => {
        set(drawTypeState, newDrawType)
      },
    []
  )

  const changeCommand = useRecoilCallback(
    ({ snapshot, set }) =>
      async (newCommand: string) => {
        const currentOperatingShape = await snapshot.getPromise(currentOperatingShapeSelector)

        if (
          (currentOperatingShape === 'line' && isValidLineCommand(newCommand)) ||
          (currentOperatingShape === 'rectangle' && isValidRectangleCommand(newCommand)) ||
          (currentOperatingShape === 'circle' && isValidCircleCommand(newCommand)) ||
          (currentOperatingShape === 'arc' && isValidArcCommand(newCommand))
        ) {
          set(drawCommandState, newCommand)
          await goToFirstStep()
        } else {
          throw new Error(
            `Invalid shape and command combination: ${currentOperatingShape} & ${newCommand}`
          )
        }
      },
    [goToFirstStep]
  )

  return (
    <>
      <Canvas
        stageRef={stageRef}
        onMouseDown={handleMouseDown}
        onMouseup={handleMouseUp}
        onMouseMove={handleMouseMove}
      />
      <ToolWindow
        changeDrawType={useCallback(changeDrawCommand, [changeDrawCommand])}
        changeCommand={changeCommand}
        changeShape={useCallback(newShape => changeOperationMode(newShape), [changeOperationMode])}
        onActivateShapeSelect={useCallback(
          () => changeOperationMode('select'),
          [changeOperationMode]
        )}
        onUndo={undo}
        onClickExportButton={exportAsSvg}
        showShortcutKeyHint={showShortcutKeyHint}
        hideShortcutKeyHint={hideShortcutKeyHint}
      />
    </>
  )
}

export default App
