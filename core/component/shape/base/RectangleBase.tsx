import React from 'react'
import { getStrokeColor } from '../../../lib/function'

interface Props {
  upperLeftPoint: Coordinate
  upperRightPoint: Coordinate
  lowerLeftPoint: Coordinate
  isFocused: boolean
  isSelected: boolean
  drawType: DrawType
}

/**
 * 中央の一点と四隅いずれかの角の位置を指定して形成される長方形
 * @param shapeId 図形のID
 * @constructor
 */
const RectangleBase: React.FC<Props> = React.memo(function React({
  upperLeftPoint,
  upperRightPoint,
  lowerLeftPoint,
  isFocused,
  isSelected,
  drawType,
}) {
  return (
    <rect
      x={upperLeftPoint.x}
      y={upperLeftPoint.y}
      width={Math.abs(upperRightPoint.x - upperLeftPoint.x)}
      height={Math.abs(lowerLeftPoint.y - upperLeftPoint.y)}
      stroke={getStrokeColor(isSelected, isFocused, drawType)}
      strokeDasharray={drawType === 'supplemental' ? '3 3' : ''}
      fill={'none'}
    />
  )
})

export default RectangleBase
