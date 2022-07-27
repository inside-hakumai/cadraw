import React from 'react'

interface Props {
  shape: RectangleTwoCornersSeed2
}

const RectangleSeed: React.FC<Props> = ({ shape }) => {
  const { corner1Point, corner2Point, upperLeftPoint } = shape

  return (
    <>
      <line
        key={'rectangleSeedDiagonal'}
        x1={corner1Point.x}
        y1={corner1Point.y}
        x2={corner2Point.x}
        y2={corner2Point.y}
        stroke={'grey'}
        strokeDasharray={'3 3'}
        strokeWidth={1}
      />
      <rect
        key={'rectangleSeedRect'}
        x={upperLeftPoint.x}
        y={upperLeftPoint.y}
        width={Math.abs(corner2Point.x - corner1Point.x)}
        height={Math.abs(corner2Point.y - corner1Point.y)}
        stroke={'grey'}
        strokeDasharray={'3 3'}
        strokeWidth={1}
        fill={'none'}
      />
    </>
  )
}

export default RectangleSeed
