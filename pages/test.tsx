import React, {useEffect, useRef, useState} from 'react'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import ToolWindow from "../components/ToolWindow";

const Canvas = dynamic(() => import('../components/Canvas'), { ssr: false })


const Test: NextPage = () => {

  const didMountRef = useRef(false)
  const stageRef = useRef<SVGSVGElement>(null)

  const [operationMode, setOperationMode] = useState<OperationMode>('circle:point-center')
  const [temporaryShape, setTemporaryShape] = useState<TemporaryShape | null>(null)
  const [shapes, setShapes] = useState<Shape[]>([])
  const [closestDot, setClosestDot] = useState<{[key: number]: { [key: number]: {x: number, y: number, distance: number}}}>({})
  // const [closestDot, setClosestDot] = useState<Coordinate[][] | null>(null)
  const [snappingDot, setSnappingDot] = useState<Coordinate | null>(null)

  useEffect(() => {
    if (didMountRef.current) {
      return
    }

    didMountRef.current = true
  }, [])

  useEffect(() => {
    console.debug(shapes)
  }, [shapes])

  const handleMouseDown = (event: React.MouseEvent) => {
    const coords = {x: event.clientX, y: event.clientY}

    if (operationMode === 'circle:point-center') {
      setTemporaryShape({
        type: 'temporary-circle',
        center: { x: coords.x, y: coords.y },
        radius: 0,
        diameterStart: {x: coords.x, y: coords.y},
        diameterEnd: {x: coords.x, y: coords.y},
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

      setShapes([...shapes, newCircle])
      setTemporaryShape(null)
      setOperationMode('circle:point-center')
      scanClosestDot(newCircle)

    } else if (operationMode === 'line:point-start') {
      setTemporaryShape({
        type: 'temporary-line',
        start: { x: coords.x, y: coords.y },
        end: { x: coords.x, y: coords.y },
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

      setShapes([...shapes, newLine])
      setTemporaryShape(null)
      setOperationMode('line:point-start')

    } else {
      throw new Error(`Unknown operation mode: ${operationMode}`)
    }
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    const coords = {x: event.clientX, y: event.clientY}
    console.debug(coords)

    setSnappingDot(closestDot?.[coords.x]?.[coords.y] || null)

    if (!(operationMode === 'circle:fix-radius' || operationMode === 'line:point-end')
      || !temporaryShape) {
      return
    }

    if (operationMode === 'circle:fix-radius') {
      const temporaryCircleShape = temporaryShape as TemporaryCircleShape

      const temporaryCircleRadius = Math.sqrt(
        Math.pow(temporaryCircleShape.center.x - coords.x, 2)
        + Math.pow(temporaryCircleShape.center.y - coords.y, 2)
      )
      const temporaryCircleDiameterStart = coords
      const temporaryCircleDiameterEnd = {
        x: coords.x + (temporaryCircleShape.center.x - coords.x) * 2,
        y: coords.y + (temporaryCircleShape.center.y - coords.y) * 2
      }

      setTemporaryShape({
        ...temporaryShape,
        radius: temporaryCircleRadius,
        diameterStart: temporaryCircleDiameterStart,
        diameterEnd: temporaryCircleDiameterEnd
      } as TemporaryCircleShape)

    } else if (operationMode === 'line:point-end') {
      setTemporaryShape((prev) => ({
        ...prev,
        end: coords
      }) as TemporaryLineShape)
    }
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

    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

    const anchor = document.createElement('a')
    anchor.download = 'exported.svg'
    anchor.href = url
    anchor.click()
    anchor.remove()
  }

  const scanClosestDot = (shape: CircleShape) => {
    if (!stageRef.current) {
      return
    }

    const tmpClosestDot: {[key: number]: { [key: number]: {x: number, y: number, distance: number}}} = closestDot

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
    setClosestDot(tmpClosestDot)
  }

  return (
    <div>
      <Canvas stageRef={stageRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              shapes={shapes}
              temporaryShape={temporaryShape}
              snappingDot={snappingDot}
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
      />
    </div>
  )
}

export default Test
