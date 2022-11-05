import React from 'react'
import { getStrokeColor } from '../../../lib/function'

interface Props {
  center: Coordinate
  radius: number
  startPoint: Coordinate
  endPoint: Coordinate
  onLinePoint: Coordinate
  isFocused: boolean
  isSelected: boolean
  drawType: DrawType
}

/**
 * 弧の両端の位置および弧上の1点を指定して形成する弧
 * @param shapeId 図形のID
 * @constructor
 */
const ArcConstrainedByThreePointsBase: React.FC<Props> = ({
  center,
  radius,
  startPoint,
  endPoint,
  onLinePoint,
  isFocused,
  isSelected,
  drawType,
}) => {
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

  const pathNodeAttribute = [
    `M ${startPoint.x} ${startPoint.y}`,
    `A ${radius} ${radius} 0 ` +
      `${isUseShortArc ? 0 : 1} ` + // 1なら円弧の長いほう、0なら短いほう
      `${isDrawClockWise ? 1 : 0} ` + // 1なら時計回りに弧を描画、0なら半時計回りに弧を描画
      `${endPoint.x} ${endPoint.y}`,
  ]

  return (
    <path
      d={pathNodeAttribute.join(' ')}
      fill='none'
      stroke={getStrokeColor(isSelected, isFocused, drawType)}
      strokeWidth='1'
      strokeDasharray={drawType === 'supplemental' ? '3 3' : ''}
    />
  )
}

export default ArcConstrainedByThreePointsBase
