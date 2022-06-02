import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import {
  indicatingShapeIdState,
  isShapeSelectedSelectorFamily,
  shapeStateFamily,
} from '../../container/states'
import { isLineShape } from '../../lib/typeguard'

interface Props {
  shapeId: number
}

const Line: React.FC<Props> = ({ shapeId }) => {
  const shape = useRecoilValue(shapeStateFamily(shapeId)) as LineShape
  const indicatingShapeId = useRecoilValue(indicatingShapeIdState)

  const isSelected = useRecoilValue(isShapeSelectedSelectorFamily(shapeId))
  const isFocused = indicatingShapeId === shape.id

  let strokeColor
  if (isSelected) strokeColor = '#FF0000'
  else if (isFocused) strokeColor = '#ff9797'
  else strokeColor = '#000000'

  useEffect(() => {
    if (!isLineShape(shape)) {
      throw new Error(`Shape(ID = ${shapeId} is not a line`)
    }
  }, [shapeId, shape])

  const { start, end } = shape

  return (
    <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} strokeWidth={1} stroke={strokeColor} />
  )
}

export default Line
