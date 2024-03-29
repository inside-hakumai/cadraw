import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { isArcConstrainedByThreePoints } from '../../lib/typeguard'
import {
  isShapeSelectedSelectorFamily,
  shapeSelectorFamily,
} from '../../container/state/shapeState'
import { isIndicatedFamily } from '../../container/state/cursorState'
import ArcConstrainedByThreePointsBase from '../shape/base/ArcConstrainedByThreePointsBase'

interface Props {
  shapeId: number
}

/**
 * 弧の両端の位置および弧上の1点を指定して形成する弧
 * @param shapeId 図形のID
 * @constructor
 */
const ArcConstrainedByThreePoints: React.FC<Props> = ({ shapeId }) => {
  const shape = useRecoilValue(shapeSelectorFamily(shapeId)) as Arc<ThreePointsConstraints>
  const isFocused = useRecoilValue(isIndicatedFamily(shapeId))
  const isSelected = useRecoilValue(isShapeSelectedSelectorFamily(shapeId))

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
      isFocused={isFocused}
      isSelected={isSelected}
      drawType={shape.type}
    />
  )
}

export default ArcConstrainedByThreePoints
