import React, { useEffect, useRef } from 'react'
import ToolWindow from '../component/ToolWindow'

import Canvas from '../component/Canvas'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  activeCoordState,
  coordInfoState,
  operationModeState,
  pointingCoordState,
  shapesState,
  snapDestinationCoordState,
  temporaryShapeBaseState,
  temporaryShapeState,
} from './states'

interface Props {
  onExport?: (data: string) => void
}

const App: React.FC<Props> = ({ onExport }) => {
  const [operationMode, setOperationMode] = useRecoilState(operationModeState)
  const [shapes, setShapes] = useRecoilState(shapesState)

  const temporaryShape = useRecoilValue(temporaryShapeState)
  const activeCoord = useRecoilValue(activeCoordState)

  const setTemporaryShapeBase = useSetRecoilState(temporaryShapeBaseState)
  const setSnapDestinationCoord = useSetRecoilState(snapDestinationCoordState)
  const setCoordInfo = useSetRecoilState(coordInfoState)
  const setPointingCoord = useSetRecoilState(pointingCoordState)

  const didMountRef = useRef(false)
  const stageRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (didMountRef.current) {
      return
    }

    didMountRef.current = true

    findGridNeighborCoords()
  }, [])

  const addLineShape = (newShapeSeed: LineShapeSeed, approximatedCoords?: Coordinate[]) => {
    const newLineShape: LineShape = {
      ...newShapeSeed,
      id: shapes.length,
      approximatedCoords: approximatedCoords || [],
    }

    setShapes([...shapes, newLineShape])
    addCoordInfo([newLineShape.start, newLineShape.end], 'lineEdge', newLineShape.id)
    enableSnapping(newLineShape.start, newLineShape.end)
  }

  const addCircleShape = (newCircleShapeSeed: CircleShapeSeed) => {
    const { center, radius } = newCircleShapeSeed

    // 0.5度間隔で円を構成する720個の座標を特定する
    const approximatedCoords: { x: number; y: number }[] = []
    for (let i = 0; i < 720; i++) {
      const x = center.x + radius * Math.cos((2 * Math.PI * i) / 720)
      const y = center.y + radius * Math.sin((2 * Math.PI * i) / 720)
      approximatedCoords.push({ x, y })
    }

    const newCircle: Shape = {
      ...newCircleShapeSeed,
      approximatedCoords,
      id: shapes.length,
    }

    setShapes([...shapes, newCircle])
    addCoordInfo([center], 'circleCenter', newCircle.id)
    addCoordInfo(approximatedCoords, 'circumference', newCircle.id)
    enableSnapping(...approximatedCoords, center)
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

  /**
   * グリッド線の交点に対するスナップが機能するように交点の近傍座標に対してスナップ先座標を設定する
   */
  const findGridNeighborCoords = () => {
    const gridIntersections: Coordinate[] = []
    // x = 50ごとに垂直方向のグリッド線を引いている
    for (let x = 0; x <= window.innerWidth; x += 50) {
      // y = 50ごとに水平方向のグリッド線を引いている
      for (let y = 0; y <= window.innerHeight; y += 50) {
        gridIntersections.push({ x, y })
      }
    }
    enableSnapping(...gridIntersections)
    addCoordInfo(gridIntersections, 'gridIntersection')
  }

  const enableSnapping = (...targetCoords: Coordinate[]) => {
    setSnapDestinationCoord(prevState => {
      const newState = { ...prevState }

      for (let targetCoord of targetCoords) {
        for (let x = Math.floor(targetCoord.x) - 4; x <= Math.ceil(targetCoord.x) + 4; x++) {
          for (let y = Math.floor(targetCoord.y) - 4; y <= Math.ceil(targetCoord.y) + 4; y++) {
            const key = `${x}-${y}`

            let minimumDistance = newState[key]?.distance || Number.MAX_VALUE

            const distance = Math.sqrt(
              Math.pow(targetCoord.x - x, 2) + Math.pow(targetCoord.y - y, 2)
            )
            if (distance < minimumDistance) {
              newState[key] = {
                x: targetCoord.x,
                y: targetCoord.y,
                distance,
              }
            }
          }
        }
      }
      return newState
    })
  }

  const addCoordInfo = (
    targetCoords: Coordinate[],
    type: CoordInfo['type'],
    targetShapeId?: number
  ) => {
    setCoordInfo(prevState => {
      const newState = { ...prevState }

      for (let targetCoord of targetCoords) {
        const coordInfoKey = `${targetCoord.x}-${targetCoord.y}`
        if (newState[coordInfoKey] === undefined) {
          newState[coordInfoKey] = []
        }

        if (type === 'gridIntersection') {
          newState[coordInfoKey] = [
            ...newState[coordInfoKey],
            { type } as CoordInfoGridIntersection,
          ]
        } else {
          if (targetShapeId !== undefined) {
            newState[coordInfoKey] = [
              ...newState[coordInfoKey],
              { type, targetShapeId } as ShapeRelatedCoordInfo,
            ]
          } else {
            throw new Error('targetShapeId is required if type !== "gridIntersection"')
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
        onClickExportButton={exportAsSvg}
      />
    </>
  )
}

export default App
