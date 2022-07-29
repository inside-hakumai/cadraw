import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import {
  indicatingShapeIdState,
  isShapeSelectedSelectorFamily,
  shapeSelectorFamily,
} from '../../container/states'
import { isRectangleWithCenterCornerConstraints } from '../../lib/typeguard'
import { getStrokeColor } from '../../lib/function'

interface Props {
  shapeId: number
}

const RectangleCenterCorner: React.FC<Props> = ({ shapeId }) => {
  const shape = useRecoilValue(shapeSelectorFamily(shapeId)) as Rectangle<CenterCornerConstraints>
  const indicatingShapeId = useRecoilValue(indicatingShapeIdState)

  const isSelected = useRecoilValue(isShapeSelectedSelectorFamily(shapeId))
  const isFocused = indicatingShapeId === shape.id

  useEffect(() => {
    if (!isRectangleWithCenterCornerConstraints(shape)) {
      throw new Error(`Shape(ID = ${shapeId}) is not a Rectangle`)
    }
  }, [shapeId, shape])

  const { upperLeftPoint, upperRightPoint, lowerLeftPoint } = shape.computed

  return (
    <>
      <rect
        x={upperLeftPoint.x}
        y={upperLeftPoint.y}
        width={Math.abs(upperRightPoint.x - upperLeftPoint.x)}
        height={Math.abs(lowerLeftPoint.y - upperLeftPoint.y)}
        stroke={getStrokeColor(isSelected, isFocused)}
        strokeDasharray={shape.type === 'supplemental' ? '3 3' : ''}
        fill={'none'}
      />
    </>
  )
}

export default RectangleCenterCorner
