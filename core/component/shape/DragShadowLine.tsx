import LineBase from './base/LineBase'
import { dragShadowShapeSelectorFamily } from '../../container/state/shapeState'
import { useRecoilValue } from 'recoil'
import React, { useEffect } from 'react'
import { isLine } from '../../lib/typeguard'

interface Props {
  shapeId: number
}

const DragShadowLine: React.FC<Props> = React.memo(function DragShadowLine({ shapeId }) {
  const shape = useRecoilValue(dragShadowShapeSelectorFamily(shapeId)) as Line

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
      isFocused={false}
      isSelected={false}
      drawType={shape.type}
    />
  )
})

export default DragShadowLine
