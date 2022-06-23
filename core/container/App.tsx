import React, { useCallback, useEffect, useRef } from 'react'
import ToolWindow from '../component/ToolWindow'

import Canvas from '../component/Canvas'
import { useRecoilCallback, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  activeCoordState,
  canUndoSelector,
  currentOperatingShapeSelector,
  currentSnapshotVersionState,
  cursorClientPositionState,
  drawCommandState,
  drawStepState,
  indicatingShapeIdState,
  isShowingShortcutKeyHintState,
  operationModeState,
  pointingCoordState,
  selectedShapeIdsState,
  shapesState,
  snapshotsState,
  temporaryShapeConstraintsState,
  temporaryShapeState,
} from './states'
import useKeyboardEvent from './hooks/useKeyboardEvent'
import {
  isTemporaryArcCenter,
  isTemporaryArcShape,
  isValidArcCommand,
  isValidCircleCommand,
  isValidLineCommand,
  isValidSupplementalLineCommand,
} from '../lib/typeguard'
import useDrawStep from './hooks/useDrawStep'
import { calcCentralAngleFromHorizontalLine, calcDistance } from '../lib/function'

interface Props {
  onExport?: (data: string) => void
}

const App: React.FC<Props> = ({ onExport }) => {
  const { addKeyListener } = useKeyboardEvent()
  const { goToNextStep, goToFirstStep } = useDrawStep()

  const [shapes, setShapes] = useRecoilState(shapesState)
  const [snapshotVersion, setSnapshotVersion] = useRecoilState(currentSnapshotVersionState)

  const operationMode = useRecoilValue(operationModeState)
  const drawCommand = useRecoilValue(drawCommandState)
  const drawStep = useRecoilValue(drawStepState)
  const temporaryShape = useRecoilValue(temporaryShapeState)
  const activeCoord = useRecoilValue(activeCoordState)
  const indicatingShapeId = useRecoilValue(indicatingShapeIdState)

  const setCursorClientPosition = useSetRecoilState(cursorClientPositionState)
  const setTemporaryShapeConstraints = useSetRecoilState(temporaryShapeConstraintsState)
  const setPointingCoord = useSetRecoilState(pointingCoordState)
  const setSelectedShapeIds = useSetRecoilState(selectedShapeIdsState)
  const setSnapshotsState = useSetRecoilState(snapshotsState)
  // const setDebugCoord = useSetRecoilState(debugCoordState)

  const didMountRef = useRef(false)
  const stageRef = useRef<SVGSVGElement>(null)

  const setShape = async (shape: Shape) => {
    setShapes(oldValue => [...oldValue, shape])
    setSnapshotsState(oldState => {
      if (oldState.length === snapshotVersion + 1) {
        return [...oldState, [...shapes, shape]]
      } else {
        const newState = [...oldState]
        newState[snapshotVersion + 1] = [...shapes, shape]
        return newState
      }
    })
    setSnapshotVersion(oldState => oldState + 1)
  }

  const switchToSelect = useRecoilCallback(
    ({ set, reset }) =>
      async () => {
        set(operationModeState, 'select')
        reset(temporaryShapeConstraintsState)
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

          if (arcCommand === 'three-points') {
            set(drawStepState, 'startPoint')
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

  const undo = useRecoilCallback(({ snapshot, set }) => async () => {
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

      set(shapesState, Array.from(rollbackTargetSnapshot))
      set(currentSnapshotVersionState, currentSnapshotVersion - 1)
    }
  })

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
            startPoint: { x: activeCoord.x, y: activeCoord.y },
          } as TemporaryLineShapeBase)
          await goToNextStep()
        }

        if (lineDrawStep === 'endPoint') {
          const temporaryLineShape = temporaryShape as TemporaryLineShape

          const newLineSeed: LineShapeSeed = {
            type: 'line',
            startPoint: { x: temporaryLineShape.startPoint.x, y: temporaryLineShape.startPoint.y },
            endPoint: { x: temporaryLineShape.endPoint.x, y: temporaryLineShape.endPoint.y },
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

      if (arcDrawCommand === 'three-points') {
        const arcDrawStep = drawStep as DrawCommandSteps<'arc', 'three-points'>

        if (arcDrawStep === 'startPoint') {
          const newValue: TemporaryArcStartPoint = {
            type: 'tmp-three-points-arc',
            startPoint: activeCoord,
          }
          setTemporaryShapeConstraints(newValue)
          await goToNextStep()
        }

        if (arcDrawStep === 'endPoint') {
          const temporaryArcStartPointAndEndPoint =
            temporaryShape as TemporaryArcStartPointAndEndPoint

          const temporaryArcCenter: Coordinate = {
            x: (temporaryArcStartPointAndEndPoint.startPoint.x + activeCoord.x) / 2,
            y: (temporaryArcStartPointAndEndPoint.startPoint.y + activeCoord.y) / 2,
          }

          const temporaryArcStartAngle = calcCentralAngleFromHorizontalLine(
            temporaryArcStartPointAndEndPoint.startPoint,
            temporaryArcCenter
          )
          const temporaryArcEndAngle = calcCentralAngleFromHorizontalLine(
            activeCoord,
            temporaryArcCenter
          )

          const newArcSeed: TemporaryArcThreePoint = {
            ...temporaryArcStartPointAndEndPoint,
            endPoint: activeCoord,
            onLinePoint: activeCoord,
            center: temporaryArcCenter,
            startPointAngle: temporaryArcStartAngle ?? 0,
            endPointAngle: temporaryArcEndAngle ?? 0,
            radius: calcDistance(temporaryArcCenter, temporaryArcStartPointAndEndPoint.startPoint),
          }

          setTemporaryShapeConstraints(newArcSeed)
          await goToNextStep()
        }

        if (arcDrawStep === 'onLinePoint') {
          const temporaryArcThreePoint = temporaryShape as TemporaryArcThreePoint

          const newArcSeed: ArcWithThreePointsShapeSeed = {
            ...temporaryArcThreePoint,
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
            startPoint: { x: activeCoord.x, y: activeCoord.y },
          } as TemporarySupplementalLineShapeBase)
          await goToNextStep()
        }

        if (supplementalLineDrawStep === 'endPoint') {
          const temporarySupplementalLineShape = temporaryShape as TemporarySupplementalLineShape

          const newLineSeed: SupplementalShapeSeed = {
            type: 'supplementalLine',
            startPoint: {
              x: temporarySupplementalLineShape.startPoint.x,
              y: temporarySupplementalLineShape.startPoint.y,
            },
            endPoint: {
              x: temporarySupplementalLineShape.endPoint.x,
              y: temporarySupplementalLineShape.endPoint.y,
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

  const changeCommand = useRecoilCallback(
    ({ snapshot, set }) =>
      async (newCommand: string) => {
        const currentOperatingShape = await snapshot.getPromise(currentOperatingShapeSelector)

        if (
          (currentOperatingShape === 'line' && isValidLineCommand(newCommand)) ||
          (currentOperatingShape === 'circle' && isValidCircleCommand(newCommand)) ||
          (currentOperatingShape === 'arc' && isValidArcCommand(newCommand)) ||
          (currentOperatingShape === 'supplementalLine' &&
            isValidSupplementalLineCommand(newCommand))
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
      <Canvas stageRef={stageRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} />
      <ToolWindow
        changeCommand={changeCommand}
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
