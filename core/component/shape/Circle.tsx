import React from 'react'

interface Props {
  shape: CircleShape
}

const Circle: React.FC<Props> = ({ shape }) => {
  const { center, radius } = shape

  return (
    <circle cx={center.x} cy={center.y} r={radius} stroke={'black'} strokeWidth={1} fill={'none'} />
  )
}

export default Circle
