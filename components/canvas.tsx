import React from 'react'
import {Circle, Layer, Path, Rect, Stage} from "react-konva";
import Konva from "konva";

interface Props {
  onMouseDown?: (event: Konva.KonvaEventObject<MouseEvent>) => void
  onMousemove?: (event: Konva.KonvaEventObject<MouseEvent>) => void
  onMouseup?: (event: Konva.KonvaEventObject<MouseEvent>) => void
  circleCenterCoordinates: {x: number, y: number}[]
}

const Canvas: React.FC<Props> = ({onMouseDown, onMousemove, onMouseup, circleCenterCoordinates}) => {

  console.debug(circleCenterCoordinates)

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={onMouseDown}
      onMousemove={onMousemove}
      onMouseup={onMouseup}
    >
      <Layer>
        {
          circleCenterCoordinates.map((coordinate, index) => (
            <Circle key={index}
                    x={coordinate.x} y={coordinate.y}
                    radius={10}
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
