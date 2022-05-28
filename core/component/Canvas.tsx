import React from 'react'
import { css } from '@emotion/react'
import {
  isCircleShape,
  isLineShape,
  isTemporaryCircleShape,
  isTemporaryLineShape,
} from '../lib/typeguard'
import { useRecoilValue } from 'recoil'
import {
  activeCoordInfoState,
  shapesState,
  snappingCoordState,
  supplementalLinesState,
  temporaryShapeState,
  tooltipContentState,
} from '../container/states'
import Grid from './Grid'
import SupplementalLine from './shape/SupplementalLine'
import TemporaryCircle from './shape/TemporaryCircle'
import TemporaryLine from './shape/TemporaryLine'
import Circle from './shape/Circle'
import Line from './shape/Line'
import SnapCircle from './shape/SnapCircle'

const style = css`
  width: 100%;
  height: 100%;
`

const svgStyle = css`
  position: absolute;
  top: 0;
  left: 0;
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
  const supplementalLines = useRecoilValue(supplementalLinesState)
  const snappingCoord = useRecoilValue(snappingCoordState)
  const tooltipContent = useRecoilValue(tooltipContentState)
  const activeCoordInfo = useRecoilValue(activeCoordInfoState)

  // デバッグ用
  // const debugCoord = useRecoilValue(debugCoordState)

  const temporaryCircleCenterRef = React.useRef<SVGCircleElement>(null)
  const temporaryLineStartRef = React.useRef<SVGCircleElement>(null)
  const snappingDotRef = React.useRef<SVGCircleElement>(null)

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
      {/* 背景のグリッド線 */}
      <Grid css={svgStyle} />

      <svg
        id={'renderer'}
        ref={stageRef}
        viewBox={`0, 0, ${window.innerWidth}, ${window.innerHeight}`}
        xmlns='http://www.w3.org/2000/svg'
        css={svgStyle}>
        {/* エクスポート時には含まれない補助線 */}
        {supplementalLines &&
          supplementalLines.map((line, index) => (
            <SupplementalLine key={`supplementalLine-${index}`} start={line.start} end={line.end} />
          ))}

        {/* 作成中（確定前）の図形（円） */}
        {isTemporaryCircleShape(temporaryShape) && (
          <TemporaryCircle shape={temporaryShape} centerRef={temporaryCircleCenterRef} />
        )}

        {/* 作成中（確定前）の図形（線） */}
        {isTemporaryLineShape(temporaryShape) && (
          <TemporaryLine shape={temporaryShape} startCircleRef={temporaryLineStartRef} />
        )}

        {/* 作成した図形 */}
        {shapes.map(shape => {
          if (isCircleShape(shape)) {
            return <Circle key={`circle-${shape.id}`} shape={shape} />
          } else if (isLineShape(shape)) {
            return <Line key={`line-${shape.id}`} shape={shape} />
          }
        })}

        {/* 近くの座標にスナップする際にスナップ先の示す点 */}
        {snappingCoord && (
          <SnapCircle
            key={'snappingCircleDot'}
            coordinate={snappingCoord}
            refObject={snappingDotRef}
          />
        )}

        {/*/!* デバッグ用の点 *!/*/}
        {/*{debugCoord && debugCoord.map((coord, index) => (*/}
        {/*  <circle*/}
        {/*    key={`debugCircle-${index}`}*/}
        {/*    cx={coord.x}*/}
        {/*    cy={coord.y}*/}
        {/*    r={3}*/}
        {/*    fill={'red'}*/}
        {/*  />*/}
        {/*))}*/}
      </svg>

      {/* 図形作成中に長さなどを表示するためのツールチップ */}
      {tooltipContent && tooltipPosition && (
        <div css={tooltipStyle} style={{ left: tooltipPosition.x, top: tooltipPosition.y }}>
          {tooltipContent}
        </div>
      )}

      {/* スナップ発生時、その座標の情報を表示 */}
      {activeCoordInfo && currentCoordInfoPosition && (
        <div
          css={currentCoordInfoStyle}
          style={{ left: currentCoordInfoPosition.x, top: currentCoordInfoPosition.y }}>
          {activeCoordInfo
            .map(info => {
              if (info.type === 'gridIntersection') {
                return 'グリッドの交点'
              } else if (info.type === 'circleCenter') {
                return '円の中心'
              } else if (info.type === 'circumference') {
                return '円周上'
              } else if (info.type === 'lineEdge') {
                return '線の端'
              } else {
                throw new Error(`Unknown infoType: ${info.type}`)
              }
            })
            .join('・')}
        </div>
      )}
    </div>
  )
}

export default Canvas
