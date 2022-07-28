import React from 'react'

interface Props {
  shape: RectangleCenterCornerSeed2
}

const RectangleSeedCenterCorner: React.FC<Props> = ({ shape }) => {
  const { center, cornerPoint, upperLeftPoint } = shape

  return (
    <>
      <line
        key={'rectangleSeedCenterToCorner'}
        x1={center.x}
        y1={center.y}
        x2={cornerPoint.x}
        y2={cornerPoint.y}
        stroke={'grey'}
        strokeDasharray={'3 3'}
        strokeWidth={1}
      />
      <rect
        key={'rectangleSeedRect'}
        x={upperLeftPoint.x}
        y={upperLeftPoint.y}
        width={Math.abs(cornerPoint.x - center.x) * 2}
        height={Math.abs(cornerPoint.y - center.y) * 2}
        stroke={'grey'}
        strokeDasharray={'3 3'}
        strokeWidth={1}
        fill={'none'}
      />
      <circle key={'rectangleSeedCenter'} cx={center.x} cy={center.y} r={2} fill='blue' />
    </>
  )
}

export default RectangleSeedCenterCorner
