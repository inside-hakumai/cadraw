import React from 'react'
import { getStrokeColor } from '../../../lib/function'

interface Props {
  center: Coordinate
  radius: number
  isFocused: boolean
  isSelected: boolean
  drawType: DrawType
}

const CircleBase: React.FC<Props> = React.memo(function Circle({
  center,
  radius,
  isFocused,
  isSelected,
  drawType,
}) {
  return (
    <circle
      cx={center.x}
      cy={center.y}
      r={radius}
      strokeWidth={1}
      fill={'none'}
      stroke={getStrokeColor(isSelected, isFocused, drawType)}
      strokeDasharray={drawType === 'supplemental' ? '3 3' : ''}
    />
  )
})

export default CircleBase
