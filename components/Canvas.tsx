import React from 'react'
import { css } from '@emotion/react'
import {isCircleShape, isTemporaryCircleShape} from "../lib/typeguard";

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
                    r={3}
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
            }
          })
        }
        </svg>
    </div>
  )

}

export default Canvas
