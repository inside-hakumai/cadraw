import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { isArcConstrainedByCenterTwoPoints } from '../../lib/typeguard'
import { getStrokeColor } from '../../lib/function'
import {
  isShapeSelectedSelectorFamily,
  shapeSelectorFamily,
} from '../../container/state/shapeState'
import { isIndicatedFamily } from '../../container/state/cursorState'

interface Props {
  shapeId: number
}

/**
 * 弧を含む円周の中心点と、弧の両端の位置を指定して形成する弧
 * @param shapeId 図形のID
 * @constructor
 */
const ArcConstrainedByCenterTwoPoints: React.FC<Props> = ({ shapeId }) => {
  const shape = useRecoilValue(shapeSelectorFamily(shapeId)) as Arc<CenterAndTwoPointsConstraints>
  const isFocused = useRecoilValue(isIndicatedFamily(shapeId))
  const isSelected = useRecoilValue(isShapeSelectedSelectorFamily(shapeId))

  const { center } = shape.constraints
  const { radius, startPointAngle, endPointAngle } = shape.computed

  useEffect(() => {
    if (!isArcConstrainedByCenterTwoPoints(shape)) {
      throw new Error(`Shape(ID = ${shapeId} is not a arc`)
    }
  }, [shapeId, shape])

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
      stroke={getStrokeColor(isSelected, isFocused)}
      strokeWidth='1'
      strokeDasharray={shape.type === 'supplemental' ? '3 3' : ''}
    />
  )
}

export default ArcConstrainedByCenterTwoPoints
