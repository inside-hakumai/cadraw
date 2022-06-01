import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { indicatingShape, shapeStateFamily } from '../../container/states'
import { isLineShape } from '../../lib/typeguard'

interface Props {
  shapeId: number
}

const Line: React.FC<Props> = ({ shapeId }) => {
  const shape = useRecoilValue(shapeStateFamily(shapeId)) as LineShape
  const indicatingShapeId = useRecoilValue(indicatingShape)

  const isFocused = indicatingShapeId === shape.id

  useEffect(() => {
    if (!isLineShape(shape)) {
      throw new Error(`Shape(ID = ${shapeId} is not a line`)
    }
  }, [shape])

  const { start, end } = shape

  return (
    <line
      x1={start.x}
      y1={start.y}
      x2={end.x}
      y2={end.y}
      strokeWidth={1}
      stroke={isFocused ? 'red' : 'black'}
    />
  )
}

export default Line
