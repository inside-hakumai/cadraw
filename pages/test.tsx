import React, {useEffect, useRef, useState} from 'react'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Konva from "konva"

const Canvas = dynamic(() => import('../components/canvas'), { ssr: false })

type OperationMode = 'point-center' | 'fix-radius'

const Test: NextPage = () => {

  const didMountRef = useRef(false)

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

  const handleMouseDown = (event: Konva.KonvaEventObject<MouseEvent>) => {
    let coords: {x: number, y: number} | null = null

    const stage = event.target.getStage()
    if (stage) {
      console.debug(event)
      const vector = stage.getPointerPosition()
      if (vector) {
        coords = {x: vector.x, y: vector.y}
      }
    }

    if (!coords) {
      return
    }

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

  const handleMouseMove = (event: Konva.KonvaEventObject<MouseEvent>) => {
    if (operationMode !== 'fix-radius' || !temporaryCircle) {
      return
    }

    let coords: {x: number, y: number} | null = null

    const stage = event.target.getStage()
    if (stage) {
      console.debug(event)
      const vector = stage.getPointerPosition()
      if (vector) {
        coords = {x: vector.x, y: vector.y}
      }
    }

    if (!coords) {
      return
    }

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

  return (
    <div>
      <Canvas onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              circles={circles}
              temporaryCircle={temporaryCircle}
      />
    </div>
  )
}

export default Test
