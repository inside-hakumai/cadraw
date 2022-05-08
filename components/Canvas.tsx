import React from 'react'
import { css } from '@emotion/react'
import {isCircleShape, isLineShape, isTemporaryCircleShape, isTemporaryLineShape} from "../lib/typeguard";

const style = css`
  width: 100%;
  height: 100%;
`

interface Props {
  stageRef: React.RefObject<SVGSVGElement>
  onMouseDown?: (event: React.MouseEvent) => void
  onMouseMove?: (event: React.MouseEvent) => void
  onMouseup?: (event: React.MouseEvent) => void
  shapes: Shape[],
  temporaryShape: TemporaryShape | null
}

const Canvas: React.FC<Props> = ({stageRef, onMouseDown, onMouseMove, onMouseup, shapes, temporaryShape}) => {

  console.debug(shapes)

  return (
    <div css={style}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseup}
    >
      <svg
        ref={stageRef}
        viewBox={`0, 0, ${window.innerWidth}, ${window.innerHeight}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {isTemporaryCircleShape(temporaryShape) &&
          <>
            <line key={'temporaryCircleDiameter'}
                  x1={temporaryShape.diameterStart.x}
                  y1={temporaryShape.diameterStart.y}
                  x2={temporaryShape.diameterEnd.x}
                  y2={temporaryShape.diameterEnd.y}
                  stroke={"grey"}
                  strokeDasharray={'3 3'}
                  strokeWidth={1}
            />
            <circle key={'temporaryCircle'}
                    cx={temporaryShape.center.x}
                    cy={temporaryShape.center.y}
                    r={temporaryShape.radius}
                    stroke={'grey'}
                    strokeWidth={1}
                    fill={'none'}
            />
            <circle key={'temporaryCircleCenter'}
                    cx={temporaryShape.center.x}
                    cy={temporaryShape.center.y}
                    r={2}
                    fill="blue"
            />
          </>
        }
        {isTemporaryLineShape(temporaryShape) &&
            <>
              <line key={'temporaryLine'}
                    x1={temporaryShape.start.x}
                    y1={temporaryShape.start.y}
                    x2={temporaryShape.end.x}
                    y2={temporaryShape.end.y}
                    stroke={"grey"}
                    strokeWidth={1}
              />
              <circle key={'temporaryLineStart'}
                      cx={temporaryShape.start.x}
                      cy={temporaryShape.start.y}
                      r={2}
                      fill="blue"
              />
            </>
        }
        {
          shapes.map((shape, index) => {
            if (isCircleShape(shape)) {
              return (
                <circle key={index}
                        cx={shape.center.x}
                        cy={shape.center.y}
                        r={shape.radius}
                        stroke={'black'}
                        strokeWidth={1}
                        fill={'none'}
                />
              )

            } else if (isLineShape(shape)) {
              return (
                <line key={index}
                      x1={shape.start.x}
                      y1={shape.start.y}
                      x2={shape.end.x}
                      y2={shape.end.y}
                      stroke={"black"}
                      strokeWidth={1}
                />
              )
            }
          })
        }
        </svg>
    </div>
  )

}

export default Canvas
