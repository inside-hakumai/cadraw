import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { isArcConstrainedByCenterTwoPoints } from '../../../lib/typeguard'
import ArcConstrainedByCenterTwoPointsBase from '../../shape/base/ArcConstrainedByCenterTwoPointsBase'
import { dragShadowShapeSelectorFamily } from '../../../container/state/shapeState'

interface Props {
  shapeId: number
}

/**
 * 弧を含む円周の中心点と、弧の両端の位置を指定して形成する弧
 * @param shapeId 図形のID
 * @constructor
 */
const DragShadowArcConstrainedByCenterTwoPoints: React.FC<Props> = ({ shapeId }) => {
  const shape = useRecoilValue(
    dragShadowShapeSelectorFamily(shapeId)
  ) as Arc<CenterAndTwoPointsConstraints>

  const { center } = shape.constraints
  const { radius, startPointAngle, endPointAngle } = shape.computed

  useEffect(() => {
    if (!isArcConstrainedByCenterTwoPoints(shape)) {
      throw new Error(`Shape(ID = ${shapeId} is not a arc`)
    }
  }, [shapeId, shape])

  return (
    <ArcConstrainedByCenterTwoPointsBase
      center={center}
      radius={radius}
      startPointAngle={startPointAngle}
      endPointAngle={endPointAngle}
      isFocused={false}
      isSelected={false}
      drawType={'dragShadow'}
    />
  )
}

export default DragShadowArcConstrainedByCenterTwoPoints
