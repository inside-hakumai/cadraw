import React from 'react'

interface Props {
  shape: TemporaryLineShape
  startCircleRef: React.Ref<SVGCircleElement>
  isSupplementalLine?: boolean
}

const TemporaryLine: React.FC<Props> = ({ shape, startCircleRef, isSupplementalLine = false }) => {
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
        strokeDasharray={isSupplementalLine ? '3 3' : ''}
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
