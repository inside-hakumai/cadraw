/**
 * 操作中に補助的に表示するあれこれに関するAtom・Selector
 */

import { atom, selector } from 'recoil'
import {
  isArcSeed1ConstrainedByCenterTwoPoints,
  isArcSeed2ConstrainedByCenterTwoPoints,
  isCircleSeed1ConstrainedByTwoPointsRadius,
  isCircleSeed2ConstrainedByTwoPointsRadius,
  isCircleSeedConstrainedByCenterDiameter,
  isCircleSeedConstrainedByTwoPoints,
} from '../../lib/typeguard'
import { activeCoordState, shapeSeedState } from './index'
import { cursorClientPositionState } from './cursorState'

/** 図形作成中に表示されるツールチップの中身テキストを返すSelector */
export const tooltipState = selector<{ content: string; clientPosition: Coordinate } | null>({
  key: 'tooltipContent',
  get: ({ get }) => {
    const shapeSeed = get(shapeSeedState)
    const coord = get(activeCoordState)
    const cursorClientPosition = get(cursorClientPositionState)

    if (shapeSeed === null || coord === null || cursorClientPosition === null) {
      return null
    }

    if (shapeSeed.shape === 'circle' && isCircleSeedConstrainedByCenterDiameter(shapeSeed)) {
      return {
        content: (shapeSeed.radius * 2).toFixed(2) + 'px',
        clientPosition: cursorClientPosition,
      }
    }

    if (shapeSeed.shape === 'circle' && isCircleSeedConstrainedByTwoPoints(shapeSeed)) {
      return {
        content: shapeSeed.diameter.toFixed(2) + 'px',
        clientPosition: shapeSeed.center,
      }
    }

    if (shapeSeed.shape === 'circle' && isCircleSeed1ConstrainedByTwoPointsRadius(shapeSeed)) {
      return {
        content: shapeSeed.distanceBetweenPoints.toFixed(2) + 'px',
        clientPosition: cursorClientPosition,
      }
    }

    if (shapeSeed.shape === 'circle' && isCircleSeed2ConstrainedByTwoPointsRadius(shapeSeed)) {
      return {
        content: shapeSeed.radius.toFixed(2) + 'px',
        clientPosition: shapeSeed.center,
      }
    }

    if (shapeSeed.shape === 'line') {
      const lineSeed = shapeSeed as LineSeedConstrainedByStartEnd

      return {
        content:
          Math.sqrt(
            Math.pow(lineSeed.startPoint.x - coord.x, 2) +
              Math.pow(lineSeed.startPoint.y - coord.y, 2)
          ).toFixed(2) + 'px',
        clientPosition: cursorClientPosition,
      }
    }

    if (shapeSeed.shape === 'arc') {
      if (isArcSeed1ConstrainedByCenterTwoPoints(shapeSeed)) {
        return {
          content: (shapeSeed.radius * 2).toFixed(2) + 'px',
          clientPosition: cursorClientPosition,
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
          clientPosition: cursorClientPosition,
        }
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
