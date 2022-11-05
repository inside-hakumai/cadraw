import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { isCircle } from '../../../lib/typeguard'
import { dragShadowShapeSelectorFamily } from '../../../container/state/shapeState'
import CircleBase from '../base/CircleBase'

interface Props {
  shapeId: number
}

const DragShadowCircle: React.FC<Props> = ({ shapeId }) => {
  const shape = useRecoilValue(dragShadowShapeSelectorFamily(shapeId)) as Circle

  useEffect(() => {
    if (!isCircle(shape)) {
      throw new Error(`Shape(ID = ${shapeId}) is not a Circle`)
    }
  }, [shapeId, shape])

  const { center, radius } = shape.computed

  return (
    <CircleBase
      center={center}
      radius={radius}
      isFocused={false}
      isSelected={false}
      drawType={'dragShadow'}
    />
  )
}

export default DragShadowCircle
