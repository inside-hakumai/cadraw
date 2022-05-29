import React, { useCallback, useEffect, useRef, useState } from 'react'
import ToolWindow from '../component/ToolWindow'

import Canvas from '../component/Canvas'
import {
  Snapshot,
  useGotoRecoilSnapshot,
  useRecoilCallback,
  useRecoilSnapshot,
  useRecoilState,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from 'recoil'
import {
  activeCoordState,
  shapesSelector,
  operationModeState,
  pointingCoordState,
  shapeStateFamily,
  snapDestinationCoordState,
  temporaryShapeBaseState,
  temporaryShapeState,
  shapeIdsState,
  snapshotsState,
  canUndoSelector,
  currentSnapshotVersionState,
} from './states'
import { css } from '@emotion/react'
import useKeyboardEvent from './useKeyboardEvent'

interface Props {
  onExport?: (data: string) => void
}

const App: React.FC<Props> = ({ onExport }) => {
  useKeyboardEvent()

  const snapshot = useRecoilSnapshot()
  const [currentSnapshotVersion, setCurrentSnapshotVersion] = useRecoilState(
    currentSnapshotVersionState
  )
  const gotoSnapshot = useGotoRecoilSnapshot()
  const [snapshots, setSnapshots] = useRecoilState(snapshotsState)
  const canUndo = useRecoilValue(canUndoSelector)

  const [operationMode, setOperationMode] = useRecoilState(operationModeState)

  const temporaryShape = useRecoilValue(temporaryShapeState)
  const activeCoord = useRecoilValue(activeCoordState)
  const shapes = useRecoilValue(shapesSelector)

  const setTemporaryShapeBase = useSetRecoilState(temporaryShapeBaseState)
  const setSnapDestinationCoord = useSetRecoilState(snapDestinationCoordState)
  const setPointingCoord = useSetRecoilState(pointingCoordState)
  // const setDebugCoord = useSetRecoilState(debugCoordState)

  const resetPointingCoord = useResetRecoilState(pointingCoordState)

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

    setSnapshots([snapshot])
    setCurrentSnapshotVersion(0)
  }, [])

  useEffect(() => {
    addSnapshot()
  }, [snapshot])

  const addSnapshot = () => {
    const isShapeUpdated = Array.from(snapshot.getNodes_UNSTABLE({ isModified: true })).some(
      node => node.key === 'shapeIds'
    )

    if (isShapeUpdated && snapshots.every(s => s.getID() !== snapshot.getID())) {
      snapshot.retain()
      console.debug(`Added snapshot: ID = ${snapshot.getID()}`)
      setSnapshots(oldValue => [...oldValue, snapshot])
      setCurrentSnapshotVersion(snapshots.length)
    }
  }

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
    } else if (operationMode === 'line:point-start') {
      setTemporaryShapeBase({
        type: 'temporary-line',
        start: { x: activeCoord.x, y: activeCoord.y },
      } as TemporaryLineShapeBase)
      setOperationMode('line:point-end')
    } else if (operationMode === 'line:point-end') {
      const temporaryLineShape = temporaryShape as TemporaryLineShape

      const newLineSeed: LineShapeSeed = {
        type: 'line',
        start: { x: temporaryLineShape.start.x, y: temporaryLineShape.start.y },
        end: { x: temporaryLineShape.end.x, y: temporaryLineShape.end.y },
      }

      addLineShape(newLineSeed)
      setTemporaryShapeBase(null)
      setOperationMode('line:point-start')
    } else {
      throw new Error(`Unknown operation mode: ${operationMode}`)
    }
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    setPointingCoord(convertDomCoordToSvgCoord({ x: event.clientX, y: event.clientY }))
  }

  const undo = () => {
    if (!canUndo) {
      console.warn('Few snapshots. Cannot undo.')
    } else if (currentSnapshotVersion === null) {
      console.warn('currentSnapshotVersion is null. Cannot undo.')
    } else if (currentSnapshotVersion === 0) {
      console.warn('currentSnapshotVersion is 0. Cannot undo.')
    } else {
      gotoSnapshot(snapshots[currentSnapshotVersion - 1])
      resetPointingCoord()
    }
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

  return (
    <>
      <Canvas stageRef={stageRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} />
      <ToolWindow
        onActivateLineDraw={() => setOperationMode('line:point-start')}
        onActivateCircleDraw={() => setOperationMode('circle:point-center')}
        onUndo={undo}
        onClickExportButton={exportAsSvg}
      />
    </>
  )
}

export default App
