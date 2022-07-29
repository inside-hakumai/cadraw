import React from 'react'
import { isArcThreePointsSeed3 } from '../../lib/typeguard'

interface Props {
  shape: ArcThreePointsSeed2 | ArcThreePointsSeed3
  centerRef: React.Ref<SVGCircleElement>
}

const ArcConstrainedByThreePointsPreview: React.FC<Props> = ({ shape, centerRef }) => {
  const { startPoint, endPoint } = shape
  let onLinePoint = null
  let center = null

  let pathNodeAttribute: string[] | null = null
  if (isArcThreePointsSeed3(shape)) {
    onLinePoint = shape.onLinePoint
    center = shape.center

    const vectorStartToOnLinePoint = {
      x: onLinePoint.x - startPoint.x,
      y: onLinePoint.y - startPoint.y,
    }
    const vectorStartToCenter = {
      x: center.x - startPoint.x,
      y: center.y - startPoint.y,
    }
    const vectorEndToCenter = {
      x: center.x - endPoint.x,
      y: center.y - endPoint.y,
    }
    const vectorEndToStart = {
      x: startPoint.x - endPoint.x,
      y: startPoint.y - endPoint.y,
    }
    const vectorOnLineToCenter = {
      x: center.x - onLinePoint.x,
      y: center.y - onLinePoint.y,
    }
    const vectorOnLineToEnd = {
      x: endPoint.x - onLinePoint.x,
      y: endPoint.y - onLinePoint.y,
    }

    const crossProducts = [
      // 始点から中心に向かうベクトルと、始点から円弧上の点に向かうベクトルの外積
      vectorStartToCenter.x * vectorStartToOnLinePoint.y -
        vectorStartToCenter.y * vectorStartToOnLinePoint.x,
      // 終点から中心に向かうベクトルと、終点から始点に向かうベクトルの外積
      vectorEndToCenter.x * vectorEndToStart.y - vectorEndToCenter.y * vectorEndToStart.x,
      // 円弧上の点から中心に向かうベクトルと、円弧上の点から終点に向かうベクトルの外積
      vectorOnLineToCenter.x * vectorOnLineToEnd.y - vectorOnLineToCenter.y * vectorOnLineToEnd.x,
    ]

    const isUseShortArc =
      (crossProducts[0] > 0 && crossProducts[1] < 0 && crossProducts[2] > 0) ||
      (crossProducts[0] < 0 && crossProducts[1] > 0 && crossProducts[2] < 0)

    const isDrawClockWise = crossProducts.filter(cp => cp < 0).length >= 2

    pathNodeAttribute = [
      `M ${startPoint.x} ${startPoint.y}`,
      `A ${shape.radius} ${shape.radius} 0 ` +
        `${isUseShortArc ? 0 : 1} ` + // 1なら円弧の長いほう、0なら短いほう
        `${isDrawClockWise ? 1 : 0} ` + // 1なら時計回りに弧を描画、0なら半時計回りに弧を描画
        `${endPoint.x} ${endPoint.y}`,
    ]
  }

  return (
    <>
      <line
        key={'arcSeedStartPointToEndPoint'}
        x1={startPoint.x}
        y1={startPoint.y}
        x2={endPoint.x}
        y2={endPoint.y}
        stroke='grey'
        strokeDasharray={'3 3'}
        strokeWidth={1}
      />
      <circle key={'arcSeedStartPoint'} cx={startPoint.x} cy={startPoint.y} r={2} fill='blue' />
      <circle
        key={'arcSeedEndPoint'}
        cx={endPoint.x}
        cy={endPoint.y}
        r={2}
        fill='blue'
        ref={centerRef}
      />

      {pathNodeAttribute && center && (
        <>
          <path
            key={'arcSeedArc'}
            d={pathNodeAttribute.join(' ')}
            fill='none'
            stroke={'grey'}
            strokeWidth='2'
          />
          <circle
            key={'arcSeedCenter'}
            cx={center.x}
            cy={center.y}
            r={2}
            fill='blue'
            ref={centerRef}
          />
        </>
      )}
    </>
  )
}

export default ArcConstrainedByThreePointsPreview
