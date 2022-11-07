/**
 * 操作中に補助的に表示するあれこれに関するAtom・Selector
 */

import { atom, selector } from 'recoil'
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
import { activeCoordState, mouseDownState, shapeSeedState } from './index'
import { cursorClientPositionState } from './cursorState'
import { calcDistance } from '../../lib/function'

/** 図形作成中に表示されるツールチップの中身テキストを返すSelector */
export const tooltipState = selector<{ content: string; clientPosition: Coordinate } | null>({
  key: 'tooltipContent',
  get: ({ get }) => {
    const shapeSeed = get(shapeSeedState)
    const coord = get(activeCoordState)
    const cursorClientPosition = get(cursorClientPositionState)

    if (shapeSeed !== null && coord !== null && cursorClientPosition !== null) {
      if (isCircleSeedConstrainedByCenterDiameter(shapeSeed)) {
        return {
          content: (shapeSeed.radius * 2).toFixed(2) + 'px',
          clientPosition: {
            x: shapeSeed.center.x,
            y: shapeSeed.center.y - 25,
          },
        }
      }

      if (isCircleSeedConstrainedByTwoPoints(shapeSeed)) {
        return {
          content: shapeSeed.diameter.toFixed(2) + 'px',
          clientPosition: {
            x: shapeSeed.center.x,
            y: shapeSeed.center.y + (shapeSeed.diameter < 70 ? -25 : 0),
          },
        }
      }

      if (isCircleSeed1ConstrainedByTwoPointsRadius(shapeSeed)) {
        return {
          content: shapeSeed.distanceBetweenPoints.toFixed(2) + 'px',
          clientPosition: {
            x: (shapeSeed.point1.x + shapeSeed.point2.x) / 2,
            y:
              (shapeSeed.point1.y + shapeSeed.point2.y) / 2 +
              (shapeSeed.distanceBetweenPoints < 70 ? -25 : 0),
          },
        }
      }

      if (isCircleSeed2ConstrainedByTwoPointsRadius(shapeSeed)) {
        return {
          content: shapeSeed.radius.toFixed(2) + 'px',
          clientPosition: {
            x: shapeSeed.center.x,
            y: shapeSeed.center.y - 25,
          },
        }
      }

      if (isLineSeedConstrainedByStartEnd(shapeSeed)) {
        const lineSeed = shapeSeed as LineSeedConstrainedByStartEnd

        const distance = Math.sqrt(
          Math.pow(lineSeed.startPoint.x - coord.x, 2) +
            Math.pow(lineSeed.startPoint.y - coord.y, 2)
        )

        return {
          content: `${distance.toFixed(2)}px`,
          clientPosition: {
            x: (lineSeed.startPoint.x + coord.x) / 2,
            y: (lineSeed.startPoint.y + coord.y) / 2 + (distance < 70 ? -25 : 0),
          },
        }
      }

      if (isRectangleSeedConstrainedByTwoCorners(shapeSeed)) {
        const { corner1Point, corner2Point } = shapeSeed
        const distance = calcDistance(corner1Point, corner2Point)

        return {
          content: distance.toFixed(2) + 'px',
          clientPosition: {
            x: (corner1Point.x + corner2Point.x) / 2,
            y: (corner1Point.y + corner2Point.y) / 2 + (distance < 70 ? -25 : 0),
          },
        }
      }

      if (isRectangleSeedConstrainedByCenterCorner(shapeSeed)) {
        const { center, cornerPoint } = shapeSeed
        const distance = calcDistance(center, cornerPoint)

        return {
          content: distance.toFixed(2) + 'px',
          clientPosition: {
            x: (center.x + cornerPoint.x) / 2,
            y: (center.y + cornerPoint.y) / 2 + (distance < 70 ? -25 : 0),
          },
        }
      }

      if (isArcSeed2ConstrainedByCenterTwoPoints(shapeSeed)) {
        const { startPointAngle, endPointAngle } = shapeSeed

        let counterClockWiseAngle
        if (startPointAngle === endPointAngle) {
          counterClockWiseAngle = 0
        } else if (startPointAngle < endPointAngle) {
          counterClockWiseAngle = endPointAngle - startPointAngle
        } else {
          counterClockWiseAngle = 360 - (shapeSeed.startPointAngle - shapeSeed.endPointAngle)
        }

        return {
          content: counterClockWiseAngle.toFixed(2) + '°',
          // TODO: カーソル位置ではなく、円の中心付近に中心角を指していることが分かるように表示したい
          clientPosition: cursorClientPosition,
        }
      }

      if (isArcSeed1ConstrainedByCenterTwoPoints(shapeSeed)) {
        return {
          content: shapeSeed.radius.toFixed(2) + 'px',
          clientPosition: {
            x: (shapeSeed.center.x + shapeSeed.startPoint.x) / 2,
            y:
              (shapeSeed.center.y + shapeSeed.startPoint.y) / 2 + (shapeSeed.radius < 70 ? -25 : 0),
          },
        }
      }

      if (isArcSeed2ConstrainedByThreePoints(shapeSeed)) {
        const { endPoint, center, radius } = shapeSeed

        return {
          content: radius.toFixed(2) + 'px',
          clientPosition: {
            x: (center.x + endPoint.x) / 2,
            y: (center.y + endPoint.y) / 2 + (radius < 70 ? -25 : 0),
          },
        }
      }

      if (isArcSeed1ConstrainedByThreePoints(shapeSeed)) {
        const { startPoint, endPoint, distance } = shapeSeed

        return {
          content: distance.toFixed(2) + 'px',
          clientPosition: {
            x: (startPoint.x + endPoint.x) / 2,
            y: (startPoint.y + endPoint.y) / 2 + (distance < 70 ? -25 : 0),
          },
        }
      }
    }

    const { isClicking, activeCoordWhenMouseDown } = get(mouseDownState)
    const activeCoord = get(activeCoordState)

    if (activeCoord !== null && activeCoordWhenMouseDown !== null && isClicking) {
      const distance = calcDistance(activeCoord, activeCoordWhenMouseDown)

      return {
        clientPosition: {
          x: (activeCoord.x + activeCoordWhenMouseDown.x) / 2,
          y: (activeCoord.y + activeCoordWhenMouseDown.y) / 2 + (distance < 70 ? -25 : 0),
        },
        content: `${distance.toFixed(2)}px`,
      }
    }

    return null
  },
})

/** ショートカットカットキーのヒントを表示させるかどうかを管理するAtom */
export const isShowingShortcutKeyHintState = atom<boolean>({
  key: 'isShowingShortcutKeyHint',
  default: false,
})

// デバッグ用に点を描画する時に使う
// export let debugCoordState: RecoilState<Coordinate[]> | undefined = undefined
// export const debugCoordState: RecoilValueReadOnly<Coordinate[]> | undefined = undefined
// if (process.env.NODE_ENV === 'development') {
// debugCoordState = atom<Coordinate[]>({
//   key: 'debugCoord',
//   default: [],
// })
// debugCoordState = selector<Coordinate[]>({
//   key: 'debugCoord',
//   get: ({ get }) => [],
// })
// }
