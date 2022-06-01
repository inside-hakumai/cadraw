import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { indicatingShape, shapeStateFamily } from '../../container/states'
import { isCircleShape } from '../../lib/typeguard'

interface Props {
  shapeId: number
}

const Circle: React.FC<Props> = ({ shapeId }) => {
  const shape = useRecoilValue(shapeStateFamily(shapeId)) as CircleShape
  const indicatingShapeId = useRecoilValue(indicatingShape)

  const isFocused = indicatingShapeId === shape.id

  useEffect(() => {
    if (!isCircleShape(shape)) {
      throw new Error(`Shape(ID = ${shapeId} is not a circle`)
    }
  }, [shape])

  const { center, radius } = shape

  return (
    <circle
      cx={center.x}
      cy={center.y}
      r={radius}
      strokeWidth={1}
      fill={'none'}
      stroke={isFocused ? 'red' : 'black'}
    />
  )
}

export default Circle
