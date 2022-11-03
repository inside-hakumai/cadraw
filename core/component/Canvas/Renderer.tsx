import React from 'react'
import {
  isArcSeed1ConstrainedByCenterTwoPoints,
  isArcSeed1ConstrainedByThreePoints,
  isArcSeed2ConstrainedByCenterTwoPoints,
  isArcSeed2ConstrainedByThreePoints,
  isCircleSeed1ConstrainedByTwoPointsRadius,
  isCircleSeed2ConstrainedByTwoPointsRadius,
  isCircleSeedConstrainedByCenterDiameter,
  isCircleSeedConstrainedByTwoPoints,
  isLineSeedConstrainedByStartEnd,
  isRectangleSeedConstrainedByCenterCorner,
  isRectangleSeedConstrainedByTwoCorners,
} from '../../lib/typeguard'
import RectangleConstrainedByTwoCornersPreview from '../shapePreview/RectangleConstrainedByTwoCornersPreview'
import RectangleConstrainedByCenterCornerPreview from '../shapePreview/RectangleConstrainedByCenterCornerPreview'
import CircleConstrainedByCenterDiameterPreview from '../shapePreview/CircleConstrainedByCenterDiameterPreview'
import CircleConstrainedByTwoPointsPreview from '../shapePreview/CircleConstrainedByTwoPointsPreview'
import CircleConstrainedByTwoPointsRadiusPreview from '../shapePreview/CircleConstrainedByTwoPointsRadiusPreview'
import ArcConstrainedByCenterTwoPointsPreview from '../shapePreview/ArcConstrainedByCenterTwoPointsPreview'
import ArcConstrainedByThreePointsPreview from '../shapePreview/ArcConstrainedByThreePointsPreview'
import LinePreview from '../shapePreview/LinePreview'
import { css } from '@emotion/react'
import { useRecoilValue } from 'recoil'
import {
  filteredShapeIdsSelector,
  indicatingShapeIdState,
  shapeSeedState,
} from '../../container/states'
import Circle from '../shape/Circle'
import Rectangle from '../shape/Rectangle'
import Line from '../shape/Line'
import Arc from '../shape/Arc'

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

interface Props {
  svgRef: React.RefObject<SVGSVGElement>
  centerRef: React.RefObject<SVGCircleElement>
  startCircleRef: React.RefObject<SVGCircleElement>
}

/**
 * 作成した図形をレンダリングするSVGです。
 */
const Renderer: React.FC<Props> = React.memo(function Renderer({
  svgRef,
  centerRef,
  startCircleRef,
}) {
  const shapeSeed = useRecoilValue(shapeSeedState)
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

  return (
    <svg
      id={'renderer'}
      ref={svgRef}
      viewBox={`0, 0, ${window.innerWidth}, ${window.innerHeight}`}
      xmlns='http://www.w3.org/2000/svg'
      css={rendererStyle(indicatingShapeId !== null)}>
      {shapeSeed && (
        <>
          {/* 作成中（確定前）の図形（長方形） */}
          {isRectangleSeedConstrainedByTwoCorners(shapeSeed) && (
            <RectangleConstrainedByTwoCornersPreview shape={shapeSeed} />
          )}
          {isRectangleSeedConstrainedByCenterCorner(shapeSeed) && (
            <RectangleConstrainedByCenterCornerPreview shape={shapeSeed} />
          )}

          {/* 作成中（確定前）の図形（円） */}
          {isCircleSeedConstrainedByCenterDiameter(shapeSeed) && (
            <CircleConstrainedByCenterDiameterPreview shape={shapeSeed} centerRef={centerRef} />
          )}
          {isCircleSeedConstrainedByTwoPoints(shapeSeed) && (
            <CircleConstrainedByTwoPointsPreview shape={shapeSeed} />
          )}
          {(isCircleSeed1ConstrainedByTwoPointsRadius(shapeSeed) ||
            isCircleSeed2ConstrainedByTwoPointsRadius(shapeSeed)) && (
            <CircleConstrainedByTwoPointsRadiusPreview shape={shapeSeed} />
          )}

          {/* 作成中（確定前）の図形（円弧） */}
          {(isArcSeed1ConstrainedByCenterTwoPoints(shapeSeed) ||
            isArcSeed2ConstrainedByCenterTwoPoints(shapeSeed)) && (
            <ArcConstrainedByCenterTwoPointsPreview shape={shapeSeed} centerRef={centerRef} />
          )}
          {(isArcSeed1ConstrainedByThreePoints(shapeSeed) ||
            isArcSeed2ConstrainedByThreePoints(shapeSeed)) && (
            <ArcConstrainedByThreePointsPreview shape={shapeSeed} centerRef={centerRef} />
          )}

          {/* 作成中（確定前）の図形（線） */}
          {isLineSeedConstrainedByStartEnd(shapeSeed) && (
            <LinePreview shape={shapeSeed} startCircleRef={startCircleRef} />
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
  )
})

export default Renderer
