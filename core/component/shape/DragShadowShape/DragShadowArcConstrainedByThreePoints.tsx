import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { isArcConstrainedByThreePoints } from '../../../lib/typeguard'
import ArcConstrainedByThreePointsBase from '../../shape/base/ArcConstrainedByThreePointsBase'
import { dragShadowShapeSelectorFamily } from '../../../container/state/shapeState'

interface Props {
  shapeId: number
}

/**
 * 弧の両端の位置および弧上の1点を指定して形成する弧
 * @param shapeId 図形のID
 * @constructor
 */
const DragShadowArcConstrainedByThreePoints: React.FC<Props> = ({ shapeId }) => {
  const shape = useRecoilValue(
    dragShadowShapeSelectorFamily(shapeId)
  ) as Arc<ThreePointsConstraints>

  useEffect(() => {
    if (!isArcConstrainedByThreePoints(shape)) {
      throw new Error(`Shape(ID = ${shapeId}) is not a arc`)
    }
  }, [shapeId, shape])

  const { startPoint, endPoint, onLinePoint } = shape.constraints
  const { center, radius } = shape.computed

  return (
    <ArcConstrainedByThreePointsBase
      center={center}
      radius={radius}
      startPoint={startPoint}
      endPoint={endPoint}
      onLinePoint={onLinePoint}
      isFocused={false}
      isSelected={false}
      drawType={shape.type}
    />
  )
}

export default DragShadowArcConstrainedByThreePoints
