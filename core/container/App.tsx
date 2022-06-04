import React, { useCallback, useEffect, useRef } from 'react'
import ToolWindow from '../component/ToolWindow'

import Canvas from '../component/Canvas'
import { useRecoilCallback, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  activeCoordState,
  cursorClientPositionState,
  indicatingShapeIdState,
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

interface Props {
  onExport?: (data: string) => void
}

const App: React.FC<Props> = ({ onExport }) => {
  const { addKeyListener } = useKeyboardEvent()
  const { initializeHistory } = useHistoryUpdater()
  const { undo } = useHistory()

  const [operationMode, setOperationMode] = useRecoilState(operationModeState)

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
      (shape: Shape) => {
        set(shapeIdsState, oldValue => [...oldValue, shape.id])
        set(shapeStateFamily(shape.id), shape)
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
        switch (mode) {
          case 'circle:fix-radius':
            set(operationModeState, 'circle:point-center')
            reset(temporaryShapeConstraintsState)
            break
          case 'line:point-end':
            set(operationModeState, 'line:point-start')
            reset(temporaryShapeConstraintsState)
            break
          case 'arc:fix-radius':
          case 'arc:fix-angle':
            set(operationModeState, 'arc:point-center')
            reset(temporaryShapeConstraintsState)
            break
          default:
            // noop
            break
        }
      },
    []
  )

  useEffect(() => {
    if (didMountRef.current) {
      return
    }

    didMountRef.current = true

    initializeHistory()
    addKeyListener('remove', removeSelectedShape)
    addKeyListener('escape', cancelDrawing)
  }, [addKeyListener, initializeHistory, removeSelectedShape, cancelDrawing])

  const addShape = (newShapeSeed: ShapeSeed) => {
    const newShape: Shape = {
      ...newShapeSeed,
      id: shapes.length,
    }
    setShape(newShape)
  }

  const handleMouseDown = () => {
    if (activeCoord === null) {
      return
    }

    if (operationMode === 'circle:point-center') {
      setTemporaryShapeConstraints({
        type: 'tmp-circle',
        center: { x: activeCoord.x, y: activeCoord.y },
      } as TemporaryCircleShapeBase)
      setOperationMode('circle:fix-radius')
    }

    if (operationMode === 'circle:fix-radius' && temporaryShape) {
      const temporaryCircleShape = temporaryShape as TemporaryCircleShape

      const { center, radius } = temporaryCircleShape

      const newCircleSeed: CircleShapeSeed = {
        type: 'circle',
        center,
        radius,
      }

      addShape(newCircleSeed)
      setTemporaryShapeConstraints(null)
      setOperationMode('circle:point-center')
    }

    if (operationMode === 'arc:point-center') {
      setTemporaryShapeConstraints({
        type: 'tmp-arc',
        center: { x: activeCoord.x, y: activeCoord.y },
      } as TemporaryArcCenter)
      setOperationMode('arc:fix-radius')
    }

    if (operationMode === 'arc:fix-radius') {
      const temporaryArcRadius = temporaryShape as TemporaryArcRadius
      setTemporaryShapeConstraints(
        oldValue =>
          ({
            ...oldValue,
            radius: temporaryArcRadius.radius,
            startAngle: temporaryArcRadius.startAngle,
          } as TemporaryArcRadius)
      )
      setOperationMode('arc:fix-angle')
    }

    if (operationMode === 'arc:fix-angle') {
      const temporaryArcShape = temporaryShape as TemporaryArcShape
      const { center, radius, startAngle, endAngle } = temporaryArcShape

      const newArcSeed: ArcShapeSeed = {
        type: 'arc',
        center,
        radius,
        startAngle,
        endAngle,
      }

      addShape(newArcSeed)
      setTemporaryShapeConstraints(null)
      setOperationMode('arc:point-center')
    }

    if (operationMode === 'line:point-start') {
      setTemporaryShapeConstraints({
        type: 'tmp-line',
        start: { x: activeCoord.x, y: activeCoord.y },
      } as TemporaryLineShapeBase)
      setOperationMode('line:point-end')
    }

    if (operationMode === 'line:point-end') {
      const temporaryLineShape = temporaryShape as TemporaryLineShape

      const newLineSeed: LineShapeSeed = {
        type: 'line',
        start: { x: temporaryLineShape.start.x, y: temporaryLineShape.start.y },
        end: { x: temporaryLineShape.end.x, y: temporaryLineShape.end.y },
      }

      addShape(newLineSeed)
      setTemporaryShapeConstraints(null)
      setOperationMode('line:point-start')
    }

    if (operationMode === 'supplementalLine:point-start') {
      setTemporaryShapeConstraints({
        type: 'tmp-supplementalLine',
        start: { x: activeCoord.x, y: activeCoord.y },
      } as TemporarySupplementalLineShapeBase)
      setOperationMode('supplementalLine:point-end')
    }

    if (operationMode === 'supplementalLine:point-end') {
      const temporarySupplementalLineShape = temporaryShape as TemporarySupplementalLineShape

      const newLineSeed: SupplementalShapeSeed = {
        type: 'supplementalLine',
        start: {
          x: temporarySupplementalLineShape.start.x,
          y: temporarySupplementalLineShape.start.y,
        },
        end: { x: temporarySupplementalLineShape.end.x, y: temporarySupplementalLineShape.end.y },
      }

      addShape(newLineSeed)
      setTemporaryShapeConstraints(null)
      setOperationMode('supplementalLine:point-start')
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

    return point.matrixTransform(domMatrix.inverse())
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

  const changeOperationMode = useCallback(
    (mode: OperationMode) => {
      setSelectedShapeIds([])
      setOperationMode(mode)
    },
    [setSelectedShapeIds, setOperationMode]
  )

  return (
    <>
      <Canvas stageRef={stageRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} />
      <ToolWindow
        onActivateSupplementalLineDraw={useCallback(
          () => changeOperationMode('supplementalLine:point-start'),
          [changeOperationMode]
        )}
        onActivateShapeSelect={useCallback(
          () => changeOperationMode('select'),
          [changeOperationMode]
        )}
        onActivateLineDraw={useCallback(
          () => changeOperationMode('line:point-start'),
          [changeOperationMode]
        )}
        onActivateArcDraw={useCallback(
          () => changeOperationMode('arc:point-center'),
          [changeOperationMode]
        )}
        onActivateCircleDraw={useCallback(
          () => changeOperationMode('circle:point-center'),
          [changeOperationMode]
        )}
        onUndo={undo}
        onClickExportButton={exportAsSvg}
      />
    </>
  )
}

export default App
