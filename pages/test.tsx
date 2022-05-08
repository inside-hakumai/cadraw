import React, {useEffect, useRef, useState} from 'react'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import ToolWindow from "../components/ToolWindow";

const Canvas = dynamic(() => import('../components/canvas'), { ssr: false })

type OperationMode = 'point-center' | 'fix-radius'

const Test: NextPage = () => {

  const didMountRef = useRef(false)
  const stageRef = useRef<SVGSVGElement>(null)

  const [operationMode, setOperationMode] = useState<OperationMode>('point-center')
  const [temporaryCircle, setTemporaryCircle] = useState<{
    x: number,
    y: number,
    radius: number
    diameterStart: {x: number, y: number},
    diameterEnd: {x: number, y: number},
  } | null>(null)
  const [circles, setCircles] = useState<{x: number, y:number, radius: number}[]>([])

  useEffect(() => {
    if (didMountRef.current) {
      return
    }

    didMountRef.current = true
  }, [])

  const handleMouseDown = (event: React.MouseEvent) => {
    const coords = {x: event.clientX, y: event.clientY}

    if (operationMode === 'point-center') {
      setTemporaryCircle({
        x: coords.x, y: coords.y,
        radius: 0,
        diameterStart: {x: coords.x, y: coords.y},
        diameterEnd: {x: coords.x, y: coords.y},
      })
      setOperationMode('fix-radius')
    } else if (operationMode === 'fix-radius' && temporaryCircle) {
      setCircles([...circles, temporaryCircle])
      setTemporaryCircle(null)
      setOperationMode('point-center')
    }
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (operationMode !== 'fix-radius' || !temporaryCircle) {
      return
    }

    const coords = {x: event.clientX, y: event.clientY}

    const temporaryCircleRadius = Math.sqrt(
      Math.pow(temporaryCircle.x - coords.x, 2)
      + Math.pow(temporaryCircle.y - coords.y, 2)
    )
    const temporaryCircleDiameterStart = coords
    const temporaryCircleDiameterEnd = {
      x: coords.x + (temporaryCircle.x - coords.x) * 2,
      y: coords.y + (temporaryCircle.y - coords.y) * 2
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
              circles={circles}
              temporaryCircle={temporaryCircle}
      />
      <ToolWindow onClickExportButton={exportAsSvg} />
    </div>
  )
}

export default Test
