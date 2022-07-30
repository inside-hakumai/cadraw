import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import {
  indicatingShapeIdState,
  isShapeSelectedSelectorFamily,
  shapeSelectorFamily,
} from '../../container/states'
import { isCircle } from '../../lib/typeguard'
import { getStrokeColor } from '../../lib/function'

interface Props {
  shapeId: number
}

const Circle: React.FC<Props> = ({ shapeId }) => {
  const shape = useRecoilValue(shapeSelectorFamily(shapeId)) as Circle
  const indicatingShapeId = useRecoilValue(indicatingShapeIdState)

  const isFocused = indicatingShapeId === shape.id
  const isSelected = useRecoilValue(isShapeSelectedSelectorFamily(shapeId))

  useEffect(() => {
    console.debug(shape)
    if (!isCircle(shape)) {
      throw new Error(`Shape(ID = ${shapeId} is not a circle`)
    }
  }, [shapeId, shape])

  const { center, radius } = shape.computed

  return (
    <circle
      cx={center.x}
      cy={center.y}
      r={radius}
      strokeWidth={1}
      fill={'none'}
      stroke={getStrokeColor(isSelected, isFocused)}
      strokeDasharray={shape.type === 'supplemental' ? '3 3' : ''}
    />
  )
}

export default Circle
