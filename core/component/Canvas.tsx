import React from 'react'
import { css } from '@emotion/react'
import {
  isTemporaryArcRadius,
  isTemporaryCircleShape,
  isTemporaryLineShape,
  isTemporarySupplementalLineShape,
} from '../lib/typeguard'
import { useRecoilValue } from 'recoil'
import {
  filteredShapeIdsSelector,
  snappingCoordState,
  supplementalLinesState,
  temporaryShapeState,
  tooltipContentState,
  indicatingShapeIdState,
  cursorClientPositionState,
} from '../container/states'
import Grid from './Grid'
import SupplementalLine from './shape/SupplementalLine'
import TemporaryCircle from './shape/TemporaryCircle'
import TemporaryLine from './shape/TemporaryLine'
import Circle from './shape/Circle'
import Line from './shape/Line'
import SnapCircle from './shape/SnapCircle'
import TemporaryArc from './shape/TemporaryArc'
import Arc from './shape/Arc'

const style = css`
  width: 100%;
  height: 100%;
`

const svgStyle = css`
  position: absolute;
  top: 0;
  left: 0;
`

const rendererStyle = (isShapeFocused: boolean) =>
  css(
    svgStyle,
    css`
      cursor: ${isShapeFocused ? 'pointer' : 'default'};
    `
  )

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
  const indicatingShapeId = useRecoilValue(indicatingShapeIdState)
  const circleShapeIds = useRecoilValue(filteredShapeIdsSelector('circle'))
  const lineShapeIds = useRecoilValue(filteredShapeIdsSelector('line'))
  const arcShapeIds = useRecoilValue(filteredShapeIdsSelector('arc'))
  const supplementalLineShapeIds = useRecoilValue(filteredShapeIdsSelector('supplementalLine'))
  const temporaryShape = useRecoilValue(temporaryShapeState)
  const supplementalLines = useRecoilValue(supplementalLinesState)
  const snappingCoord = useRecoilValue(snappingCoordState)
  const tooltipContent = useRecoilValue(tooltipContentState)
  const cursorClientPosition = useRecoilValue(cursorClientPositionState)

  // デバッグ用
  // const debugCoord = debugCoordState ? useRecoilValue(debugCoordState) : undefined

  const temporaryCircleCenterRef = React.useRef<SVGCircleElement>(null)
  const temporaryLineStartRef = React.useRef<SVGCircleElement>(null)
  const snappingDotRef = React.useRef<SVGCircleElement>(null)

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

      {/* エクスポート時に生成物に載せない図形をレンダリングするSVG */}
      <svg
        id={'supplementalRenderer'}
        viewBox={`0, 0, ${window.innerWidth}, ${window.innerHeight}`}
        xmlns='http://www.w3.org/2000/svg'
        css={svgStyle}>
        {/* 補助線 */}
        {supplementalLineShapeIds.map(shapeId => (
          <Line key={`supplementalLine-${shapeId}`} shapeId={shapeId} isSupplementalLine={true} />
        ))}

        {/* 近くの座標にスナップする際にスナップ先を示す点 */}
        {snappingCoord && (
          <SnapCircle
            key={'snappingCircleDot'}
            coordinate={snappingCoord}
            refObject={snappingDotRef}
          />
        )}

        {/* デバッグ用の点 */}
        {/*{process.env.NODE_ENV === 'development' &&*/}
        {/*  debugCoord &&*/}
        {/*  debugCoord.map((coord, index) => (*/}
        {/*    <circle key={`debugCircle-${index}`} cx={coord.x} cy={coord.y} r={3} fill={'red'} />*/}
        {/*  ))}*/}
      </svg>

      <svg
        id={'renderer'}
        ref={stageRef}
        viewBox={`0, 0, ${window.innerWidth}, ${window.innerHeight}`}
        xmlns='http://www.w3.org/2000/svg'
        css={rendererStyle(indicatingShapeId !== null)}>
        {/* エクスポート時には含まれない補助線 */}
        {supplementalLines &&
          supplementalLines.map((line, index) => (
            <SupplementalLine key={`supplementalLine-${index}`} start={line.start} end={line.end} />
          ))}

        {/* 作成中（確定前）の図形（円） */}
        {isTemporaryCircleShape(temporaryShape) && (
          <TemporaryCircle shape={temporaryShape} centerRef={temporaryCircleCenterRef} />
        )}

        {/* 作成中（確定前）の図形（円弧） */}
        {isTemporaryArcRadius(temporaryShape) && (
          <TemporaryArc shape={temporaryShape} centerRef={temporaryCircleCenterRef} />
        )}

        {/* 作成中（確定前）の図形（線） */}
        {isTemporaryLineShape(temporaryShape) && (
          <TemporaryLine shape={temporaryShape} startCircleRef={temporaryLineStartRef} />
        )}
        {isTemporarySupplementalLineShape(temporaryShape) && (
          <TemporaryLine
            shape={temporaryShape}
            startCircleRef={temporaryLineStartRef}
            isSupplementalLine={true}
          />
        )}

        {/* 作成した図形 */}
        {circleShapeIds.map(shapeId => (
          <Circle key={`circle-${shapeId}`} shapeId={shapeId} />
        ))}
        {lineShapeIds.map(shapeId => (
          <Line key={`line-${shapeId}`} shapeId={shapeId} />
        ))}
        {arcShapeIds.map(shapeId => (
          <Arc key={`arc-${shapeId}`} shapeId={shapeId} />
        ))}
      </svg>

      {/* 図形作成中に長さなどを表示するためのツールチップ */}
      {tooltipContent && cursorClientPosition && (
        <div
          css={tooltipStyle}
          style={{
            left: cursorClientPosition.x,
            top: cursorClientPosition.y - 30,
            cursor: 'default',
          }}>
          {tooltipContent}
        </div>
      )}

      {/* スナップ発生時、その座標の情報を表示 */}
      {snappingCoord && currentCoordInfoPosition && (
        <div
          css={currentCoordInfoStyle}
          style={{
            left: currentCoordInfoPosition.x,
            top: currentCoordInfoPosition.y,
            cursor: 'default',
          }}>
          {snappingCoord.snapInfoList
            .map(info => {
              if (info.type === 'gridIntersection') {
                return 'グリッドの交点'
              } else if (info.type === 'circleCenter') {
                return '円の中心'
              } else if (info.type === 'circumference') {
                return '円周上'
              } else if (info.type === 'arcCenter') {
                return '円弧の中心'
              } else if (info.type === 'arcEdge') {
                return '円弧の端'
              } else if (info.type === 'lineEdge') {
                return '線の端'
              } else if (info.type === 'onLine') {
                return '線上'
              } else if (info.type === 'onArc') {
                return '円弧上'
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
