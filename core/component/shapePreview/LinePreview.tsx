import React from 'react'

interface Props {
  shape: LineStartEndSeed2
  startCircleRef: React.Ref<SVGCircleElement>
  isSupplementalLine?: boolean
}

const LinePreview: React.FC<Props> = ({ shape, startCircleRef, isSupplementalLine = false }) => {
  const { startPoint, endPoint } = shape

  return (
    <>
      <line
        key={'temporaryLine'}
        x1={startPoint.x}
        y1={startPoint.y}
        x2={endPoint.x}
        y2={endPoint.y}
        stroke={'grey'}
        strokeWidth={1}
        strokeDasharray={isSupplementalLine ? '3 3' : ''}
      />
      <circle
        key={'temporaryLineStart'}
        cx={startPoint.x}
        cy={startPoint.y}
        r={2}
        fill='blue'
        ref={startCircleRef}
      />
    </>
  )
}

export default LinePreview
