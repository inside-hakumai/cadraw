import React, {useEffect, useRef, useState} from 'react'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Konva from "konva"

const Canvas = dynamic(() => import('../components/canvas'), { ssr: false })

const Test: NextPage = () => {

  const didMountRef = useRef(false)

  const [nodes, setNodes] = useState<{x: number, y:number}[]>([])

  useEffect(() => {
    if (didMountRef.current) {
      return
    }

    didMountRef.current = true
  }, [])

  const handleMouseUp = (event: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = event.target.getStage()
    if (stage) {
      console.debug(event)
      const vector = stage.getPointerPosition()
      if (vector) {
        const { x, y } = vector
        setNodes([...nodes, {x, y}])
      }
    }
  }

  return (
    <div>
      <Canvas onMouseup={handleMouseUp} circleCenterCoordinates={nodes} />
    </div>
  )
}

export default Test
