import React, { useEffect, useRef, useState } from 'react'
import ToolWindow from './components/ToolWindow'

import Canvas from './components/Canvas'
import { useRecoilState } from 'recoil'
import { operationModeState } from './Cadraw'

interface Props {
  onExport?: (data: string) => void
}

const App: React.FC<Props> = ({ onExport }) => {
  const didMountRef = useRef(false)
  const stageRef = useRef<SVGSVGElement>(null)

  const [operationMode, setOperationMode] = useRecoilState(operationModeState)
  const [temporaryShape, setTemporaryShape] = useState<TemporaryShape | null>(null)
  const [shapes, setShapes] = useState<Shape[]>([])
  const [snapDestinationCoord, setSnapDestinationCoord] = useState<{
    [x: number]: { [y: number]: { x: number; y: number; distance: number } }
  }>({})
  // const [snapDestinationCoord, setClosestDot] = useState<Coordinate[][] | null>(null)
  const [guideLines, setGuideLines] = useState<{ start: Coordinate; end: Coordinate }[]>([])
  const [coordInfo, setCoordInfo] = useState<{ [xy: string]: CoordInfo[] }>({})
  const [pointingCoord, setPointingCoord] = useState<Coordinate | null>(null)
  const [snappingCoord, setSnappingCoord] = useState<Coordinate | null>(null)
  const [tooltipContent, setTooltipContent] = useState<string | null>(null)
  const [currentCoordInfo, setCurrentCoordInfo] = useState<string[] | null>(null)

  useEffect(() => {
    if (didMountRef.current) {
      return
    }

    didMountRef.current = true

    findGridNeighborCoords()
  }, [])

  useEffect(() => {
    console.debug(shapes)
  }, [shapes])

  const handleMouseDown = (event: React.MouseEvent) => {
    if (pointingCoord === null) {
      console.warn('pointingCoord is null')
      return
    }

    if (snappingCoord) {
      console.debug('point: ', pointingCoord, ' -> snap: ', snappingCoord)
    }

    const coord = snappingCoord || pointingCoord

    if (operationMode === 'circle:point-center') {
      setTemporaryShape({
        type: 'temporary-circle',
        center: { x: coord.x, y: coord.y },
        radius: 0,
        diameterStart: { x: coord.x, y: coord.y },
        diameterEnd: { x: coord.x, y: coord.y },
      } as TemporaryCircleShape)
      setOperationMode('circle:fix-radius')
    } else if (operationMode === 'circle:fix-radius' && temporaryShape) {
      const temporaryCircleShape = temporaryShape as TemporaryCircleShape

      const { center, radius } = temporaryCircleShape

      // 0.5度間隔で円を構成する720個の座標を特定する
      const approximatedCoords: { x: number; y: number }[] = []
      for (let i = 0; i < 720; i++) {
        const x = center.x + radius * Math.cos((2 * Math.PI * i) / 720)
        const y = center.y + radius * Math.sin((2 * Math.PI * i) / 720)
        approximatedCoords.push({ x, y })
      }

      const newCircle: CircleShape = {
        type: 'circle',
        id: shapes.length,
        center,
        radius,
        approximatedCoords,
      }

      setCoordInfo(prevState => {
        const newState = { ...prevState }

        const circleCenterCoordInfo: CoordInfoCircleCenter = {
          type: 'circleCenter',
          targetShapeId: newCircle.id,
        }
        if (newState[`${center.x}-${center.y}`]) {
          newState[`${center.x}-${center.y}`] = [
            ...newState[`${center.x}-${center.y}`],
            circleCenterCoordInfo,
          ]
        } else {
          newState[`${center.x}-${center.y}`] = [circleCenterCoordInfo]
        }

        approximatedCoords.forEach(circumferenceCoord => {
          const circumferenceCoordInfo: CoordInfoCircumference = {
            type: 'circumference',
            targetShapeId: newCircle.id,
          }
          const coordInfoKey = `${circumferenceCoord.x}-${circumferenceCoord.y}`
          const targetCoordInfo = newState[coordInfoKey]
          if (targetCoordInfo) {
            newState[coordInfoKey] = [...targetCoordInfo, circumferenceCoordInfo]
          } else {
            newState[coordInfoKey] = [circumferenceCoordInfo]
          }
        })

        return newState
      })
      enableSnapping(center)
      setTooltipContent(null)
      setShapes([...shapes, newCircle])
      setTemporaryShape(null)
      setOperationMode('circle:point-center')
      scanClosestDot(newCircle)
    } else if (operationMode === 'line:point-start') {
      setTemporaryShape({
        type: 'temporary-line',
        start: { x: coord.x, y: coord.y },
        end: { x: coord.x, y: coord.y },
      } as TemporaryLineShape)
      setOperationMode('line:point-end')
    } else if (operationMode === 'line:point-end') {
      const temporaryLineShape = temporaryShape as TemporaryLineShape

      const newLine: LineShape = {
        type: 'line',
        id: shapes.length,
        start: { x: temporaryLineShape.start.x, y: temporaryLineShape.start.y },
        end: { x: temporaryLineShape.end.x, y: temporaryLineShape.end.y },
        approximatedCoords: [],
      }

      enableSnapping(temporaryLineShape.start, temporaryLineShape.end)
      addCoordInfo([temporaryLineShape.start, temporaryLineShape.end], 'lineEdge', shapes.length)
      setTooltipContent(null)
      setShapes([...shapes, newLine])
      setTemporaryShape(null)
      setOperationMode('line:point-start')
    } else {
      throw new Error(`Unknown operation mode: ${operationMode}`)
    }
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    const pointingCoord = convertDomCoordToSvgCoord({ x: event.clientX, y: event.clientY })
    setPointingCoord(pointingCoord)
    setSnappingCoord(snapDestinationCoord?.[pointingCoord.x]?.[pointingCoord.y] || null)
    const coord = snappingCoord ? snappingCoord : pointingCoord

    const pointingCoordInfo = coordInfo?.[`${coord.x}-${coord.y}`]
    if (pointingCoordInfo) {
      setCurrentCoordInfo(pointingCoordInfo.map(info => info.type))
      const guides = pointingCoordInfo
        .filter(cInfo => cInfo.type === 'circleCenter')
        .map(cInfo => {
          const circleCenterCoordInfo = cInfo as CoordInfoCircleCenter
          const circle = shapes.find(
            shape => shape.id === circleCenterCoordInfo.targetShapeId
          ) as CircleShape
          return {
            start: { x: circle.center.x - circle.radius, y: circle.center.y },
            end: { x: circle.center.x + circle.radius, y: circle.center.y },
          }
        })
      console.debug(guides)
      setGuideLines(guides)
    } else {
      setCurrentCoordInfo(null)
      setGuideLines([])
    }

    if (
      !(operationMode === 'circle:fix-radius' || operationMode === 'line:point-end') ||
      !temporaryShape
    ) {
      return
    }

    if (operationMode === 'circle:fix-radius') {
      const temporaryCircleShape = temporaryShape as TemporaryCircleShape

      const temporaryCircleRadius = Math.sqrt(
        Math.pow(temporaryCircleShape.center.x - coord.x, 2) +
          Math.pow(temporaryCircleShape.center.y - coord.y, 2)
      )
      const temporaryCircleDiameterStart = coord
      const temporaryCircleDiameterEnd = {
        x: coord.x + (temporaryCircleShape.center.x - coord.x) * 2,
        y: coord.y + (temporaryCircleShape.center.y - coord.y) * 2,
      }

      setTemporaryShape({
        ...temporaryShape,
        radius: temporaryCircleRadius,
        diameterStart: temporaryCircleDiameterStart,
        diameterEnd: temporaryCircleDiameterEnd,
      } as TemporaryCircleShape)

      setTooltipContent((temporaryCircleRadius * 2).toFixed(2) + 'px')
    } else if (operationMode === 'line:point-end') {
      const temporaryLineShape = temporaryShape as TemporaryLineShape
      setTemporaryShape(
        prev =>
          ({
            ...prev,
            end: coord,
          } as TemporaryLineShape)
      )
      setTooltipContent(
        Math.sqrt(
          Math.pow(temporaryLineShape.start.x - coord.x, 2) +
            Math.pow(temporaryLineShape.start.y - coord.y, 2)
        ).toFixed(2) + 'px'
      )
    }
  }

  const convertDomCoordToSvgCoord = (domCoord: Coordinate): Coordinate => {
    const point = stageRef.current!.createSVGPoint()
    point.x = domCoord.x
    point.y = domCoord.y
    return point.matrixTransform(stageRef.current!.getScreenCTM()!.inverse())
  }

  const changeDrawShape = (shape: ShapeType) => {
    setTemporaryShape(null)
    switch (shape) {
      case 'line':
        setOperationMode('line:point-start')
        break
      case 'circle':
        setOperationMode('circle:point-center')
        break
    }
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

  const scanClosestDot = (shape: CircleShape) => {
    if (!stageRef.current) {
      return
    }

    const tmpClosestDot: {
      [key: number]: { [key: number]: { x: number; y: number; distance: number } }
    } = snapDestinationCoord

    shape.approximatedCoords.forEach(circleDot => {
      const { x: circleX, y: circleY } = circleDot

      const scanCoordRange = {
        xStart: Math.floor(circleX) - 4,
        xEnd: Math.ceil(circleX) + 4,
        yStart: Math.floor(circleY) - 4,
        yEnd: Math.ceil(circleY) + 4,
      }

      for (let i = scanCoordRange.xStart; i <= scanCoordRange.xEnd; i++) {
        for (let j = scanCoordRange.yStart; j < scanCoordRange.yEnd; j++) {
          if (tmpClosestDot[i] === undefined) {
            tmpClosestDot[i] = {}
          }

          let minimumDistance = tmpClosestDot[i][j]?.distance || Number.MAX_VALUE

          const distance = Math.sqrt(Math.pow(circleX - i, 2) + Math.pow(circleY - j, 2))
          if (distance < minimumDistance) {
            tmpClosestDot[i][j] = { x: circleX, y: circleY, distance }
          }
        }
      }
    })

    console.debug(tmpClosestDot)
    setSnapDestinationCoord(tmpClosestDot)
  }

  /**
   * グリッド線の交点に対するスナップが機能するように交点の近傍座標に対してスナップ先座標を設定する
   */
  const findGridNeighborCoords = () => {
    if (!stageRef.current) {
      return
    }

    setSnapDestinationCoord(previous => {
      // x = 50ごとに垂直方向のグリッド線を引いている
      for (let x = 0; x <= window.innerWidth; x += 50) {
        // y = 50ごとに水平方向のグリッド線を引いている
        for (let y = 0; y <= window.innerHeight; y += 50) {
          // 各交点ごとに、x軸方向前後4に対して最も近い交点を探す
          for (let dx = -4; dx <= 4; dx++) {
            // 各交点ごとに、y軸方向前後4に対して最も近い交点を探す
            for (let dy = -4; dy <= 4; dy++) {
              if (
                x + dx < 0 ||
                y + dy < 0 ||
                x + dx > window.innerWidth ||
                y + dy > window.innerHeight
              ) {
                continue
              }

              if (previous[x + dx] === undefined) {
                previous[x + dx] = {}
              }

              let minimumDistance = previous[x + dx][y + dy]?.distance || Number.MAX_VALUE

              const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
              if (distance < minimumDistance) {
                previous[x + dx][y + dy] = { x, y, distance }
              }
            }
          }
        }
      }
      return previous
    })

    setCoordInfo(prevState => {
      const newState = { ...prevState }

      // x = 50ごとに垂直方向のグリッド線を引いている
      for (let x = 0; x <= window.innerWidth; x += 50) {
        // y = 50ごとに水平方向のグリッド線を引いている
        for (let y = 0; y <= window.innerHeight; y += 50) {
          if (newState[`${x}-${y}`] === undefined) {
            newState[`${x}-${y}`] = []
          }
          if (newState[`${x}-${y}`].every(info => info.type !== 'gridIntersection')) {
            newState[`${x}-${y}`] = [...newState[`${x}-${y}`], { type: 'gridIntersection' }]
          }
        }
      }
      return newState
    })
  }

  const enableSnapping = (...targetCoords: Coordinate[]) => {
    setSnapDestinationCoord(prevState => {
      const newState = { ...prevState }

      for (let targetCoord of targetCoords) {
        for (let dx = -4; dx <= 4; dx++) {
          for (let dy = -4; dy <= 4; dy++) {
            if (newState[targetCoord.x + dx] === undefined) {
              newState[targetCoord.x + dx] = {}
            }

            let minimumDistance =
              newState[targetCoord.x + dx][targetCoord.y + dy]?.distance || Number.MAX_VALUE

            const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
            if (distance < minimumDistance) {
              newState[targetCoord.x + dx][targetCoord.y + dy] = {
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
    <div>
      <Canvas
        stageRef={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        shapes={shapes}
        temporaryShape={temporaryShape}
        guideLines={guideLines}
        snappingDot={snappingCoord}
        tooltipContent={tooltipContent}
        currentCoordInfo={currentCoordInfo}
      />
      <ToolWindow
        activeShape={
          operationMode.startsWith('line:')
            ? 'line'
            : operationMode.startsWith('circle:')
            ? 'circle'
            : null
        }
        onActivateLineDraw={() => {
          changeDrawShape('line')
        }}
        onActivateCircleDraw={() => {
          changeDrawShape('circle')
        }}
        onClickExportButton={exportAsSvg}
        pointingCoord={pointingCoord}
        snappingCoord={snappingCoord}
      />
    </div>
  )
}

export default App
