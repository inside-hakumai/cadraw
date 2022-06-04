import React from 'react'
import { isTemporaryArcRadius, isTemporaryArcShape } from '../../lib/typeguard'

interface Props {
  shape: TemporaryArcRadius | TemporaryArcShape
  centerRef: React.Ref<SVGCircleElement>
}

const TemporaryArc: React.FC<Props> = ({ shape, centerRef }) => {
  const arcStartEdgeCoord = {
    x: shape.center.x + shape.radius * Math.cos((shape.startAngle / 180) * Math.PI),
    y: shape.center.y - shape.radius * Math.sin((shape.startAngle / 180) * Math.PI), // xy座標系とSVG空間の座標系ではy軸の正負が逆転する
  }

  let pathNodeAttribute = [
    `M ${shape.center.x} ${shape.center.y}`,
    `L ${arcStartEdgeCoord.x} ${arcStartEdgeCoord.y}`,
  ]

  let arcEndEdgeCoord = null
  if (isTemporaryArcShape(shape)) {
    arcEndEdgeCoord = {
      x: shape.center.x + shape.radius * Math.cos((shape.endAngle / 180) * Math.PI),
      y: shape.center.y - shape.radius * Math.sin((shape.endAngle / 180) * Math.PI), // xy座標系とSVG空間の座標系ではy軸の正負が逆転する
    }

    const counterClockWiseAngle =
      shape.endAngle > shape.startAngle
        ? shape.endAngle - shape.startAngle
        : 360 - (shape.startAngle - shape.endAngle)

    const useLargeArc = counterClockWiseAngle > 180

    pathNodeAttribute = [
      ...pathNodeAttribute,
      `A ${shape.radius} ${shape.radius} 0 ` +
        `${useLargeArc ? 1 : 0} ` + // 1なら円弧の長いほう、0なら短いほう
        `0 ${arcEndEdgeCoord.x} ${arcEndEdgeCoord.y}`,
      `L ${shape.center.x} ${shape.center.y}`,
    ]
  }

  return (
    <>
      <path
        key={'temporaryArc'}
        d={pathNodeAttribute.join(' ')}
        fill='none'
        stroke={'grey'}
        strokeWidth='1'
      />
      {isTemporaryArcRadius(shape) && (
        <circle
          key={'temporaryArcCircle'}
          cx={shape.center.x}
          cy={shape.center.y}
          r={shape.radius}
          fill={'none'}
          stroke={'grey'}
          strokeDasharray={'3, 3'}
          strokeWidth={1}
        />
      )}
      {arcEndEdgeCoord && (
        <line
          key={'temporaryArcEndEdgeRadius'}
          x1={shape.center.x}
          y1={shape.center.y}
          x2={arcEndEdgeCoord.x}
          y2={arcEndEdgeCoord.y}
          stroke={'grey'}
          strokeDasharray={'3 3'}
          strokeWidth={1}
        />
      )}
      <circle
        key={'temporaryArcCenter'}
        cx={shape.center.x}
        cy={shape.center.y}
        r={2}
        fill='blue'
        ref={centerRef}
      />
    </>
  )
}

export default TemporaryArc
