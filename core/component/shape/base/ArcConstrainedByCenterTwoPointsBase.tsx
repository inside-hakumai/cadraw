import React from 'react'
import { getStrokeColor } from '../../../lib/function'

interface Props {
  center: Coordinate
  radius: number
  startPointAngle: number
  endPointAngle: number
  isFocused: boolean
  isSelected: boolean
  drawType: DrawType
}

const ArcConstrainedByCenterTwoPointsBase: React.FC<Props> = ({
  center,
  radius,
  startPointAngle,
  endPointAngle,
  isFocused,
  isSelected,
  drawType,
}) => {
  const arcStartEdgeCoord = {
    x: center.x + radius * Math.cos((startPointAngle / 180) * Math.PI),
    y: center.y - radius * Math.sin((startPointAngle / 180) * Math.PI), // xy座標系とSVG空間の座標系ではy軸の正負が逆転する
  }
  const arcEndEdgeCoord = {
    x: center.x + radius * Math.cos((endPointAngle / 180) * Math.PI),
    y: center.y - radius * Math.sin((endPointAngle / 180) * Math.PI), // xy座標系とSVG空間の座標系ではy軸の正負が逆転する
  }

  const counterClockWiseAngle =
    endPointAngle > startPointAngle
      ? endPointAngle - startPointAngle
      : 360 - (startPointAngle - endPointAngle)
  const shouldUseLargeArc = counterClockWiseAngle > 180

  const pathNodeAttribute = [
    `M ${arcStartEdgeCoord.x} ${arcStartEdgeCoord.y}`,
    `A ${radius} ${radius} 0 ` +
      `${shouldUseLargeArc ? 1 : 0} ` + // 1なら円弧の長いほう、0なら短いほう
      `0 ${arcEndEdgeCoord.x} ${arcEndEdgeCoord.y}`,
  ]

  return (
    <path
      key={'temporaryArc'}
      d={pathNodeAttribute.join(' ')}
      fill='none'
      stroke={getStrokeColor(isSelected, isFocused, drawType)}
      strokeWidth='1'
      strokeDasharray={drawType === 'supplemental' ? '3 3' : ''}
    />
  )
}

export default ArcConstrainedByCenterTwoPointsBase
