import React, { useEffect } from 'react'
import { isArcShape } from '../../lib/typeguard'
import { useRecoilValue } from 'recoil'
import {
  indicatingShapeIdState,
  isShapeSelectedSelectorFamily,
  shapeStateFamily,
} from '../../container/states'

interface Props {
  shapeId: number
}

const Arc: React.FC<Props> = ({ shapeId }) => {
  const shape = useRecoilValue(shapeStateFamily(shapeId)) as ArcShape
  const indicatingShapeId = useRecoilValue(indicatingShapeIdState)

  const isFocused = indicatingShapeId === shape.id
  const isSelected = useRecoilValue(isShapeSelectedSelectorFamily(shapeId))

  let strokeColor
  if (isSelected) strokeColor = '#FF0000'
  else if (isFocused) strokeColor = '#ff9797'
  else strokeColor = '#000000'

  useEffect(() => {
    if (!isArcShape(shape)) {
      throw new Error(`Shape(ID = ${shapeId} is not a arc`)
    }
  }, [shapeId, shape])

  const arcStartEdgeCoord = {
    x: shape.center.x + shape.radius * Math.cos((shape.startAngle / 180) * Math.PI),
    y: shape.center.y - shape.radius * Math.sin((shape.startAngle / 180) * Math.PI), // xy座標系とSVG空間の座標系ではy軸の正負が逆転する
  }
  const arcEndEdgeCoord = {
    x: shape.center.x + shape.radius * Math.cos((shape.endAngle / 180) * Math.PI),
    y: shape.center.y - shape.radius * Math.sin((shape.endAngle / 180) * Math.PI), // xy座標系とSVG空間の座標系ではy軸の正負が逆転する
  }

  const counterClockWiseAngle =
    shape.endAngle > shape.startAngle
      ? shape.endAngle - shape.startAngle
      : 360 - (shape.startAngle - shape.endAngle)
  const shouldUseLargeArc = counterClockWiseAngle > 180

  const pathNodeAttribute = [
    `M ${shape.center.x} ${shape.center.y}`,
    `L ${arcStartEdgeCoord.x} ${arcStartEdgeCoord.y}`,

    `A ${shape.radius} ${shape.radius} 0 ` +
      `${shouldUseLargeArc ? 1 : 0} ` + // 1なら円弧の長いほう、0なら短いほう
      `0 ${arcEndEdgeCoord.x} ${arcEndEdgeCoord.y}`,

    `L ${shape.center.x} ${shape.center.y}`,
  ]

  return (
    <path
      key={'temporaryArc'}
      d={pathNodeAttribute.join(' ')}
      fill='none'
      stroke={strokeColor}
      strokeWidth='1'
    />
  )
}

export default Arc
