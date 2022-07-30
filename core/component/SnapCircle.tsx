import React from 'react'

interface Props {
  coordinate: Coordinate
  refObject: React.Ref<SVGCircleElement>
}

const SnapCircle: React.FC<Props> = ({ coordinate, refObject }) => {
  return (
    <circle
      key={'snappingDot'}
      cx={coordinate.x}
      cy={coordinate.y}
      r={3}
      fill='#008000'
      ref={refObject}
    />
  )
}

export default SnapCircle
