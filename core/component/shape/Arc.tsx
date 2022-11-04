import React from 'react'
import { useRecoilValue } from 'recoil'
import ArcConstrainedByThreePoints from '../constrainedShape/ArcConstrainedByThreePoints'
import {
  isArcConstrainedByCenterTwoPoints,
  isArcConstrainedByThreePoints,
} from '../../lib/typeguard'
import ArcConstrainedByCenterTwoPoints from '../constrainedShape/ArcConstrainedByCenterTwoPoints'
import { shapeSelectorFamily } from '../../container/state/shapeState'

interface Props {
  shapeId: number
}

const Arc: React.FC<Props> = React.memo(function Arc({ shapeId }) {
  const shape = useRecoilValue(shapeSelectorFamily(shapeId))

  if (isArcConstrainedByCenterTwoPoints(shape)) {
    return <ArcConstrainedByCenterTwoPoints shapeId={shapeId} />
  } else if (isArcConstrainedByThreePoints(shape)) {
    return <ArcConstrainedByThreePoints shapeId={shapeId} />
  } else {
    throw new Error(`Shape(ID = ${shapeId}) is not a arc`)
  }
})

export default Arc
