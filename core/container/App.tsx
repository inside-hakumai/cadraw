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
  shapeSeedConstraintsState,
  shapeSeedState,
  drawTypeState,
} from './states'
import useKeyboardEvent from './hooks/useKeyboardEvent'
import {
  isArcCenterTwoPointsSeed2,
  isArcCenterTwoPointsSeed3,
  isArcThreePointsSeed2,
  isArcThreePointsSeed3,
  isValidArcCommand,
  isValidCircleCommand,
  isValidLineCommand,
  isValidRectangleCommand,
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
  const drawType = useRecoilValue(drawTypeState)
  const drawCommand = useRecoilValue(drawCommandState)
  const drawStep = useRecoilValue(drawStepState)
  const shapeSeed = useRecoilValue(shapeSeedState)
  const activeCoord = useRecoilValue(activeCoordState)
  const indicatingShapeId = useRecoilValue(indicatingShapeIdState)

  const setCursorClientPosition = useSetRecoilState(cursorClientPositionState)
  const setShapeSeedConstraints = useSetRecoilState(shapeSeedConstraintsState)
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
    ({ snapshot, set, reset }) =>
      async () => {
        const mode = await snapshot.getPromise(operationModeState)
        const command = await snapshot.getPromise(drawCommandState)

        if (mode === 'line') {
          const lineCommand = command as DrawCommandMap['line']
          if (lineCommand === 'start-end') {
            set(drawStepState, 'startPoint')
            reset(shapeSeedConstraintsState)
          }
        }

        if (mode === 'circle') {
          const circleCommand = command as DrawCommandMap['circle']

          if (circleCommand === 'center-diameter') {
            set(drawStepState, 'center')
            reset(shapeSeedConstraintsState)
          }
        }

        if (mode === 'arc') {
          const arcCommand = command as DrawCommandMap['arc']

          if (arcCommand === 'center-two-points') {
            set(drawStepState, 'center')
            reset(shapeSeedConstraintsState)
          }

          if (arcCommand === 'three-points') {
            set(drawStepState, 'startPoint')
            reset(shapeSeedConstraintsState)
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

  const addShape = async (newShape: Shape) => {
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
          const newLineSeed: LineStartEndSeed2 = {
            isSeed: true,
            shape: 'line',
            drawCommand: 'start-end',
            drawStep: 'endPoint',
            startPoint: { x: activeCoord.x, y: activeCoord.y },
            endPoint: { x: activeCoord.x, y: activeCoord.y },
          }
          setShapeSeedConstraints(newLineSeed)
          await goToNextStep()
        }

        if (lineDrawStep === 'endPoint') {
          const lineSeed = shapeSeed as LineStartEndSeed2

          const newLine: Line = {
            id: shapes.length,
            type: drawType,
            shape: 'line',
            drawCommand: 'start-end',
            constraints: {
              startPoint: { x: lineSeed.startPoint.x, y: lineSeed.startPoint.y },
              endPoint: { x: lineSeed.endPoint.x, y: lineSeed.endPoint.y },
            },
          }

          await addShape(newLine)
          setShapeSeedConstraints(null)
          await goToFirstStep()
        }
      }
    }

    if (operationMode === 'rectangle') {
      const rectangleDrawCommand = drawCommand as ShapeDrawCommand<'rectangle'>

      if (rectangleDrawCommand === 'two-corners') {
        const rectangleDrawStep = drawStep as DrawCommandSteps<'rectangle', 'two-corners'>

        if (rectangleDrawStep === 'corner-1') {
          const newRectangleSeed: RectangleTwoCornersSeed2 = {
            isSeed: true,
            shape: 'rectangle',
            drawCommand: 'two-corners',
            drawStep: 'corner-2',
            corner1Point: activeCoord,
            corner2Point: activeCoord,
            upperLeftPoint: activeCoord,
          }

          setShapeSeedConstraints(newRectangleSeed)
          await goToNextStep()
        }

        if (rectangleDrawStep === 'corner-2') {
          const newRectangleSeed = shapeSeed as RectangleTwoCornersSeed2

          const { corner1Point, corner2Point } = newRectangleSeed

          if (corner2Point.x - corner1Point.x === 0 || corner2Point.y - corner1Point.y === 0) {
            return
          }

          const diagonalSlope =
            (corner2Point.y - corner1Point.y) / (corner2Point.x - corner1Point.x)

          let upperLeftPoint: Coordinate
          let upperRightPoint: Coordinate
          let lowerLeftPoint: Coordinate
          let lowerRightPoint: Coordinate
          if (diagonalSlope > 0) {
            // 対角線が右下に向かって引かれている場合

            if (corner1Point.x < corner2Point.x) {
              upperLeftPoint = { x: corner1Point.x, y: corner1Point.y }
              upperRightPoint = { x: corner2Point.x, y: corner1Point.y }
              lowerLeftPoint = { x: corner1Point.x, y: corner2Point.y }
              lowerRightPoint = { x: corner2Point.x, y: corner2Point.y }
            } else {
              upperLeftPoint = { x: corner2Point.x, y: corner2Point.y }
              upperRightPoint = { x: corner1Point.x, y: corner2Point.y }
              lowerLeftPoint = { x: corner2Point.x, y: corner1Point.y }
              lowerRightPoint = { x: corner1Point.x, y: corner1Point.y }
            }
          } else {
            // 対角線が右上に向かって引かれている場合

            if (corner1Point.x < corner2Point.x) {
              upperLeftPoint = { x: corner1Point.x, y: corner2Point.y }
              upperRightPoint = { x: corner2Point.x, y: corner2Point.y }
              lowerLeftPoint = { x: corner1Point.x, y: corner1Point.y }
              lowerRightPoint = { x: corner2Point.x, y: corner1Point.y }
            } else {
              upperLeftPoint = { x: corner2Point.x, y: corner1Point.y }
              upperRightPoint = { x: corner1Point.x, y: corner1Point.y }
              lowerLeftPoint = { x: corner2Point.x, y: corner2Point.y }
              lowerRightPoint = { x: corner1Point.x, y: corner2Point.y }
            }
          }

          const newRectangle: Rectangle = {
            id: shapes.length,
            type: drawType,
            shape: 'rectangle',
            drawCommand: 'two-corners',
            constraints: {
              corner1Point,
              corner2Point,
            },
            computed: {
              upperLeftPoint,
              upperRightPoint,
              lowerLeftPoint,
              lowerRightPoint,
            },
          }

          await addShape(newRectangle)
          setShapeSeedConstraints(null)
          await goToFirstStep()
        }
      }
    }

    if (operationMode === 'circle') {
      const circleDrawCommand = drawCommand as ShapeDrawCommand<'circle'>

      if (circleDrawCommand === 'center-diameter') {
        const circleDrawStep = drawStep as DrawCommandSteps<'circle', 'center-diameter'>

        if (circleDrawStep === 'center') {
          const newCircleSeed: CircleCenterDiameterSeed2 = {
            isSeed: true,
            shape: 'circle',
            drawCommand: 'center-diameter',
            drawStep: 'diameter',
            center: activeCoord,
            diameterStart: activeCoord,
            diameterEnd: activeCoord,
            radius: 0,
          }
          setShapeSeedConstraints(newCircleSeed)
          await goToNextStep()
        }

        if (circleDrawStep === 'diameter') {
          const circleSeed = shapeSeed as CircleCenterDiameterSeed2

          const { center, radius } = circleSeed

          const newCircle: Circle = {
            id: shapes.length,
            type: drawType,
            shape: 'circle',
            drawCommand: 'center-diameter',
            constraints: {
              center,
              radius,
            },
          }

          await addShape(newCircle)
          setShapeSeedConstraints(null)
          await goToFirstStep()
        }
      }
    }

    if (operationMode === 'arc') {
      const arcDrawCommand = drawCommand as ShapeDrawCommand<'arc'>

      if (arcDrawCommand === 'center-two-points') {
        const arcDrawStep = drawStep as DrawCommandSteps<'arc', 'center-two-points'>

        if (arcDrawStep === 'center') {
          const newArcSeed: ArcCenterTwoPointsSeed2 = {
            isSeed: true,
            shape: 'arc',
            drawCommand: 'center-two-points',
            drawStep: 'startPoint',
            center: activeCoord,
            startPoint: activeCoord,
            startPointAngle: 0,
            radius: 0,
          }
          setShapeSeedConstraints(newArcSeed)
          await goToNextStep()
        }

        if (arcDrawStep === 'startPoint') {
          if (!isArcCenterTwoPointsSeed2(shapeSeed)) {
            console.warn('shapeSeed is not ArcCenterTwoPointsSeed2')
            return null
          }

          const newValue: ArcCenterTwoPointsSeed3 = {
            ...shapeSeed,
            drawStep: 'endPoint',
            endPoint: activeCoord,
            endPointAngle: shapeSeed.startPointAngle,
            angleDeltaFromStart: 0,
          }

          setShapeSeedConstraints(newValue)
          await goToNextStep()
        }

        if (arcDrawStep === 'endPoint') {
          if (!isArcCenterTwoPointsSeed3(shapeSeed)) {
            console.warn('shapeSeed is not ArcCenterTwoPointsSeed3')
            return
          }

          const newArcSeed: Arc<ArcConstraintsWithCenterAndTwoPoints> = {
            id: shapes.length,
            type: drawType,
            shape: 'arc',
            drawCommand: 'center-two-points',
            constraints: {
              ...shapeSeed,
              constrainShape: 'arc',
              constraintType: 'center-two-points',
            },
          }

          await addShape(newArcSeed)
          setShapeSeedConstraints(null)
          await goToFirstStep()
        }
      }

      if (arcDrawCommand === 'three-points') {
        const arcDrawStep = drawStep as DrawCommandSteps<'arc', 'three-points'>

        if (arcDrawStep === 'startPoint') {
          const newArcSeed: ArcThreePointsSeed2 = {
            isSeed: true,
            shape: 'arc',
            drawCommand: 'three-points',
            drawStep: 'endPoint',
            startPoint: activeCoord,
            endPoint: activeCoord,
            distance: 0,
          }
          setShapeSeedConstraints(newArcSeed)
          await goToNextStep()
        }

        if (arcDrawStep === 'endPoint') {
          setShapeSeedConstraints(oldValue => {
            if (!isArcThreePointsSeed2(oldValue)) {
              console.warn('shapeSeed is not ArcThreePointsSeed2')
              return null
            }

            const arcCenter: Coordinate = {
              x: (oldValue.startPoint.x + activeCoord.x) / 2,
              y: (oldValue.startPoint.y + activeCoord.y) / 2,
            }

            const arcStartAngle = calcCentralAngleFromHorizontalLine(oldValue.startPoint, arcCenter)
            const arcEndAngle = calcCentralAngleFromHorizontalLine(activeCoord, arcCenter)

            const newValue: ArcThreePointsSeed3 = {
              ...oldValue,
              drawStep: 'onLinePoint',
              endPoint: activeCoord,
              onLinePoint: activeCoord,
              center: arcCenter,
              startPointAngle: arcStartAngle ?? 0,
              endPointAngle: arcEndAngle ?? 0,
              radius: calcDistance(arcCenter, oldValue.startPoint),
            }

            return newValue
          })
          await goToNextStep()
        }

        if (arcDrawStep === 'onLinePoint') {
          if (!isArcThreePointsSeed3(shapeSeed)) {
            console.warn('shapeSeed is not ArcThreePointsSeed3')
            return
          }

          const { startPointAngle, endPointAngle } = shapeSeed

          const counterClockWiseAngle =
            endPointAngle > startPointAngle
              ? endPointAngle - startPointAngle
              : 360 - (startPointAngle - endPointAngle)

          const newArcSeed: Arc<ArcConstraintsWithThreePoints> = {
            id: shapes.length,
            type: drawType,
            shape: 'arc',
            drawCommand: 'three-points',
            constraints: {
              ...shapeSeed,
              constrainShape: 'arc',
              constraintType: 'three-points',
              angleDeltaFromStart: counterClockWiseAngle,
            },
          }

          await addShape(newArcSeed)
          setShapeSeedConstraints(null)
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

  const changeDrawCommand = useRecoilCallback(
    ({ set }) =>
      async (newDrawType: DrawType) => {
        set(drawTypeState, newDrawType)
      },
    [goToFirstStep]
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
      <Canvas stageRef={stageRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} />
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
