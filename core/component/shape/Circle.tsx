import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { isCircle } from '../../lib/typeguard'
import { getStrokeColor } from '../../lib/function'
import {
  isShapeSelectedSelectorFamily,
  shapeSelectorFamily,
} from '../../container/state/shapeState'
import { isIndicatedFamily } from '../../container/state/cursorState'

interface Props {
  shapeId: number
}

const Circle: React.FC<Props> = React.memo(function Circle({ shapeId }) {
  const shape = useRecoilValue(shapeSelectorFamily(shapeId)) as Circle
  const isFocused = useRecoilValue(isIndicatedFamily(shapeId))
  const isSelected = useRecoilValue(isShapeSelectedSelectorFamily(shapeId))

  useEffect(() => {
    console.debug(shape)
    if (!isCircle(shape)) {
      throw new Error(`Shape(ID = ${shapeId} is not a circle`)
    }
  }, [shapeId, shape])

  const { center, radius } = shape.computed

  return (
    <circle
      cx={center.x}
      cy={center.y}
      r={radius}
      strokeWidth={1}
      fill={'none'}
      stroke={getStrokeColor(isSelected, isFocused, shape.type)}
      strokeDasharray={shape.type === 'supplemental' ? '3 3' : ''}
    />
  )
})

export default Circle
