import React from 'react'
import { css } from '@emotion/react'
import {
  isArcSeed1ConstrainedByCenterTwoPoints,
  isArcSeed2ConstrainedByCenterTwoPoints,
  isArcSeed1ConstrainedByThreePoints,
  isArcSeed2ConstrainedByThreePoints,
  isCircleSeedConstrainedByCenterDiameter,
  isLineSeedConstrainedByStartEnd,
  isRectangleSeedConstrainedByCenterCorner,
  isRectangleSeedConstrainedByTwoCorners,
  isCircleSeed1ConstrainedByTwoPointsRadius,
  isCircleSeed2ConstrainedByTwoPointsRadius,
  isCircleSeedConstrainedByTwoPoints,
} from '../lib/typeguard'
import { useRecoilValue } from 'recoil'
import {
  filteredShapeIdsSelector,
  snappingCoordState,
  guidingLinesState,
  shapeSeedState,
  tooltipState,
  indicatingShapeIdState,
} from '../container/states'
import Grid from './Grid'
import CircleConstrainedByCenterDiameterPreview from './shapePreview/CircleConstrainedByCenterDiameterPreview'
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
import CircleConstrainedByTwoPointsRadiusPreview from './shapePreview/CircleConstrainedByTwoPointsRadiusPreview'
import CircleConstrainedByTwoPointsPreview from './shapePreview/CircleConstrainedByTwoPointsPreview'

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
  const tooltip = useRecoilValue(tooltipState)

  // ???????????????
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
      {/* ???????????????????????? */}
      <Grid css={svgStyle} />

      {/* ?????????????????????????????????????????????????????????????????????????????????SVG */}
      <svg
        id={'supplementalRenderer'}
        viewBox={`0, 0, ${window.innerWidth}, ${window.innerHeight}`}
        xmlns='http://www.w3.org/2000/svg'
        css={svgStyle}>
        {/* ????????? */}
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

        {/* ????????????????????????????????????????????????????????????????????? */}
        {snappingCoord && (
          <SnapCircle
            key={'snappingCircleDot'}
            coordinate={snappingCoord}
            refObject={snappingDotRef}
          />
        )}

        {/* ????????????????????? */}
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
        {/* ??????????????????????????????????????????????????? */}
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
            {/* ???????????????????????????????????????????????? */}
            {isRectangleSeedConstrainedByTwoCorners(shapeSeed) && (
              <RectangleConstrainedByTwoCornersPreview shape={shapeSeed} />
            )}
            {isRectangleSeedConstrainedByCenterCorner(shapeSeed) && (
              <RectangleConstrainedByCenterCornerPreview shape={shapeSeed} />
            )}

            {/* ?????????????????????????????????????????? */}
            {isCircleSeedConstrainedByCenterDiameter(shapeSeed) && (
              <CircleConstrainedByCenterDiameterPreview
                shape={shapeSeed}
                centerRef={temporaryCircleCenterRef}
              />
            )}
            {isCircleSeedConstrainedByTwoPoints(shapeSeed) && (
              <CircleConstrainedByTwoPointsPreview shape={shapeSeed} />
            )}
            {(isCircleSeed1ConstrainedByTwoPointsRadius(shapeSeed) ||
              isCircleSeed2ConstrainedByTwoPointsRadius(shapeSeed)) && (
              <CircleConstrainedByTwoPointsRadiusPreview shape={shapeSeed} />
            )}

            {/* ????????????????????????????????????????????? */}
            {(isArcSeed1ConstrainedByCenterTwoPoints(shapeSeed) ||
              isArcSeed2ConstrainedByCenterTwoPoints(shapeSeed)) && (
              <ArcConstrainedByCenterTwoPointsPreview
                shape={shapeSeed}
                centerRef={temporaryCircleCenterRef}
              />
            )}
            {(isArcSeed1ConstrainedByThreePoints(shapeSeed) ||
              isArcSeed2ConstrainedByThreePoints(shapeSeed)) && (
              <ArcConstrainedByThreePointsPreview
                shape={shapeSeed}
                centerRef={temporaryCircleCenterRef}
              />
            )}

            {/* ?????????????????????????????????????????? */}
            {isLineSeedConstrainedByStartEnd(shapeSeed) && (
              <LinePreview shape={shapeSeed} startCircleRef={temporaryLineStartRef} />
            )}
          </>
        )}
        {/* ?????????????????? */}
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

      {/* ???????????????????????????????????????????????????????????????????????? */}
      {tooltip && (
        <div
          css={tooltipStyle}
          style={{
            left: tooltip.clientPosition.x,
            top: tooltip.clientPosition.y - 30,
            cursor: 'default',
          }}>
          {tooltip.content}
        </div>
      )}

      {/* ?????????????????????????????????????????????????????? */}
      {snappingCoord && currentCoordInfoPosition && (
        <div
          css={currentCoordInfoStyle}
          style={{
            left: currentCoordInfoPosition.x,
            top: currentCoordInfoPosition.y,
            cursor: 'default',
          }}>
          {snappingCoord.snapInfoList.map(info => t(`snapInfo.${info.type}`)).join('???')}
        </div>
      )}
    </div>
  )
}

export default Canvas
