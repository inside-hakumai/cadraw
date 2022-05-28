import React from 'react'

interface Props {
  shape: TemporaryLineShape
  startCircleRef: React.Ref<SVGCircleElement>
}

const TemporaryLine: React.FC<Props> = ({ shape, startCircleRef }) => {
  const { start, end } = shape

  return (
    <>
      <line
        key={'temporaryLine'}
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke={'grey'}
        strokeWidth={1}
      />
      <circle
        key={'temporaryLineStart'}
        cx={start.x}
        cy={start.y}
        r={2}
        fill='blue'
        ref={startCircleRef}
      />
    </>
  )
}

export default TemporaryLine
