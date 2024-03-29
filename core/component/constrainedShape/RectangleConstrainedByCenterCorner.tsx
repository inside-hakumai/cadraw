import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { isRectangleConstrainedByCenterCorner } from '../../lib/typeguard'
import {
  isShapeSelectedSelectorFamily,
  shapeSelectorFamily,
} from '../../container/state/shapeState'
import { isIndicatedFamily } from '../../container/state/cursorState'
import RectangleBase from '../shape/base/RectangleBase'

interface Props {
  shapeId: number
}

/**
 * 中央の一点と四隅いずれかの角の位置を指定して形成される長方形
 * @param shapeId 図形のID
 * @constructor
 */
const RectangleConstrainedByCenterCorner: React.FC<Props> = ({ shapeId }) => {
  const shape = useRecoilValue(shapeSelectorFamily(shapeId)) as Rectangle<CenterCornerConstraints>
  const isFocused = useRecoilValue(isIndicatedFamily(shapeId))
  const isSelected = useRecoilValue(isShapeSelectedSelectorFamily(shapeId))

  useEffect(() => {
    if (!isRectangleConstrainedByCenterCorner(shape)) {
      throw new Error(`Shape(ID = ${shapeId}) is not a Rectangle`)
    }
  }, [shapeId, shape])

  const { upperLeftPoint, upperRightPoint, lowerLeftPoint } = shape.computed

  return (
    <RectangleBase
      upperLeftPoint={upperLeftPoint}
      upperRightPoint={upperRightPoint}
      lowerLeftPoint={lowerLeftPoint}
      isFocused={isFocused}
      isSelected={isSelected}
      drawType={shape.type}
    />
  )
}

export default RectangleConstrainedByCenterCorner
