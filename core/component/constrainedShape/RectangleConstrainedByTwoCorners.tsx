import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { isRectangleConstrainedByTwoCorners } from '../../lib/typeguard'
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

export default RectangleConstrainedByTwoCorners
