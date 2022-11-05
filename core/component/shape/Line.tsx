import LineBase from './base/LineBase'
import {
  isShapeSelectedSelectorFamily,
  shapeSelectorFamily,
} from '../../container/state/shapeState'
import { isIndicatedFamily } from '../../container/state/cursorState'
import { useRecoilValue } from 'recoil'
import React, { useEffect } from 'react'
import { isLine } from '../../lib/typeguard'

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
    <LineBase
      startPoint={startPoint}
      endPoint={endPoint}
      isFocused={isFocused}
      isSelected={isSelected}
      drawType={shape.type}
    />
  )
})

export default Line
