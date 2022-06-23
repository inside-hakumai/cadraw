import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import {
  indicatingShapeIdState,
  isShapeSelectedSelectorFamily,
  shapeSelectorFamily,
} from '../../container/states'
import { isLineShape, isSupplementalLineShape } from '../../lib/typeguard'

interface Props {
  shapeId: number
  isSupplementalLine?: boolean
}

const Line: React.FC<Props> = ({ shapeId, isSupplementalLine = false }) => {
  const shape = useRecoilValue(shapeSelectorFamily(shapeId)) as LineShape
  const indicatingShapeId = useRecoilValue(indicatingShapeIdState)

  const isSelected = useRecoilValue(isShapeSelectedSelectorFamily(shapeId))
  const isFocused = indicatingShapeId === shape.id

  let strokeColor
  if (isSelected) strokeColor = '#FF0000'
  else if (isFocused) strokeColor = '#ff9797'
  else strokeColor = '#000000'

  useEffect(() => {
    if (!isSupplementalLine && !isLineShape(shape)) {
      throw new Error(`Shape(ID = ${shapeId} is not a line`)
    }

    if (isSupplementalLine && !isSupplementalLineShape(shape)) {
      throw new Error(`Shape(ID = ${shapeId} is not a supplemental line`)
    }
  }, [shapeId, shape])

  const { startPoint, endPoint } = shape

  return (
    <line
      x1={startPoint.x}
      y1={startPoint.y}
      x2={endPoint.x}
      y2={endPoint.y}
      strokeWidth={1}
      stroke={strokeColor}
      strokeDasharray={isSupplementalLine ? '3 3' : ''}
    />
  )
}

export default Line
