import React from 'react'
import { css } from '@emotion/react'

const svgStyle = css`
  position: absolute;
  top: 0;
  left: 0;
`

interface Props {}

const Grid: React.FC<Props> = React.memo(function Grid() {
  // グリッドを描画するためのline要素
  const gridLines: React.ReactElement[] = []
  for (let i = 0; i < window.innerWidth; i += 50) {
    gridLines.push(
      <line
        key={`gridLine-vertical${i}`}
        x1={i}
        y1={0}
        x2={i}
        y2={window.innerHeight}
        stroke='#DDDDDD'
        strokeWidth={1}
      />
    )
  }
  for (let i = 0; i < window.innerHeight; i += 50) {
    gridLines.push(
      <line
        key={`gridLine-horizontal${i}`}
        x1={0}
        y1={i}
        x2={window.innerWidth}
        y2={i}
        stroke='#DDDDDD'
        strokeWidth={1}
      />
    )
  }

  return (
    <svg
      viewBox={`0, 0, ${window.innerWidth}, ${window.innerHeight}`}
      xmlns='http://www.w3.org/2000/svg'
      css={svgStyle}>
      {gridLines}
    </svg>
  )
})

export default Grid
