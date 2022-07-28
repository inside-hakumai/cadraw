import React from 'react'
import { useRecoilValue } from 'recoil'
import { shapeSelectorFamily } from '../../container/states'
import { isRectangleCenterCorner, isRectangleTwoCorners } from '../../lib/typeguard'
import RectangleTwoCorners from './RectangleTwoCorners'
import RectangleCenterCorner from './RectangleCenterCorner'

interface Props {
  shapeId: number
}

const Rectangle: React.FC<Props> = ({ shapeId }) => {
  const shape = useRecoilValue(shapeSelectorFamily(shapeId))

  if (isRectangleTwoCorners(shape)) {
    return <RectangleTwoCorners shapeId={shapeId} />
  } else if (isRectangleCenterCorner(shape)) {
    return <RectangleCenterCorner shapeId={shapeId} />
  } else {
    throw new Error(`Shape(ID = ${shapeId}) is not a rectangle`)
  }
}

export default Rectangle
