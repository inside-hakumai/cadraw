import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import {
  indicatingShapeIdState,
  isShapeSelectedSelectorFamily,
  shapeSelectorFamily,
} from '../../container/states'
import { isRectangleTwoCorners } from '../../lib/typeguard'

interface Props {
  shapeId: number
}

const Rectangle: React.FC<Props> = ({ shapeId }) => {
  const shape = useRecoilValue(shapeSelectorFamily(shapeId)) as Rectangle
  const indicatingShapeId = useRecoilValue(indicatingShapeIdState)

  const isSelected = useRecoilValue(isShapeSelectedSelectorFamily(shapeId))
  const isFocused = indicatingShapeId === shape.id

  let strokeColor
  if (isSelected) strokeColor = '#FF0000'
  else if (isFocused) strokeColor = '#ff9797'
  else strokeColor = '#000000'

  useEffect(() => {
    if (!isRectangleTwoCorners(shape)) {
      throw new Error(`Shape(ID = ${shapeId}) is not a Rectangle`)
    }
  }, [shapeId, shape])

  const { corner1Point, corner2Point } = shape.constraints
  const { upperLeftPoint } = shape.computed

  return (
    <>
      <rect
        x={upperLeftPoint.x}
        y={upperLeftPoint.y}
        width={Math.abs(corner2Point.x - corner1Point.x)}
        height={Math.abs(corner2Point.y - corner1Point.y)}
        stroke={strokeColor}
        strokeDasharray={shape.type === 'supplemental' ? '3 3' : ''}
        fill={'none'}
      />
    </>
  )
}

export default Rectangle
