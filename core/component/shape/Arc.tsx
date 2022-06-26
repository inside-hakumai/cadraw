import React from 'react'
import { useRecoilValue } from 'recoil'
import { shapeSelectorFamily } from '../../container/states'
import ArcThreePoints from './ArcThreePoints'
import ArcWithCenterTwoPoints from './ArcCenterTwoPoints'
import { isArcCenterTwoPoints, isArcThreePoints } from '../../lib/typeguard'

interface Props {
  shapeId: number
}

const Arc: React.FC<Props> = ({ shapeId }) => {
  const shape = useRecoilValue(shapeSelectorFamily(shapeId))

  if (isArcCenterTwoPoints(shape)) {
    return <ArcWithCenterTwoPoints shapeId={shapeId} />
  } else if (isArcThreePoints(shape)) {
    return <ArcThreePoints shapeId={shapeId} />
  } else {
    throw new Error(`Shape(ID = ${shapeId}) is not a arc`)
  }
}

export default Arc
