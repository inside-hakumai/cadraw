import React from 'react'
import { css } from '@emotion/react'
import {
  isCircleShape,
  isLineShape,
  isTemporaryCircleShape,
  isTemporaryLineShape,
} from '../lib/typeguard'
import { useRecoilState, useRecoilValue } from 'recoil'
import {
  activeCoordInfoState,
  shapesState,
  snappingCoordState,
  supplementalLinesSelector,
  temporaryShapeState,
  tooltipContentState,
} from '../states'

const style = css`
  width: 100%;
  height: 100%;
`

const svgStyle = css`
  position: absolute;
`

const tooltipStyle = css`
  position: absolute;
  font-size: 10px;
  transform: translate(-40%);
`

const currentCoordInfoStyle = css`
  position: absolute;
  font-size: 10px;
  transform: translate(-40%);
  color: #008000;
`

interface Props {
  stageRef: React.RefObject<SVGSVGElement>
  onMouseDown?: (event: React.MouseEvent) => void
  onMouseMove?: (event: React.MouseEvent) => void
  onMouseup?: (event: React.MouseEvent) => void
}

const Canvas: React.FC<Props> = ({ stageRef, onMouseDown, onMouseMove, onMouseup }) => {
  const shapes = useRecoilValue(shapesState)
  const temporaryShape = useRecoilValue(temporaryShapeState)
  const supplementalLines = useRecoilValue(supplementalLinesSelector)
  const snappingCoord = useRecoilValue(snappingCoordState)
  const tooltipContent = useRecoilValue(tooltipContentState)
  const activeCoordInfo = useRecoilValue(activeCoordInfoState)

  const temporaryCircleCenterRef = React.useRef<SVGCircleElement>(null)
  const temporaryLineStartRef = React.useRef<SVGCircleElement>(null)
  const snappingDotRef = React.useRef<SVGCircleElement>(null)

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

  let tooltipPosition: { x: number; y: number } | null = null
  if (temporaryCircleCenterRef.current) {
    tooltipPosition = {
      x: temporaryCircleCenterRef.current.getBoundingClientRect().x,
      y: temporaryCircleCenterRef.current.getBoundingClientRect().y - 15,
    }
  } else if (temporaryLineStartRef.current) {
    tooltipPosition = {
      x: temporaryLineStartRef.current.getBoundingClientRect().x,
      y: temporaryLineStartRef.current.getBoundingClientRect().y - 15,
    }
  }

  let currentCoordInfoPosition: { x: number; y: number } | null = null
  if (snappingDotRef.current) {
    currentCoordInfoPosition = {
      x: snappingDotRef.current.getBoundingClientRect().x,
      y: snappingDotRef.current.getBoundingClientRect().y - 15,
    }
  }

  return (
    <div css={style} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseup}>
      <svg
        viewBox={`0, 0, ${window.innerWidth}, ${window.innerHeight}`}
        xmlns='http://www.w3.org/2000/svg'
        css={svgStyle}>
        {gridLines}
      </svg>

      <svg
        id={'renderer'}
        ref={stageRef}
        viewBox={`0, 0, ${window.innerWidth}, ${window.innerHeight}`}
        xmlns='http://www.w3.org/2000/svg'
        css={svgStyle}>
        {supplementalLines &&
          supplementalLines.map((line, index) => (
            <line
              key={`guideLine-${index}`}
              x1={line.start.x}
              y1={line.start.y}
              x2={line.end.x}
              y2={line.end.y}
              stroke='grey'
              strokeDasharray={'3 3'}
              strokeWidth={1}
            />
          ))}

        {isTemporaryCircleShape(temporaryShape) && (
          <>
            <line
              key={'temporaryCircleDiameter'}
              x1={temporaryShape.diameterStart.x}
              y1={temporaryShape.diameterStart.y}
              x2={temporaryShape.diameterEnd.x}
              y2={temporaryShape.diameterEnd.y}
              stroke={'grey'}
              strokeDasharray={'3 3'}
              strokeWidth={1}
            />
            <circle
              key={'temporaryCircle'}
              cx={temporaryShape.center.x}
              cy={temporaryShape.center.y}
              r={temporaryShape.radius}
              stroke={'grey'}
              strokeWidth={1}
              fill={'none'}
            />
            <circle
              key={'temporaryCircleCenter'}
              cx={temporaryShape.center.x}
              cy={temporaryShape.center.y}
              r={2}
              fill='blue'
              ref={temporaryCircleCenterRef}
            />
          </>
        )}
        {isTemporaryLineShape(temporaryShape) && (
          <>
            <line
              key={'temporaryLine'}
              x1={temporaryShape.start.x}
              y1={temporaryShape.start.y}
              x2={temporaryShape.end.x}
              y2={temporaryShape.end.y}
              stroke={'grey'}
              strokeWidth={1}
            />
            <circle
              key={'temporaryLineStart'}
              cx={temporaryShape.start.x}
              cy={temporaryShape.start.y}
              r={2}
              fill='blue'
              ref={temporaryLineStartRef}
            />
          </>
        )}
        {shapes.map((shape, index) => {
          if (isCircleShape(shape)) {
            return (
              <circle
                key={`circle-${shape.id}`}
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
              <line
                key={`line-${shape.id}`}
                x1={shape.start.x}
                y1={shape.start.y}
                x2={shape.end.x}
                y2={shape.end.y}
                stroke={'black'}
                strokeWidth={1}
              />
            )
          }
        })}
        {snappingCoord && (
          <circle
            key={'snappingDot'}
            cx={snappingCoord.x}
            cy={snappingCoord.y}
            r={3}
            fill='#008000'
            ref={snappingDotRef}
          />
        )}
      </svg>
      {tooltipContent && tooltipPosition && (
        <div css={tooltipStyle} style={{ left: tooltipPosition.x, top: tooltipPosition.y }}>
          {tooltipContent}
        </div>
      )}
      {activeCoordInfo && currentCoordInfoPosition && (
        <div
          css={currentCoordInfoStyle}
          style={{ left: currentCoordInfoPosition.x, top: currentCoordInfoPosition.y }}>
          {activeCoordInfo
            .map(infoType => {
              if (infoType === 'gridIntersection') {
                return 'グリッドの交点'
              } else if (infoType === 'circleCenter') {
                return '円の中心'
              } else if (infoType === 'circumference') {
                return '円周上'
              } else if (infoType === 'lineEdge') {
                return '線の端'
              } else {
                throw new Error(`Unknown infoType: ${infoType}`)
              }
            })
            .join('・')}
        </div>
      )}
    </div>
  )
}

export default Canvas
