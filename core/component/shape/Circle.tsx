import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import {
  indicatingShapeIdState,
  isShapeSelectedSelectorFamily,
  shapeStateFamily,
} from '../../container/states'
import { isCircleShape } from '../../lib/typeguard'

interface Props {
  shapeId: number
}

const Circle: React.FC<Props> = ({ shapeId }) => {
  const shape = useRecoilValue(shapeStateFamily(shapeId)) as CircleShape
  const indicatingShapeId = useRecoilValue(indicatingShapeIdState)

  const isFocused = indicatingShapeId === shape.id
  const isSelected = useRecoilValue(isShapeSelectedSelectorFamily(shapeId))

  let strokeColor
  if (isSelected) strokeColor = '#FF0000'
  else if (isFocused) strokeColor = '#ff9797'
  else strokeColor = '#000000'

  useEffect(() => {
    if (!isCircleShape(shape)) {
      throw new Error(`Shape(ID = ${shapeId} is not a circle`)
    }
  }, [shapeId, shape])

  const { center, radius } = shape

  return (
    <circle
      cx={center.x}
      cy={center.y}
      r={radius}
      strokeWidth={1}
      fill={'none'}
      stroke={strokeColor}
    />
  )
}

export default Circle
