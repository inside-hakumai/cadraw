import React from 'react'
import { isArcCenterTwoPointsSeed3 } from '../../lib/typeguard'

interface Props {
  shape: ArcCenterTwoPointsSeed2 | ArcCenterTwoPointsSeed3
  centerRef: React.Ref<SVGCircleElement>
}

const ArcConstrainedByCenterTwoPointsPreview: React.FC<Props> = ({ shape, centerRef }) => {
  const { center, startPoint, startPointAngle, radius } = shape
  let endPoint = null
  let endAngle = null

  let pathNodeAttribute: string[] | null = null
  if (isArcCenterTwoPointsSeed3(shape)) {
    endPoint = shape.endPoint
    endAngle = shape.endPointAngle

    const counterClockWiseAngle =
      endAngle > startPointAngle ? endAngle - startPointAngle : 360 - (startPointAngle - endAngle)

    const useLargeArc = counterClockWiseAngle > 180

    pathNodeAttribute = [
      `M ${startPoint.x} ${startPoint.y}`,
      `A ${radius} ${radius} 0 ` +
        `${useLargeArc ? 1 : 0} ` + // 1なら円弧の長いほう、0なら短いほう
        `0 ${endPoint.x} ${endPoint.y}`,
    ]
  }

  return (
    <>
      <circle
        key={'arcSeedCircle'}
        cx={center.x}
        cy={center.y}
        r={radius}
        fill={'none'}
        stroke={'grey'}
        strokeDasharray={'3, 3'}
        strokeWidth={1}
      />
      <line
        key={'arcSeedRadiusToStartPoint'}
        x1={center.x}
        y1={center.y}
        x2={startPoint.x}
        y2={startPoint.y}
        stroke={'grey'}
        strokeDasharray={'3 3'}
        strokeWidth={1}
      />
      {endPoint && (
        <line
          key={'arcSeedRadiusToEndPoint'}
          x1={shape.center.x}
          y1={shape.center.y}
          x2={endPoint.x}
          y2={endPoint.y}
          stroke={'grey'}
          strokeDasharray={'3 3'}
          strokeWidth={1}
        />
      )}
      {pathNodeAttribute && (
        <path
          key={'arcSeedArc'}
          d={pathNodeAttribute.join(' ')}
          fill='none'
          stroke={'grey'}
          strokeWidth='2'
        />
      )}
      <circle
        key={'arcSeedCenter'}
        cx={shape.center.x}
        cy={shape.center.y}
        r={2}
        fill='blue'
        ref={centerRef}
      />
    </>
  )
}

export default ArcConstrainedByCenterTwoPointsPreview
