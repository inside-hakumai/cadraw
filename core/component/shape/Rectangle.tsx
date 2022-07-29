import React from 'react'
import { useRecoilValue } from 'recoil'
import { shapeSelectorFamily } from '../../container/states'
import RectangleTwoCorners from './RectangleTwoCorners'
import RectangleCenterCorner from './RectangleCenterCorner'
import {
  isRectangleWithCenterCornerConstraints,
  isRectangleWithTwoCornersConstraints,
} from '../../lib/typeguard'

interface Props {
  shapeId: number
}

const Rectangle: React.FC<Props> = ({ shapeId }) => {
  const shape = useRecoilValue(shapeSelectorFamily(shapeId))

  if (isRectangleWithTwoCornersConstraints(shape)) {
    return <RectangleTwoCorners shapeId={shapeId} />
  } else if (isRectangleWithCenterCornerConstraints(shape)) {
    return <RectangleCenterCorner shapeId={shapeId} />
  } else {
    throw new Error(`Shape(ID = ${shapeId}) is not a rectangle`)
  }
}

export default Rectangle
