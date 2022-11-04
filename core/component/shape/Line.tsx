import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { isLine } from '../../lib/typeguard'
import { getStrokeColor } from '../../lib/function'
import {
  isShapeSelectedSelectorFamily,
  shapeSelectorFamily,
} from '../../container/state/shapeState'
import { isIndicatedFamily } from '../../container/state/cursorState'

interface Props {
  shapeId: number
}

const Line: React.FC<Props> = React.memo(function Line({ shapeId }) {
  const shape = useRecoilValue(shapeSelectorFamily(shapeId)) as Line
  const isFocused = useRecoilValue(isIndicatedFamily(shapeId))
  const isSelected = useRecoilValue(isShapeSelectedSelectorFamily(shapeId))

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
