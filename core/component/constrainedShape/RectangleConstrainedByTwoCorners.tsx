import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { isRectangleConstrainedByTwoCorners } from '../../lib/typeguard'
import { getStrokeColor } from '../../lib/function'
import {
  isShapeSelectedSelectorFamily,
  shapeSelectorFamily,
} from '../../container/state/shapeState'
import { isIndicatedFamily } from '../../container/state/cursorState'

interface Props {
  shapeId: number
}

/**
 * 四隅のうち同じ対角線上に位置する2点を位置を指定して形成される長方形
 * @param shapeId 図形のID
 * @constructor
 */
const RectangleConstrainedByTwoCorners: React.FC<Props> = ({ shapeId }) => {
  const shape = useRecoilValue(shapeSelectorFamily(shapeId)) as Rectangle
  const isFocused = useRecoilValue(isIndicatedFamily(shapeId))
  const isSelected = useRecoilValue(isShapeSelectedSelectorFamily(shapeId))

  useEffect(() => {
    if (!isRectangleConstrainedByTwoCorners(shape)) {
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

export default RectangleConstrainedByTwoCorners
