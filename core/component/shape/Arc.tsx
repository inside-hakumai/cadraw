import React from 'react'
import { useRecoilValue } from 'recoil'
import { shapeSelectorFamily } from '../../container/states'
import ArcConstrainedByThreePoints from '../constrainedShape/ArcConstrainedByThreePoints'
import {
  isArcConstrainedByCenterTwoPoints,
  isArcConstrainedByThreePoints,
} from '../../lib/typeguard'
import ArcConstrainedByCenterTwoPoints from '../constrainedShape/ArcConstrainedByCenterTwoPoints'

interface Props {
  shapeId: number
}

const Arc: React.FC<Props> = ({ shapeId }) => {
  const shape = useRecoilValue(shapeSelectorFamily(shapeId))

  if (isArcConstrainedByCenterTwoPoints(shape)) {
    return <ArcConstrainedByCenterTwoPoints shapeId={shapeId} />
  } else if (isArcConstrainedByThreePoints(shape)) {
    return <ArcConstrainedByThreePoints shapeId={shapeId} />
  } else {
    throw new Error(`Shape(ID = ${shapeId}) is not a arc`)
  }
}

export default Arc
