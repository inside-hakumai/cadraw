import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import {
  indicatingShapeIdState,
  isShapeSelectedSelectorFamily,
  shapeSelectorFamily,
} from '../../container/states'
import { isArcCenterTwoPoints } from '../../lib/typeguard'

interface Props {
  shapeId: number
}

const ArcCenterTwoPoints: React.FC<Props> = ({ shapeId }) => {
  const shape = useRecoilValue(
    shapeSelectorFamily(shapeId)
  ) as Arc<ArcConstraintsWithCenterAndTwoPoints>
  const indicatingShapeId = useRecoilValue(indicatingShapeIdState)

  const { center, radius, startPointAngle, endPointAngle } = shape.constraints

  const isFocused = indicatingShapeId === shape.id
  const isSelected = useRecoilValue(isShapeSelectedSelectorFamily(shapeId))

  let strokeColor
  if (isSelected) strokeColor = '#FF0000'
  else if (isFocused) strokeColor = '#ff9797'
  else strokeColor = '#000000'

  useEffect(() => {
    if (!isArcCenterTwoPoints(shape)) {
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
      stroke={strokeColor}
      strokeWidth='1'
      strokeDasharray={shape.type === 'supplemental' ? '3 3' : ''}
    />
  )
}

export default ArcCenterTwoPoints
