import React, {useEffect, useRef, useState} from 'react'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import ToolWindow from "../components/ToolWindow";

const Canvas = dynamic(() => import('../components/canvas'), { ssr: false })


const Test: NextPage = () => {

  const didMountRef = useRef(false)
  const stageRef = useRef<SVGSVGElement>(null)

  const [operationMode, setOperationMode] = useState<OperationMode>('circle:point-center')
  const [temporaryCircle, setTemporaryCircle] = useState<TemporaryCircleShape | null>(null)
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
      setTemporaryCircle({
        type: 'temporary-circle',
        center: { x: coords.x, y: coords.y },
        radius: 0,
        diameterStart: {x: coords.x, y: coords.y},
        diameterEnd: {x: coords.x, y: coords.y},
      })
      setOperationMode('circle:fix-radius')
    } else if (operationMode === 'circle:fix-radius' && temporaryCircle) {
      const newCircle: CircleShape = {
        type: 'circle',
        center: { x: temporaryCircle.center.x, y: temporaryCircle.center.y},
        radius: temporaryCircle.radius
      }

      setShapes([...shapes, newCircle])
      setTemporaryCircle(null)
      setOperationMode('circle:point-center')
    }
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (operationMode !== 'circle:fix-radius' || !temporaryCircle) {
      return
    }

    const coords = {x: event.clientX, y: event.clientY}

    const temporaryCircleRadius = Math.sqrt(
      Math.pow(temporaryCircle.center.x - coords.x, 2)
      + Math.pow(temporaryCircle.center.y - coords.y, 2)
    )
    const temporaryCircleDiameterStart = coords
    const temporaryCircleDiameterEnd = {
      x: coords.x + (temporaryCircle.center.x - coords.x) * 2,
      y: coords.y + (temporaryCircle.center.y - coords.y) * 2
    }

    setTemporaryCircle({...temporaryCircle,
      radius: temporaryCircleRadius,
      diameterStart: temporaryCircleDiameterStart,
      diameterEnd: temporaryCircleDiameterEnd
    })
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
              temporaryShape={temporaryCircle}
      />
      <ToolWindow
        onClickExportButton={exportAsSvg}
      />
    </div>
  )
}

export default Test
