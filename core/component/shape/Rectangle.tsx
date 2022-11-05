import React from 'react'
import { useRecoilValue } from 'recoil'
import RectangleConstrainedByTwoCorners from '../constrainedShape/RectangleConstrainedByTwoCorners'
import RectangleConstrainedByCenterCorner from '../constrainedShape/RectangleConstrainedByCenterCorner'
import {
  isRectangleConstrainedByCenterCorner,
  isRectangleConstrainedByTwoCorners,
} from '../../lib/typeguard'
import { shapeSelectorFamily } from '../../container/state/shapeState'

interface Props {
  shapeId: number
}

const Rectangle: React.FC<Props> = React.memo(function Rectangle({ shapeId }) {
  const shape = useRecoilValue(shapeSelectorFamily(shapeId))

  if (isRectangleConstrainedByTwoCorners(shape)) {
    return <RectangleConstrainedByTwoCorners shapeId={shapeId} />
  } else if (isRectangleConstrainedByCenterCorner(shape)) {
    return <RectangleConstrainedByCenterCorner shapeId={shapeId} />
  } else {
    throw new Error(`Shape(ID = ${shapeId}) is not a rectangle`)
  }
})

export default Rectangle
