import React from 'react'
import {Circle, Layer, Line, Path, Rect, Stage} from "react-konva";
import Konva from "konva";
import { css } from '@emotion/react'

const style = css`
  display: none;
`

interface Props {
  onMouseDown?: (event: Konva.KonvaEventObject<MouseEvent>) => void
  onMouseMove?: (event: Konva.KonvaEventObject<MouseEvent>) => void
  onMouseup?: (event: Konva.KonvaEventObject<MouseEvent>) => void
  circles: {x: number, y: number, radius: number}[],
  temporaryCircle: {
    x: number,
    y: number,
    radius: number,
    diameterStart: {x: number, y: number},
    diameterEnd: {x: number, y: number}
  } | null
}

const Canvas: React.FC<Props> = ({onMouseDown, onMouseMove, onMouseup, circles, temporaryCircle}) => {

  console.debug(circles)

  return (
    <>
      <div css={style}>
        hoge
      </div>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={onMouseDown}
        onMousemove={onMouseMove}
        onMouseup={onMouseup}
      >
        <Layer>
          {temporaryCircle &&
            <>
              <Circle key={'temporaryCircleCenter'}
                      x={temporaryCircle.x}
                      y={temporaryCircle.y}
                      radius={3}
                      fill="blue"
              />
              <Line key={'temporaryCircleDiameter'}
                    points={[
                      temporaryCircle.diameterStart.x,
                      temporaryCircle.diameterStart.y,
                      temporaryCircle.diameterEnd.x,
                      temporaryCircle.diameterEnd.y
                    ]}
                    stroke={"grey"}
                    strokeWidth={1}
              />
              <Circle key={'temporaryCircle'}
                      x={temporaryCircle.x}
                      y={temporaryCircle.y}
                      radius={temporaryCircle.radius}
                      stroke={'grey'}
                      strokeWidth={1}
              />
            </>
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
    </>
  )

}

export default Canvas
