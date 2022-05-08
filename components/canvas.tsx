import React from 'react'
import { css } from '@emotion/react'

const style = css`
  width: 100%;
  height: 100%;
`

interface Props {
  onMouseDown?: (event: React.MouseEvent) => void
  onMouseMove?: (event: React.MouseEvent) => void
  onMouseup?: (event: React.MouseEvent) => void
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
    <div css={style}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseup}
    >
      <svg
        viewBox={`0, 0, ${window.innerWidth}, ${window.innerHeight}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {temporaryCircle &&
          <>
            <line key={'temporaryCircleDiameter'}
                  x1={temporaryCircle.diameterStart.x}
                  y1={temporaryCircle.diameterStart.y}
                  x2={temporaryCircle.diameterEnd.x}
                  y2={temporaryCircle.diameterEnd.y}
                  stroke={"grey"}
                  strokeWidth={1}
            />
            <circle key={'temporaryCircle'}
                    cx={temporaryCircle.x}
                    cy={temporaryCircle.y}
                    r={temporaryCircle.radius}
                    stroke={'grey'}
                    strokeWidth={1}
                    fill={'transparent'}
            />
            <circle key={'temporaryCircleCenter'}
                    cx={temporaryCircle.x}
                    cy={temporaryCircle.y}
                    r={3}
                    fill="blue"
            />
          </>
        }
        {
          circles.map((circle, index) => (
            <circle key={index}
                    cx={circle.x}
                    cy={circle.y}
                    r={circle.radius}
                    stroke={'black'}
                    strokeWidth={1}
                    fill={'transparent'}
            />
          ))
        }
        </svg>
    </div>
  )

}

export default Canvas
