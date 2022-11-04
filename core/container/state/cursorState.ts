/**
 * マウスカーソルが指している座標や図形を管理するAtom・Selector
 */

import { atom, selector, selectorFamily } from 'recoil'
import { operationModeState } from './userOperationState'
import { shapesState } from './shapeState'
import {
  isArcConstrainedByCenterTwoPoints,
  isCircle,
  isLine,
  isRectangle,
} from '../../lib/typeguard'
import {
  calcDistanceFromCircumference,
  findNearestPointOnArc,
  findNearestPointOnLineSegment,
  findNearestPointOnRectangle,
} from '../../lib/function'

/** カーソルが指しているDOM上の座標を管理するAtom */
export const cursorClientPositionState = atom<Coordinate | null>({
  key: 'cursorClientPosition',
  default: null,
})

/** カーソルが指しているSVG上の座標を管理するAtom */
export const pointingCoordState = atom<Coordinate | null>({
  key: 'pointingCoord',
  default: null,
})

/** カーソルが指している座標をもとに操作の対象となる図形のIDを返すSelector */
export const indicatingShapeIdState = selector<number | null>({
  key: 'indicatingShape',
  get: ({ get }) => {
    // 選択モードでない場合は操作対象を取らない
    if (get(operationModeState) !== 'select') {
      return null
    }

    const pointingCoord = get(pointingCoordState)
    if (pointingCoord === null) {
      return null
    }

    const shapes = get(shapesState)

    let nearestIndex = -1
    let minimumDistance = Number.MAX_VALUE
    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i]
      if (isCircle(shape)) {
        const distance = calcDistanceFromCircumference(pointingCoord, shape.computed)
        if (distance < minimumDistance) {
          minimumDistance = distance
          nearestIndex = i
        }
      } else if (isRectangle(shape)) {
        const { distance } = findNearestPointOnRectangle(pointingCoord, shape.computed)
        if (distance < minimumDistance) {
          minimumDistance = distance
          nearestIndex = i
        }
      } else if (isLine(shape)) {
        const nearest = findNearestPointOnLineSegment(pointingCoord, shape.constraints)
        if (nearest.distance < minimumDistance) {
          minimumDistance = nearest.distance
          nearestIndex = i
        }
      } else if (isArcConstrainedByCenterTwoPoints(shape)) {
        const nearest = findNearestPointOnArc(pointingCoord, shape)
        if (nearest !== null && nearest.distance < minimumDistance) {
          minimumDistance = nearest.distance
          nearestIndex = i
        }
      } else {
        throw new Error(`unknown shape type: ${shape.shape}`)
      }
    }

    if (nearestIndex !== -1 && minimumDistance < 10) {
      return shapes[nearestIndex].id
    } else {
      return null
    }
  },
})

/** 図形のIDを指定し、その図形にカーソルが当てられているかどうかを返すSelectorFamily */
export const isIndicatedFamily = selectorFamily<boolean, number>({
  key: 'singleShape',
  get:
    (shapeId: number) =>
    ({ get }) =>
      shapeId === get(indicatingShapeIdState),
})
