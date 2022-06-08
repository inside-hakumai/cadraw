import React, { useCallback, useEffect, useRef } from 'react'
import ToolWindow from '../component/ToolWindow'

import Canvas from '../component/Canvas'
import { useRecoilCallback, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  activeCoordState,
  cursorClientPositionState,
  drawCommandState,
  drawStepState,
  indicatingShapeIdState,
  isShowingShortcutKeyHintState,
  operationModeState,
  pointingCoordState,
  selectedShapeIdsState,
  shapeIdsState,
  shapesSelector,
  shapeStateFamily,
  temporaryShapeConstraintsState,
  temporaryShapeState,
} from './states'
import useKeyboardEvent from './hooks/useKeyboardEvent'
import useHistory from './hooks/useHistory'
import useHistoryUpdater from './hooks/useHistoryUpdater'
import { isTemporaryArcCenter, isTemporaryArcShape } from '../lib/typeguard'
import useDrawStep from './hooks/useDrawStep'

interface Props {
  onExport?: (data: string) => void
}

const App: React.FC<Props> = ({ onExport }) => {
  const { addKeyListener } = useKeyboardEvent()
  const { initializeHistory } = useHistoryUpdater()
  const { undo } = useHistory()
  const { goToNextStep, goToFirstStep } = useDrawStep()

  const [operationMode, setOperationMode] = useRecoilState(operationModeState)
  const [drawCommand, setDrawCommand] = useRecoilState(drawCommandState)
  const [drawStep, setDrawStep] = useRecoilState(drawStepState)

  const temporaryShape = useRecoilValue(temporaryShapeState)
  const activeCoord = useRecoilValue(activeCoordState)
  const shapes = useRecoilValue(shapesSelector)
  const indicatingShapeId = useRecoilValue(indicatingShapeIdState)

  const setCursorClientPosition = useSetRecoilState(cursorClientPositionState)
  const setTemporaryShapeConstraints = useSetRecoilState(temporaryShapeConstraintsState)
  const setPointingCoord = useSetRecoilState(pointingCoordState)
  const setSelectedShapeIds = useSetRecoilState(selectedShapeIdsState)
  // const setDebugCoord = useSetRecoilState(debugCoordState)

  const didMountRef = useRef(false)
  const stageRef = useRef<SVGSVGElement>(null)

  const setShape = useRecoilCallback(
    ({ set }) =>
      async (shape: Shape) => {
        set(shapeIdsState, oldValue => [...oldValue, shape.id])
        set(shapeStateFamily(shape.id), shape)
      },
    []
  )

  const switchToSelect = useRecoilCallback(
    ({ set, reset }) =>
      async () => {
        set(operationModeState, 'select')
        reset(temporaryShapeConstraintsState)
      },
    []
  )

  const removeSelectedShape = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const selectedShapeIdList = await snapshot.getPromise(selectedShapeIdsState)
        set(shapeIdsState, oldValue => oldValue.filter(id => !selectedShapeIdList.includes(id)))
        for (const shapeId of selectedShapeIdList) {
          set(shapeStateFamily(shapeId), undefined)
        }
        set(selectedShapeIdsState, [])
      },
    []
  )

  const cancelDrawing = useRecoilCallback(
    ({ snapshot, set, reset }) =>
      async () => {
        const mode = await snapshot.getPromise(operationModeState)
        const command = await snapshot.getPromise(drawCommandState)

        if (mode === 'line') {
          const lineCommand = command as DrawCommandMap['line']
          if (lineCommand === 'start-end') {
            set(drawStepState, 'startPoint')
            reset(temporaryShapeConstraintsState)
          }
        }

        if (mode === 'circle') {
          const circleCommand = command as DrawCommandMap['circle']

          if (circleCommand === 'center-diameter') {
            set(drawStepState, 'center')
            reset(temporaryShapeConstraintsState)
          }
        }

        if (mode === 'arc') {
          const arcCommand = command as DrawCommandMap['arc']

          if (arcCommand === 'center-two-points') {
            set(drawStepState, 'center')
            reset(temporaryShapeConstraintsState)
          }
        }

        if (mode === 'supplementalLine') {
          const supplementalLineCommand = command as DrawCommandMap['supplementalLine']

          if (supplementalLineCommand === 'start-end') {
            set(drawStepState, 'startPoint')
            reset(temporaryShapeConstraintsState)
          }
        }
      },
    []
  )

  const switchShapeWithKey = useRecoilCallback(
    ({ snapshot, set, reset }) =>
      async (shapeKey: string) => {
        const mode = await snapshot.getPromise(operationModeState)
        switch (shapeKey) {
          case 's':
            if (mode !== 'supplementalLine') {
              await changeOperationMode('supplementalLine')
            }
            break
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
    []
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

  useEffect(() => {
    if (didMountRef.current) {
      return
    }

    didMountRef.current = true

    initializeHistory()
    addKeyListener('switchToSelect', switchToSelect)
    addKeyListener('cancelDrawing', cancelDrawing)
    addKeyListener('remove', removeSelectedShape)
    addKeyListener('shapeSwitch', switchShapeWithKey)
    addKeyListener('showHint', showShortcutKeyHint)
    addKeyListener('hideHint', hideShortcutKeyHint)
  }, [
    addKeyListener,
    initializeHistory,
    removeSelectedShape,
    cancelDrawing,
    switchShapeWithKey,
    showShortcutKeyHint,
    hideShortcutKeyHint,
    switchToSelect,
  ])

  const addShape = async (newShapeSeed: ShapeSeed) => {
    const newShape: Shape = {
      ...newShapeSeed,
      id: shapes.length,
    }
    await setShape(newShape)
  }

  const handleMouseDown = async () => {
    if (activeCoord === null) {
      return
    }

    if (operationMode === 'line') {
      const lineDrawCommand = drawCommand as ShapeDrawCommand<'line'>

      if (lineDrawCommand === 'start-end') {
        const lineDrawStep = drawStep as DrawCommandSteps<'line', 'start-end'>

        if (lineDrawStep === 'startPoint') {
          setTemporaryShapeConstraints({
            type: 'tmp-line',
            start: { x: activeCoord.x, y: activeCoord.y },
          } as TemporaryLineShapeBase)
          await goToNextStep()
        }

        if (lineDrawStep === 'endPoint') {
          const temporaryLineShape = temporaryShape as TemporaryLineShape

          const newLineSeed: LineShapeSeed = {
            type: 'line',
            start: { x: temporaryLineShape.start.x, y: temporaryLineShape.start.y },
            end: { x: temporaryLineShape.end.x, y: temporaryLineShape.end.y },
          }

          await addShape(newLineSeed)
          setTemporaryShapeConstraints(null)
          await goToFirstStep()
        }
      }
    }

    if (operationMode === 'circle') {
      const circleDrawCommand = drawCommand as ShapeDrawCommand<'circle'>

      if (circleDrawCommand === 'center-diameter') {
        const circleDrawStep = drawStep as DrawCommandSteps<'circle', 'center-diameter'>

        if (circleDrawStep === 'center') {
          setTemporaryShapeConstraints({
            type: 'tmp-circle',
            center: { x: activeCoord.x, y: activeCoord.y },
          } as TemporaryCircleShapeBase)
          await goToNextStep()
        }

        if (circleDrawStep === 'diameter') {
          const temporaryCircleShape = temporaryShape as TemporaryCircleShape

          const { center, radius } = temporaryCircleShape

          const newCircleSeed: CircleShapeSeed = {
            type: 'circle',
            center,
            radius,
          }

          await addShape(newCircleSeed)
          setTemporaryShapeConstraints(null)
          await goToFirstStep()
        }
      }
    }

    if (operationMode === 'arc') {
      const arcDrawCommand = drawCommand as ShapeDrawCommand<'arc'>

      if (arcDrawCommand === 'center-two-points') {
        const arcDrawStep = drawStep as DrawCommandSteps<'arc', 'center-two-points'>

        if (arcDrawStep === 'center') {
          const newValue: TemporaryArcCenter = {
            type: 'tmp-arc',
            center: { x: activeCoord.x, y: activeCoord.y },
          }
          setTemporaryShapeConstraints(newValue)
          await goToNextStep()
        }

        if (arcDrawStep === 'startPoint') {
          const temporaryArcRadius = temporaryShape as TemporaryArcRadius
          setTemporaryShapeConstraints(oldValue => {
            if (!isTemporaryArcCenter(oldValue)) {
              console.warn('temporaryShape is not TemporaryArcRadius')
              return null
            }

            const newValue: TemporaryArcRadius = {
              ...oldValue,
              radius: temporaryArcRadius.radius,
              startAngle: temporaryArcRadius.startAngle,
              startCoord: temporaryArcRadius.startCoord,
            }

            return newValue
          })
          await goToNextStep()
        }

        if (arcDrawStep === 'endPoint') {
          if (!isTemporaryArcShape(temporaryShape)) {
            console.warn('temporaryShape is not TemporaryArcShape')
            return
          }

          const newArcSeed: ArcShapeSeed = {
            ...temporaryShape,
            type: 'arc',
          }

          await addShape(newArcSeed)
          setTemporaryShapeConstraints(null)
          await goToFirstStep()
        }
      }
    }

    if (operationMode === 'supplementalLine') {
      const supplementalLineDrawCommand = drawCommand as ShapeDrawCommand<'supplementalLine'>

      if (supplementalLineDrawCommand === 'start-end') {
        const supplementalLineDrawStep = drawStep as DrawCommandSteps<
          'supplementalLine',
          'start-end'
        >

        if (supplementalLineDrawStep === 'startPoint') {
          setTemporaryShapeConstraints({
            type: 'tmp-supplementalLine',
            start: { x: activeCoord.x, y: activeCoord.y },
          } as TemporarySupplementalLineShapeBase)
          await goToNextStep()
        }

        if (supplementalLineDrawStep === 'endPoint') {
          const temporarySupplementalLineShape = temporaryShape as TemporarySupplementalLineShape

          const newLineSeed: SupplementalShapeSeed = {
            type: 'supplementalLine',
            start: {
              x: temporarySupplementalLineShape.start.x,
              y: temporarySupplementalLineShape.start.y,
            },
            end: {
              x: temporarySupplementalLineShape.end.x,
              y: temporarySupplementalLineShape.end.y,
            },
          }

          await addShape(newLineSeed)
          setTemporaryShapeConstraints(null)
          await goToFirstStep()
        }
      }
    }

    if (operationMode === 'select') {
      if (indicatingShapeId !== null) {
        setSelectedShapeIds(oldValue => {
          if (oldValue.includes(indicatingShapeId)) {
            return oldValue.filter(id => id !== indicatingShapeId)
          } else {
            return [...oldValue, indicatingShapeId]
          }
        })
      }
    }
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    const clientPosition = { x: event.clientX, y: event.clientY }
    setCursorClientPosition(clientPosition)
    setPointingCoord(convertDomCoordToSvgCoord(clientPosition))
  }

  const convertDomCoordToSvgCoord = (domCoord: Coordinate): Coordinate | null => {
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
  }

  const exportAsSvg = () => {
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
  }

  const changeOperationMode = useRecoilCallback(
    ({ set }) =>
      async (mode: OperationMode) => {
        if (mode === 'line' || mode === 'supplementalLine') {
          set(drawCommandState, 'start-end')
          set(drawStepState, 'startPoint')
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

  return (
    <>
      <Canvas stageRef={stageRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} />
      <ToolWindow
        onActivateSupplementalLineDraw={useCallback(
          () => changeOperationMode('supplementalLine'),
          [changeOperationMode]
        )}
        onActivateShapeSelect={useCallback(
          () => changeOperationMode('select'),
          [changeOperationMode]
        )}
        onActivateLineDraw={useCallback(() => changeOperationMode('line'), [changeOperationMode])}
        onActivateArcDraw={useCallback(() => changeOperationMode('arc'), [changeOperationMode])}
        onActivateCircleDraw={useCallback(
          () => changeOperationMode('circle'),
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
