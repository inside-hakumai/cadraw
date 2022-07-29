import React from 'react'
import { css } from '@emotion/react'
import {
  isArcCenterTwoPointsSeed2,
  isArcCenterTwoPointsSeed3,
  isArcThreePointsSeed2,
  isArcThreePointsSeed3,
  isCircleCenterDiameterSeed2,
  isLineStartEndSeed2,
  isRectangleCenterCornerSeed2,
  isRectangleTwoCornersSeed2,
} from '../lib/typeguard'
import { useRecoilValue } from 'recoil'
import {
  filteredShapeIdsSelector,
  snappingCoordState,
  guidingLinesState,
  shapeSeedState,
  tooltipContentState,
  indicatingShapeIdState,
  cursorClientPositionState,
} from '../container/states'
import Grid from './Grid'
import CirclePreview from './shapePreview/CirclePreview'
import LinePreview from './shapePreview/LinePreview'
import Circle from './shape/Circle'
import Line from './shape/Line'
import SnapCircle from './SnapCircle'
import ArcConstrainedByCenterTwoPointsPreview from './shapePreview/ArcConstrainedByCenterTwoPointsPreview'
import Arc from './shape/Arc'
import ArcConstrainedByThreePointsPreview from './shapePreview/ArcConstrainedByThreePointsPreview'
import GuidingLine from './GuidingLine'
import RectangleConstrainedByTwoCornersPreview from './shapePreview/RectangleConstrainedByTwoCornersPreview'
import { useTranslation } from 'react-i18next'
import RectangleConstrainedByCenterCornerPreview from './shapePreview/RectangleConstrainedByCenterCornerPreview'
import Rectangle from './shape/Rectangle'

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
  const { t } = useTranslation()
  const indicatingShapeId = useRecoilValue(indicatingShapeIdState)
  const lineShapeIds = useRecoilValue(
    filteredShapeIdsSelector({ filterDrawType: 'solid', filterShapeType: 'line' })
  )
  const rectangleShapeIds = useRecoilValue(
    filteredShapeIdsSelector({ filterDrawType: 'solid', filterShapeType: 'rectangle' })
  )
  const circleShapeIds = useRecoilValue(
    filteredShapeIdsSelector({ filterDrawType: 'solid', filterShapeType: 'circle' })
  )
  const arcShapeIds = useRecoilValue(
    filteredShapeIdsSelector({ filterDrawType: 'solid', filterShapeType: 'arc' })
  )
  const supplementalLineShapeIds = useRecoilValue(
    filteredShapeIdsSelector({ filterDrawType: 'supplemental', filterShapeType: 'line' })
  )
  const supplementalRectangleShapeIds = useRecoilValue(
    filteredShapeIdsSelector({ filterDrawType: 'supplemental', filterShapeType: 'rectangle' })
  )
  const supplementalCircleShapeIds = useRecoilValue(
    filteredShapeIdsSelector({ filterDrawType: 'supplemental', filterShapeType: 'circle' })
  )
  const supplementalArcShapeIds = useRecoilValue(
    filteredShapeIdsSelector({ filterDrawType: 'supplemental', filterShapeType: 'arc' })
  )
  const shapeSeed = useRecoilValue(shapeSeedState)
  const guidingLines = useRecoilValue(guidingLinesState)
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
          <Line key={`supplementalLine-${shapeId}`} shapeId={shapeId} />
        ))}
        {supplementalRectangleShapeIds.map(shapeId => (
          <Rectangle key={`supplementalRectangle-${shapeId}`} shapeId={shapeId} />
        ))}
        {supplementalCircleShapeIds.map(shapeId => (
          <Circle key={`supplementalCircle-${shapeId}`} shapeId={shapeId} />
        ))}
        {supplementalArcShapeIds.map(shapeId => (
          <Arc key={`supplementalArc-${shapeId}`} shapeId={shapeId} />
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
        {guidingLines &&
          guidingLines.map((line, index) => (
            <GuidingLine
              key={`supplementalLine-${index}`}
              start={line.startPoint}
              end={line.endPoint}
            />
          ))}

        {shapeSeed && (
          <>
            {/* 作成中（確定前）の図形（長方形） */}
            {isRectangleTwoCornersSeed2(shapeSeed) && (
              <RectangleConstrainedByTwoCornersPreview shape={shapeSeed} />
            )}
            {isRectangleCenterCornerSeed2(shapeSeed) && (
              <RectangleConstrainedByCenterCornerPreview shape={shapeSeed} />
            )}

            {/* 作成中（確定前）の図形（円） */}
            {isCircleCenterDiameterSeed2(shapeSeed) && (
              <CirclePreview shape={shapeSeed} centerRef={temporaryCircleCenterRef} />
            )}

            {/* 作成中（確定前）の図形（円弧） */}
            {(isArcCenterTwoPointsSeed2(shapeSeed) || isArcCenterTwoPointsSeed3(shapeSeed)) && (
              <ArcConstrainedByCenterTwoPointsPreview
                shape={shapeSeed}
                centerRef={temporaryCircleCenterRef}
              />
            )}
            {(isArcThreePointsSeed2(shapeSeed) || isArcThreePointsSeed3(shapeSeed)) && (
              <ArcConstrainedByThreePointsPreview
                shape={shapeSeed}
                centerRef={temporaryCircleCenterRef}
              />
            )}

            {/* 作成中（確定前）の図形（線） */}
            {isLineStartEndSeed2(shapeSeed) && (
              <LinePreview shape={shapeSeed} startCircleRef={temporaryLineStartRef} />
            )}
          </>
        )}
        {/* 作成した図形 */}
        {circleShapeIds.map(shapeId => (
          <Circle key={`circle-${shapeId}`} shapeId={shapeId} />
        ))}
        {rectangleShapeIds.map(shapeId => (
          <Rectangle key={`rectangle-${shapeId}`} shapeId={shapeId} />
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
          {snappingCoord.snapInfoList.map(info => t(`snapInfo.${info.type}`)).join('・')}
        </div>
      )}
    </div>
  )
}

export default Canvas
