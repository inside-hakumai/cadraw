import React from 'react'

interface Props {
  shape: CircleSeedConstrainedByTwoPoints
}

const CircleConstrainedByTwoPointsPreview: React.FC<Props> = ({ shape }) => {
  const { point1, point2, diameter, center } = shape

  return (
    <>
      <circle
        key={'circle'}
        cx={center.x}
        cy={center.y}
        r={diameter / 2}
        fill={'none'}
        stroke={'grey'}
        strokeDasharray={'3 3'}
        strokeWidth={1}
      />
      <line
        key={'diameter'}
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

export default CircleConstrainedByTwoPointsPreview
