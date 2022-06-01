import React, { useEffect, useRef } from 'react'
import ToolWindow from '../component/ToolWindow'

import Canvas from '../component/Canvas'
import { useRecoilCallback, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  activeCoordState,
  indicatingShapeIdState,
  operationModeState,
  pointingCoordState,
  selectedShapeIdsState,
  shapeIdsState,
  shapesSelector,
  shapeStateFamily,
  snapDestinationCoordState,
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
  useKeyboardEvent()
  const { initializeHistory } = useHistoryUpdater()
  const { undo } = useHistory()

  const [operationMode, setOperationMode] = useRecoilState(operationModeState)

  const temporaryShape = useRecoilValue(temporaryShapeState)
  const activeCoord = useRecoilValue(activeCoordState)
  const shapes = useRecoilValue(shapesSelector)
  const indicatingShapeId = useRecoilValue(indicatingShapeIdState)

  const setTemporaryShapeBase = useSetRecoilState(temporaryShapeConstraintsState)
  const setSnapDestinationCoord = useSetRecoilState(snapDestinationCoordState)
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

  useEffect(() => {
    if (didMountRef.current) {
      return
    }

    didMountRef.current = true

    initializeHistory()
  }, [])

  const addLineShape = (newShapeSeed: LineShapeSeed) => {
    const { start, end } = newShapeSeed

    const newLineShape: LineShape = {
      ...newShapeSeed,
      id: shapes.length,
    }

    setShape(newLineShape)
    enableSnapping([start, end], 4, {
      type: 'lineEdge',
      targetShapeId: newLineShape.id,
    } as SnapInfoLineEdge)
  }

  const addCircleShape = (newCircleShapeSeed: CircleShapeSeed) => {
    const { center } = newCircleShapeSeed

    const newCircle: Shape = {
      ...newCircleShapeSeed,
      id: shapes.length,
    }

    setShape(newCircle)
    enableSnapping([center], 4, {
      type: 'circleCenter',
      targetShapeId: newCircle.id,
    } as SnapInfoCircleCenter)
  }

  const handleMouseDown = () => {
    if (activeCoord === null) {
      return
    }

    if (operationMode === 'circle:point-center') {
      setTemporaryShapeBase({
        type: 'temporary-circle',
        center: { x: activeCoord.x, y: activeCoord.y },
      } as TemporaryCircleShapeBase)
      setOperationMode('circle:fix-radius')
    } else if (operationMode === 'circle:fix-radius' && temporaryShape) {
      const temporaryCircleShape = temporaryShape as TemporaryCircleShape

      const { center, radius } = temporaryCircleShape

      const newCircleSeed: CircleShapeSeed = {
        type: 'circle',
        center,
        radius,
      }

      addCircleShape(newCircleSeed)
      setTemporaryShapeBase(null)
      setOperationMode('circle:point-center')
    }

    if (operationMode === 'line:point-start') {
      setTemporaryShapeBase({
        type: 'temporary-line',
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

      addLineShape(newLineSeed)
      setTemporaryShapeBase(null)
      setOperationMode('line:point-start')
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
    setPointingCoord(convertDomCoordToSvgCoord({ x: event.clientX, y: event.clientY }))
  }

  const convertDomCoordToSvgCoord = (domCoord: Coordinate): Coordinate => {
    const point = stageRef.current!.createSVGPoint()
    point.x = domCoord.x
    point.y = domCoord.y
    return point.matrixTransform(stageRef.current!.getScreenCTM()!.inverse())
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

  const enableSnapping = (targetCoords: Coordinate[], priority: number, snapInfo: SnapInfo) => {
    setSnapDestinationCoord(prevState => {
      const newState = { ...prevState }

      for (let targetCoord of targetCoords) {
        for (let x = Math.floor(targetCoord.x) - 4; x <= Math.ceil(targetCoord.x) + 4; x++) {
          for (let y = Math.floor(targetCoord.y) - 4; y <= Math.ceil(targetCoord.y) + 4; y++) {
            const key = `${x}-${y}`

            newState[key] = [...(newState[key] || []), { ...targetCoord, snapInfo, priority }]
          }
        }
      }
      return newState
    })
  }

  const changeOperationMode = (mode: OperationMode) => {
    setSelectedShapeIds([])
    setOperationMode(mode)
  }

  return (
    <>
      <Canvas stageRef={stageRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} />
      <ToolWindow
        onActivateShapeSelect={() => changeOperationMode('select')}
        onActivateLineDraw={() => changeOperationMode('line:point-start')}
        onActivateCircleDraw={() => changeOperationMode('circle:point-center')}
        onUndo={undo}
        onClickExportButton={exportAsSvg}
      />
    </>
  )
}

export default App
