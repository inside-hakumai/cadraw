import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import {
  indicatingShapeIdState,
  isShapeSelectedSelectorFamily,
  shapeSelectorFamily,
} from '../../container/states'
import { isLine } from '../../lib/typeguard'
import { getStrokeColor } from '../../lib/function'

interface Props {
  shapeId: number
}

const Line: React.FC<Props> = React.memo(function Line({ shapeId }) {
  const shape = useRecoilValue(shapeSelectorFamily(shapeId)) as Line
  const indicatingShapeId = useRecoilValue(indicatingShapeIdState)

  const isSelected = useRecoilValue(isShapeSelectedSelectorFamily(shapeId))
  const isFocused = indicatingShapeId === shape.id

  useEffect(() => {
    if (!isLine(shape)) {
      throw new Error(`Shape(ID = ${shapeId}) is not a line`)
    }
  }, [shapeId, shape])

  const { startPoint, endPoint } = shape.constraints

  return (
    <line
      x1={startPoint.x}
      y1={startPoint.y}
      x2={endPoint.x}
      y2={endPoint.y}
      strokeWidth={1}
      stroke={getStrokeColor(isSelected, isFocused)}
      strokeDasharray={shape.type === 'supplemental' ? '3 3' : ''}
    />
  )
})

export default Line
