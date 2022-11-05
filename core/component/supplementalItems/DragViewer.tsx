import React from 'react'
import { useRecoilValue } from 'recoil'
import { color } from '../../lib/constants'
import { activeCoordState, mouseDownState } from '../../container/state'
import { dragShadowShapeState } from '../../container/state/shapeState'
import DragShadowShape from '../shape/DragShadowShape'

const DragViewer: React.FC = React.memo(function DragViewer() {
  const { activeCoordWhenMouseDown } = useRecoilValue(mouseDownState)
  const dragShadowShapes = useRecoilValue(dragShadowShapeState)
  const activeCoord = useRecoilValue(activeCoordState)

  if (activeCoord === null || activeCoordWhenMouseDown === null) {
    return null
  }

  if (
    activeCoordWhenMouseDown.x !== activeCoord.x ||
    activeCoordWhenMouseDown.y !== activeCoord.y
  ) {
    return (
      <>
        <defs>
          <marker
            id='arrowhead'
            markerWidth='10'
            markerHeight='7'
            refX='10'
            refY='3.5'
            orient='auto'>
            <polygon points='0 0, 10 3.5, 0 7' fill={color.supplementalColor} />
          </marker>
        </defs>

        {/* TODO: メモ化しているはずなのにカーソルを動かす度にDragShadowShapeまで全部再レンダリングされてしまう原因を探す */}
        {dragShadowShapes.map(shape => (
          <DragShadowShape key={`shadow-${shape.id}`} shapeId={shape.id} />
        ))}
        <line
          key={'dragTrail'}
          x1={activeCoordWhenMouseDown.x}
          y1={activeCoordWhenMouseDown.y}
          x2={activeCoord.x}
          y2={activeCoord.y}
          stroke={color.supplementalColor}
          markerEnd={'url(#arrowhead)'}
        />
        <circle
          key={'dragOriginDot'}
          cx={activeCoordWhenMouseDown.x}
          cy={activeCoordWhenMouseDown.y}
          r={3}
          fill={color.supplementalColor}
        />
      </>
    )
  } else {
    return null
  }
})

export default DragViewer
