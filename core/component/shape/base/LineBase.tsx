import React from 'react'
import { getStrokeColor } from '../../../lib/function'

interface Props {
  startPoint: Coordinate
  endPoint: Coordinate
  isSelected: boolean
  isFocused: boolean
  drawType: DrawType
}

const LineBase: React.FC<Props> = React.memo(function LineBase({
  startPoint,
  endPoint,
  isSelected,
  isFocused,
  drawType,
}) {
  return (
    <line
      x1={startPoint.x}
      y1={startPoint.y}
      x2={endPoint.x}
      y2={endPoint.y}
      strokeWidth={1}
      stroke={getStrokeColor(isSelected, isFocused, drawType)}
      strokeDasharray={drawType === 'supplemental' ? '3 3' : ''}
    />
  )
})

export default LineBase
