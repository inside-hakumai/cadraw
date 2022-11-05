import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { isRectangle } from '../../../lib/typeguard'
import { dragShadowShapeSelectorFamily } from '../../../container/state/shapeState'
import RectangleBase from '../../shape/base/RectangleBase'

interface Props {
  shapeId: number
}

const DragShadowRectangle: React.FC<Props> = ({ shapeId }) => {
  const shape = useRecoilValue(dragShadowShapeSelectorFamily(shapeId)) as Rectangle

  useEffect(() => {
    if (!isRectangle(shape)) {
      throw new Error(`Shape(ID = ${shapeId}) is not a Rectangle`)
    }
  }, [shapeId, shape])

  const { upperLeftPoint, upperRightPoint, lowerLeftPoint } = shape.computed

  return (
    <RectangleBase
      upperLeftPoint={upperLeftPoint}
      upperRightPoint={upperRightPoint}
      lowerLeftPoint={lowerLeftPoint}
      isFocused={false}
      isSelected={false}
      drawType={'dragShadow'}
    />
  )
}

export default DragShadowRectangle
