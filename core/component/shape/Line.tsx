import React from 'react'

interface Props {
  shape: LineShape
}

const Line: React.FC<Props> = ({ shape }) => {
  const { start, end } = shape

  return <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={'black'} strokeWidth={1} />
}

export default Line
