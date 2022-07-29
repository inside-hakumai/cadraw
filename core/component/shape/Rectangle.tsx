import React from 'react'
import { useRecoilValue } from 'recoil'
import { shapeSelectorFamily } from '../../container/states'
import RectangleConstrainedByTwoCorners from '../constrainedShape/RectangleConstrainedByTwoCorners'
import RectangleConstrainedByCenterCorner from '../constrainedShape/RectangleConstrainedByCenterCorner'
import {
  isRectangleConstrainedByCenterCorner,
  isRectangleConstrainedByTwoCorners,
} from '../../lib/typeguard'

interface Props {
  shapeId: number
}

const Rectangle: React.FC<Props> = ({ shapeId }) => {
  const shape = useRecoilValue(shapeSelectorFamily(shapeId))

  if (isRectangleConstrainedByTwoCorners(shape)) {
    return <RectangleConstrainedByTwoCorners shapeId={shapeId} />
  } else if (isRectangleConstrainedByCenterCorner(shape)) {
    return <RectangleConstrainedByCenterCorner shapeId={shapeId} />
  } else {
    throw new Error(`Shape(ID = ${shapeId}) is not a rectangle`)
  }
}

export default Rectangle
