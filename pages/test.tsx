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

  useEffect(() => {
    if (didMountRef.current) {
      return
    }

    didMountRef.current = true
  }, [])

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

      const newCircle: CircleShape = {
        type: 'circle',
        center: { x: temporaryCircleShape.center.x, y: temporaryCircleShape.center.y},
        radius: temporaryCircleShape.radius
      }

      setShapes([...shapes, newCircle])
      setTemporaryShape(null)
      setOperationMode('circle:point-center')

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
      }

      setShapes([...shapes, newLine])
      setTemporaryShape(null)
      setOperationMode('line:point-start')

    } else {
      throw new Error(`Unknown operation mode: ${operationMode}`)
    }
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!(operationMode === 'circle:fix-radius' || operationMode === 'line:point-end')
      || !temporaryShape) {
      return
    }

    if (operationMode === 'circle:fix-radius') {
      const temporaryCircleShape = temporaryShape as TemporaryCircleShape

      const coords = {x: event.clientX, y: event.clientY}

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
      const coords = {x: event.clientX, y: event.clientY}

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

  return (
    <div>
      <Canvas stageRef={stageRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              shapes={shapes}
              temporaryShape={temporaryShape}
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
