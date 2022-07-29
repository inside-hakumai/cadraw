import React from 'react'
import { useRecoilValue } from 'recoil'
import { shapeSelectorFamily } from '../../container/states'
import RectangleTwoCorners from './RectangleTwoCorners'
import RectangleCenterCorner from './RectangleCenterCorner'
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
    return <RectangleTwoCorners shapeId={shapeId} />
  } else if (isRectangleConstrainedByCenterCorner(shape)) {
    return <RectangleCenterCorner shapeId={shapeId} />
  } else {
    throw new Error(`Shape(ID = ${shapeId}) is not a rectangle`)
  }
}

export default Rectangle
