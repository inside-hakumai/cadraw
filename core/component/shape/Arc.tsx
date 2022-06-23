import React from 'react'
import { isArcShape, isArcWithThreePointsShape } from '../../lib/typeguard'
import { useRecoilValue } from 'recoil'
import { shapeSelectorFamily } from '../../container/states'
import ArcWithCenterTwoPoints from './ArcWithCenterTwoPoints'
import ArcWithThreePoints from './ArcWithThreePoints'

interface Props {
  shapeId: number
}

const Arc: React.FC<Props> = ({ shapeId }) => {
  const shape = useRecoilValue(shapeSelectorFamily(shapeId))

  if (isArcShape(shape)) {
    return <ArcWithCenterTwoPoints shapeId={shapeId} />
  } else if (isArcWithThreePointsShape(shape)) {
    return <ArcWithThreePoints shapeId={shapeId} />
  } else {
    throw new Error(`Shape(ID = ${shapeId}) is not a arc`)
  }
}

export default Arc
