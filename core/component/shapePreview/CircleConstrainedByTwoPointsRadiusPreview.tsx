import React from 'react'
import {
  isCircleSeed1ConstrainedByTwoPointsRadius,
  isCircleSeed2ConstrainedByTwoPointsRadius,
} from '../../lib/typeguard'

interface Props {
  shape: CircleSeed1ConstrainedByTwoPointsRadius | CircleSeed2ConstrainedByTwoPointsRadius
}

const CircleConstrainedByTwoPointsRadiusPreview: React.FC<Props> = ({ shape }) => {
  if (isCircleSeed1ConstrainedByTwoPointsRadius(shape)) {
    return <CircleSeed1Preview shape={shape} />
  }

  if (isCircleSeed2ConstrainedByTwoPointsRadius(shape)) {
    return <CircleSeed2Preview shape={shape} />
  }

  return null
}

const CircleSeed1Preview: React.FC<{ shape: CircleSeed1ConstrainedByTwoPointsRadius }> = ({
  shape,
}) => {
  const { point1, point2 } = shape

  return (
    <>
      <line
        key={'lineConnectingTwoPoints'}
        x1={point1.x}
        y1={point1.y}
        x2={point2.x}
        y2={point2.y}
        stroke={'grey'}
        strokeDasharray={'3 3'}
        strokeWidth={1}
      />
      <circle key={'point1'} cx={point1.x} cy={point1.y} r={2} fill={'blue'} />
      <circle key={'point2'} cx={point2.x} cy={point2.y} r={2} fill='blue' />
    </>
  )
}

const CircleSeed2Preview: React.FC<{ shape: CircleSeed2ConstrainedByTwoPointsRadius }> = ({
  shape,
}) => {
  const { point1, point2, center, radius } = shape

  return (
    <>
      <line
        key={'radius1'}
        x1={center.x}
        y1={center.y}
        x2={point1.x}
        y2={point1.y}
        stroke={'grey'}
        strokeDasharray={'3 3'}
        strokeWidth={1}
      />
      <line
        key={'radius2'}
        x1={center.x}
        y1={center.y}
        x2={point2.x}
        y2={point2.y}
        stroke={'grey'}
        strokeDasharray={'3 3'}
        strokeWidth={1}
      />
      <circle
        key={'circle'}
        r={radius}
        cx={center.x}
        cy={center.y}
        stroke={'grey'}
        strokeDasharray={'3 3'}
        strokeWidth={1}
        fill={'none'}
      />
      <circle key={'point1'} cx={point1.x} cy={point1.y} r={2} fill={'blue'} />
      <circle key={'point2'} cx={point2.x} cy={point2.y} r={2} fill={'blue'} />
      <circle key={'center'} cx={center.x} cy={center.y} r={2} fill={'blue'} />
    </>
  )
}

export default CircleConstrainedByTwoPointsRadiusPreview
