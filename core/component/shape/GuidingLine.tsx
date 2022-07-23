import React from 'react'

interface Props {
  start: Coordinate
  end: Coordinate
}

const GuidingLine: React.FC<Props> = ({ start, end }) => {
  return (
    <line
      x1={start.x}
      y1={start.y}
      x2={end.x}
      y2={end.y}
      stroke='grey'
      strokeDasharray={'3 3'}
      strokeWidth={1}
    />
  )
}

export default GuidingLine
