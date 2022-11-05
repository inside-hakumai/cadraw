import { dragShadowShapeSelectorFamily } from '../../../container/state/shapeState'
import { useRecoilValue } from 'recoil'
import React from 'react'
import {
  isArcConstrainedByCenterTwoPoints,
  isArcConstrainedByThreePoints,
  isCircle,
  isLine,
  isRectangle,
} from '../../../lib/typeguard'
import DragShadowLine from './DragShadowLine'
import DragShadowRectangle from './DragShadowRectangle'
import DragShadowCircle from './DragShadowCircle'
import DragShadowArcConstrainedByCenterTwoPoints from './DragShadowArcConstrainedByCenterTwoPoints'
import DragShadowArcConstrainedByThreePoints from './DragShadowArcConstrainedByThreePoints'

interface Props {
  shapeId: number
}

const DragShadowShape: React.FC<Props> = React.memo(function DragShadowShape({ shapeId }) {
  const shape = useRecoilValue(dragShadowShapeSelectorFamily(shapeId))

  if (isLine(shape)) {
    return <DragShadowLine shapeId={shapeId} />
  }
  if (isRectangle(shape)) {
    return <DragShadowRectangle shapeId={shapeId} />
  }
  if (isCircle(shape)) {
    return <DragShadowCircle shapeId={shapeId} />
  }
  if (isArcConstrainedByCenterTwoPoints(shape)) {
    return <DragShadowArcConstrainedByCenterTwoPoints shapeId={shapeId} />
  }
  if (isArcConstrainedByThreePoints(shape)) {
    return <DragShadowArcConstrainedByThreePoints shapeId={shapeId} />
  }

  return null
})

export default DragShadowShape
