import React from 'react'
import {Circle, Layer, Path, Rect, Stage} from "react-konva";
import Konva from "konva";

interface Props {
  onMouseDown?: (event: Konva.KonvaEventObject<MouseEvent>) => void
  onMouseMove?: (event: Konva.KonvaEventObject<MouseEvent>) => void
  onMouseup?: (event: Konva.KonvaEventObject<MouseEvent>) => void
  circles: {x: number, y: number, radius: number}[],
  temporaryCircle: {x: number, y: number, radius: number} | null
}

const Canvas: React.FC<Props> = ({onMouseDown, onMouseMove, onMouseup, circles, temporaryCircle}) => {

  console.debug(circles)

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={onMouseDown}
      onMousemove={onMouseMove}
      onMouseup={onMouseup}
    >
      <Layer>
        {temporaryCircle &&
          <Circle key={'temporaryCircle'}
                  x={temporaryCircle.x}
                  y={temporaryCircle.y}
                  radius={temporaryCircle.radius}
                  stroke={'grey'}
                  strokeWidth={1}
          />
        }
        {
          circles.map((circle, index) => (
            <Circle key={index}
                    x={circle.x} y={circle.y}
                    radius={circle.radius}
                    stroke={'black'}
                    strokeWidth={1}
            />
          ))
        }
        </Layer>
    </Stage>
  )

}

export default Canvas
