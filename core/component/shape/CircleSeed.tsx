import React from 'react'

interface Props {
  shape: CircleCenterDiameterSeed2
  centerRef: React.Ref<SVGCircleElement>
}

const CircleSeed: React.FC<Props> = ({ shape, centerRef }) => {
  return (
    <>
      <line
        key={'circleSeedDiameter'}
        x1={shape.diameterStart.x}
        y1={shape.diameterStart.y}
        x2={shape.diameterEnd.x}
        y2={shape.diameterEnd.y}
        stroke={'grey'}
        strokeDasharray={'3 3'}
        strokeWidth={1}
      />
      <circle
        key={'circleSeedCircle'}
        cx={shape.center.x}
        cy={shape.center.y}
        r={shape.radius}
        stroke={'grey'}
        strokeWidth={1}
        fill={'none'}
      />
      <circle
        key={'circleSeedCenter'}
        cx={shape.center.x}
        cy={shape.center.y}
        r={2}
        fill='blue'
        ref={centerRef}
      />
    </>
  )
}

export default CircleSeed
