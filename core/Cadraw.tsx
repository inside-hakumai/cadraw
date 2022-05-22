import React, {useEffect, useRef, useState} from 'react'
import ToolWindow from "./components/ToolWindow";

import Canvas from './components/Canvas'

interface Props {
  onExport?: (data: string) => void
}

const Cadraw: React.FC<Props> = ({onExport}) => {

  const didMountRef = useRef(false)
  const stageRef = useRef<SVGSVGElement>(null)

  const [operationMode, setOperationMode] = useState<OperationMode>('circle:point-center')
  const [temporaryShape, setTemporaryShape] = useState<TemporaryShape | null>(null)
  const [shapes, setShapes] = useState<Shape[]>([])
  const [snapDestinationCoord, setSnapDestinationCoord] = useState<{[x: number]: { [y: number]: {x: number, y: number, distance: number}}}>({})
  // const [snapDestinationCoord, setClosestDot] = useState<Coordinate[][] | null>(null)
  const [coordInfo, setCoordInfo] = useState<{[xy: string]: string[]}>({})
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
        diameterStart: {x: coord.x, y: coord.y},
        diameterEnd: {x: coord.x, y: coord.y},
      } as TemporaryCircleShape)
      setOperationMode('circle:fix-radius')

    } else if (operationMode === 'circle:fix-radius' && temporaryShape) {
      const temporaryCircleShape = temporaryShape as TemporaryCircleShape

      const {center, radius} = temporaryCircleShape

      // 0.5度間隔で円を構成する720個の座標を特定する
      const approximatedCoords: { x: number, y:number }[] = []
      for (let i = 0; i < 720; i++) {
        const x = center.x + radius * Math.cos(2 * Math.PI * i / 720)
        const y = center.y + radius * Math.sin(2 * Math.PI * i / 720)
        approximatedCoords.push({x, y})
      }

      const newCircle: CircleShape = {
        type: 'circle',
        center, radius, approximatedCoords
      }

      setCoordInfo(prevState => {
        if (prevState[`${center.x}-${center.y}`]) {
          return {
            ...prevState,
            [`${center.x}-${center.y}`]: [...prevState[`${center.x}-${center.y}`], '円の中心']
          }
        } else {
          return {
            ...prevState,
            [`${center.x}-${center.y}`]: ['円の中心']
          }
        }
      })
      setSnapDestinationCoord(prevState => {
        const newState = {...prevState}

        for (let dx = -4; dx <= 4; dx++) {
          for (let dy = -4; dy <= 4; dy++) {
            if (newState[center.x + dx] === undefined) {
              newState[center.x + dx] = {}
            }

            let minimumDistance = newState[center.x + dx][center.y + dy]?.distance || Number.MAX_VALUE

            const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
            if (distance < minimumDistance) {
              newState[center.x + dx][center.y + dy] = {x: center.x, y: center.y, distance}
            }
          }
        }
        return newState
      })
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
        start: { x: temporaryLineShape.start.x, y: temporaryLineShape.start.y },
        end: { x: temporaryLineShape.end.x, y: temporaryLineShape.end.y },
        approximatedCoords: []
      }

      setTooltipContent(null)
      setShapes([...shapes, newLine])
      setTemporaryShape(null)
      setOperationMode('line:point-start')

    } else {
      throw new Error(`Unknown operation mode: ${operationMode}`)
    }
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    const pointingCoord = convertDomCoordToSvgCoord({x: event.clientX, y: event.clientY})
    setPointingCoord(pointingCoord)
    setSnappingCoord(snapDestinationCoord?.[pointingCoord.x]?.[pointingCoord.y] || null)
    const coord = snappingCoord ? snappingCoord : pointingCoord

    if (coordInfo?.[`${coord.x}-${coord.y}`]) {
      setCurrentCoordInfo(coordInfo[`${coord.x}-${coord.y}`])
    } else {
      setCurrentCoordInfo(null)
    }

    if (!(operationMode === 'circle:fix-radius' || operationMode === 'line:point-end')
      || !temporaryShape) {
      return
    }

    if (operationMode === 'circle:fix-radius') {
      const temporaryCircleShape = temporaryShape as TemporaryCircleShape

      const temporaryCircleRadius = Math.sqrt(
        Math.pow(temporaryCircleShape.center.x - coord.x, 2)
        + Math.pow(temporaryCircleShape.center.y - coord.y, 2)
      )
      const temporaryCircleDiameterStart = coord
      const temporaryCircleDiameterEnd = {
        x: coord.x + (temporaryCircleShape.center.x - coord.x) * 2,
        y: coord.y + (temporaryCircleShape.center.y - coord.y) * 2
      }

      setTemporaryShape({
        ...temporaryShape,
        radius: temporaryCircleRadius,
        diameterStart: temporaryCircleDiameterStart,
        diameterEnd: temporaryCircleDiameterEnd
      } as TemporaryCircleShape)

      setTooltipContent((temporaryCircleRadius * 2).toFixed(2) + 'px')


    } else if (operationMode === 'line:point-end') {
      const temporaryLineShape = temporaryShape as TemporaryLineShape
      setTemporaryShape((prev) => ({
        ...prev,
        end: coord
      }) as TemporaryLineShape)
      setTooltipContent(Math.sqrt(Math.pow(temporaryLineShape.start.x - coord.x, 2) + Math.pow(temporaryLineShape.start.y - coord.y, 2)).toFixed(2) + 'px')
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
      case "line":
        setOperationMode('line:point-start')
        break
      case "circle":
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
      const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
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

    const tmpClosestDot: {[key: number]: { [key: number]: {x: number, y: number, distance: number}}} = snapDestinationCoord

    shape.approximatedCoords.forEach(circleDot => {
      const { x: circleX, y: circleY } = circleDot

      const scanCoordRange = {
        xStart: Math.floor(circleX) - 4,
        xEnd: Math.ceil(circleX) + 4,
        yStart: Math.floor(circleY) - 4,
        yEnd: Math.ceil(circleY) + 4
      }

      for (let i = scanCoordRange.xStart; i <= scanCoordRange.xEnd; i++) {
        for (let j = scanCoordRange.yStart; j < scanCoordRange.yEnd; j++) {
          if (tmpClosestDot[i] === undefined) {
            tmpClosestDot[i] = {}
          }

          let minimumDistance = tmpClosestDot[i][j]?.distance || Number.MAX_VALUE

          const distance = Math.sqrt(Math.pow(circleX - i, 2) + Math.pow(circleY - j, 2))
          if (distance < minimumDistance) {
            tmpClosestDot[i][j] = {x: circleX, y: circleY, distance}
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

    setSnapDestinationCoord((previous) => {
      // x = 50ごとに垂直方向のグリッド線を引いている
      for (let x = 0; x <= window.innerWidth; x += 50) {
        // y = 50ごとに水平方向のグリッド線を引いている
        for (let y = 0; y <= window.innerHeight; y += 50) {
          // 各交点ごとに、x軸方向前後4に対して最も近い交点を探す
          for (let dx = -4; dx <= 4; dx++) {
            // 各交点ごとに、y軸方向前後4に対して最も近い交点を探す
            for (let dy = -4; dy <= 4; dy++) {

              if (x + dx < 0 || y + dy < 0 || x + dx > window.innerWidth || y + dy > window.innerHeight) {
                continue
              }

              if (previous[x + dx] === undefined) {
                previous[x + dx] = {}
              }

              let minimumDistance = previous[x + dx][y + dy]?.distance || Number.MAX_VALUE

              const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
              if (distance < minimumDistance) {
                previous[x + dx][y + dy] = {x, y, distance}
              }

            }
          }
        }
      }
      return previous
    })

    setCoordInfo(prevState => {
      const newState = {...prevState}

      // x = 50ごとに垂直方向のグリッド線を引いている
      for (let x = 0; x <= window.innerWidth; x += 50) {
        // y = 50ごとに水平方向のグリッド線を引いている
        for (let y = 0; y <= window.innerHeight; y += 50) {
          if (newState[`${x}-${y}`] === undefined) {
            newState[`${x}-${y}`] = []
          }
          if (!newState[`${x}-${y}`].includes("グリッドの交点")) {
            newState[`${x}-${y}`] = [...newState[`${x}-${y}`], "グリッドの交点"]
          }
        }
      }
      return newState
    })
  }

  return (
    <div>
      <Canvas stageRef={stageRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              shapes={shapes}
              temporaryShape={temporaryShape}
              snappingDot={snappingCoord}
              tooltipContent={tooltipContent}
              currentCoordInfo={currentCoordInfo}
      />
      <ToolWindow
        activeShape={
          operationMode.startsWith('line:') ? 'line' :
          operationMode.startsWith('circle:') ? 'circle' :
          null
        }
        onActivateLineDraw={() => {changeDrawShape('line')}}
        onActivateCircleDraw={() => {changeDrawShape('circle')}}
        onClickExportButton={exportAsSvg}
        pointingCoord={pointingCoord}
        snappingCoord={snappingCoord}
      />
    </div>
  )
}

export default Cadraw
