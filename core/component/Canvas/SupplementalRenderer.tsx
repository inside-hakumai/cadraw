import Line from '../shape/Line'
import Rectangle from '../shape/Rectangle'
import Circle from '../shape/Circle'
import Arc from '../shape/Arc'
import SnapCircle from '../SnapCircle'
import React from 'react'
import { css } from '@emotion/react'
import { useRecoilValue } from 'recoil'
import {
  filteredShapeIdsSelector,
  guidingLinesState,
  snappingCoordState,
} from '../../container/states'
import GuidingLine from '../GuidingLine'

const svgStyle = css`
  position: absolute;
  top: 0;
  left: 0;
`

interface Props {
  dotRef: React.RefObject<SVGCircleElement>
}

/**
 * エクスポート時に生成物に載せない図形をレンダリングするSVG要素です。
 */
const SupplementalRenderer: React.FC<Props> = React.memo(function SupplementalRenderer({ dotRef }) {
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
  const snappingCoord = useRecoilValue(snappingCoordState)
  const guidingLines = useRecoilValue(guidingLinesState)

  // デバッグ用
  // const debugCoord = debugCoordState ? useRecoilValue(debugCoordState) : undefined

  return (
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
        <SnapCircle key={'snappingCircleDot'} coordinate={snappingCoord} refObject={dotRef} />
      )}

      {/* デバッグ用の点 */}
      {/*{process.env.NODE_ENV === 'development' &&*/}
      {/*  debugCoord &&*/}
      {/*  debugCoord.map((coord, index) => (*/}
      {/*    <circle key={`debugCircle-${index}`} cx={coord.x} cy={coord.y} r={3} fill={'red'} />*/}
      {/*  ))}*/}

      {/* エクスポート時には含まれない補助線 */}
      {guidingLines &&
        guidingLines.map((line, index) => (
          <GuidingLine
            key={`supplementalLine-${index}`}
            start={line.startPoint}
            end={line.endPoint}
          />
        ))}
    </svg>
  )
})

export default SupplementalRenderer
