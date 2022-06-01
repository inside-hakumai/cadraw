import {
  atom,
  atomFamily,
  RecoilValueReadOnly,
  selector,
  selectorFamily,
  Snapshot,
  waitForAll,
} from 'recoil'
import {
  calcDistance,
  calcDistanceFromCircumference,
  findIntersectionOfCircleAndLine,
  findNearestPointOnLine,
  getSnapDestinationCoordDefaultValue,
} from '../lib/function'
import { isCircleShape, isLineShape } from '../lib/typeguard'

export const operationModeState = atom<OperationMode>({
  key: 'operationMode',
  default: 'circle:point-center',
})

export const currentOperatingShapeSelector = selector<ShapeType | null>({
  key: 'currentOperatingShape',
  get: ({ get }) => {
    const operationMode = get(operationModeState)
    if (operationMode.startsWith('line:')) {
      return 'line'
    } else if (operationMode.startsWith('circle:')) {
      return 'circle'
    } else {
      return null
    }
  },
})

/*
 * 作成した図形を管理するAtom、Selector
 */

// IDをキーにして図形を管理するAtomFamily
export const shapeStateFamily = atomFamily<Shape, number>({
  key: 'shape',
})

// 図形のIDの一覧を管理するAtom
export const shapeIdsState = atom<number[]>({
  key: 'shapeIds',
  default: [],
})

// 特定の形状の図形に限定してIDのリストを返すSelectorFamily
export const filteredShapeIdsSelector = selectorFamily<number[], ShapeType>({
  key: 'shapeTypeFilteredShapeIds',
  get:
    (shapeType: ShapeType) =>
    ({ get }) => {
      const allShapes = get(shapesSelector)
      const allShapeIds = get(shapeIdsState)

      return allShapeIds.filter(id => allShapes.find(shape => shape.id === id)?.type === shapeType)
    },
})

// 特定の形状の図形に限定して図形のリストを返すSelectorFamily
export const filteredShapesSelector = selectorFamily<Shape[], ShapeType>({
  key: 'shapeTypeFilteredShapeIds',
  get:
    (shapeType: ShapeType) =>
    ({ get }) => {
      const allShapes = get(shapesSelector)
      return allShapes.filter(shape => shape.type === shapeType)
    },
})

// クリックして選択状態になっている図形のIDを管理するAtom
export const selectedShapeIdsState = atom<number[]>({
  key: 'selectedShapeIds',
  default: [],
})

// 図形が選択されているかどうかを返すSelectorFamily
export const isShapeSelectedSelectorFamily = selectorFamily<boolean, number>({
  key: 'isShapeSelected',
  get:
    (shapeId: number) =>
    ({ get }) => {
      const selectedShapeIds = get(selectedShapeIdsState)
      return selectedShapeIds.includes(shapeId)
    },
})

// すべての図形を返すSelector
export const shapesSelector = selector<Shape[]>({
  key: 'allShapes',
  get: ({ get }) => {
    const shapeIds = get(shapeIdsState)
    return get(waitForAll(shapeIds.map(id => shapeStateFamily(id))))
  },
})

/*
 * 作成中の図形を管理するAtom、Selector
 */

// 作成中の図形の拘束条件を管理するAtom
export const temporaryShapeConstraintsState = atom<TemporaryShapeConstraints | null>({
  key: 'temporaryShapeConstraints',
  default: null,
})

// 作成中の図形のプレビュー表示を返すSelector
export const temporaryShapeState = selector<TemporaryShape | null>({
  key: 'temporaryShape',
  get: ({ get }) => {
    const operationMode = get(operationModeState)
    const temporaryShapeBase = get(temporaryShapeConstraintsState)
    const coord = get(activeCoordState)

    if (temporaryShapeBase === null || coord === null) {
      return null
    }

    if (operationMode === 'circle:fix-radius') {
      const temporaryCircleShapeBase = temporaryShapeBase as TemporaryCircleShapeBase

      const temporaryCircleRadius = Math.sqrt(
        Math.pow(temporaryCircleShapeBase.center.x - coord.x, 2) +
          Math.pow(temporaryCircleShapeBase.center.y - coord.y, 2)
      )
      const temporaryCircleDiameterStart = coord
      const temporaryCircleDiameterEnd = {
        x: coord.x + (temporaryCircleShapeBase.center.x - coord.x) * 2,
        y: coord.y + (temporaryCircleShapeBase.center.y - coord.y) * 2,
      }

      return {
        ...temporaryShapeBase,
        radius: temporaryCircleRadius,
        diameterStart: temporaryCircleDiameterStart,
        diameterEnd: temporaryCircleDiameterEnd,
      } as TemporaryCircleShape
    } else if (operationMode === 'line:point-end') {
      const temporaryLineShapeBase = temporaryShapeBase as TemporaryLineShapeBase

      return {
        ...temporaryLineShapeBase,
        end: coord,
      } as TemporaryLineShape
    } else {
      return null
    }
  },
})

// 図形作成中に表示されるツールチップの中身テキストを返すSelector
export const tooltipContentState = selector<string | null>({
  key: 'tooltipContent',
  get: ({ get }) => {
    const temporaryShape = get(temporaryShapeState)
    const coord = get(activeCoordState)

    if (temporaryShape === null || coord === null) {
      return null
    }

    if (temporaryShape.type === 'temporary-circle') {
      const temporaryCircleShape = temporaryShape as TemporaryCircleShape
      return (temporaryCircleShape.radius * 2).toFixed(2) + 'px'
    } else if (temporaryShape.type === 'temporary-line') {
      const temporaryLineShape = temporaryShape as TemporaryLineShape

      return (
        Math.sqrt(
          Math.pow(temporaryLineShape.start.x - coord.x, 2) +
            Math.pow(temporaryLineShape.start.y - coord.y, 2)
        ).toFixed(2) + 'px'
      )
    } else {
      return null
    }
  },
})

/*
 * マウスカーソルが指している座標や図形を管理するAtom、Selector
 */

// カーソル位置の座標を管理するAtom
export const pointingCoordState = atom<Coordinate | null>({
  key: 'pointingCoord',
  default: null,
})

// カーソル位置をもとに操作の対象となる図形のIDを返すSelector
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

    const shapes = get(shapesSelector)

    let nearestIndex = -1
    let minimumDistance = Number.MAX_VALUE
    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i]
      if (isCircleShape(shape)) {
        const distance = calcDistanceFromCircumference(pointingCoord, shape)
        if (distance < minimumDistance) {
          minimumDistance = distance
          nearestIndex = i
        }
      } else if (isLineShape(shape)) {
        const nearest = findNearestPointOnLine(pointingCoord, shape)
        if (nearest.distance < minimumDistance) {
          minimumDistance = nearest.distance
          nearestIndex = i
        }
      } else {
        throw new Error(`unknown shape type: ${shape.type}`)
      }
    }

    if (nearestIndex !== -1 && minimumDistance < 10) {
      return shapes[nearestIndex].id
    } else {
      return null
    }
  },
})

/*
 * 座標スナップに必要な情報を管理するAtom、Selector
 */

export const snapDestinationCoordState = atom<{
  [xy: string]: SnappingCoordCandidate[] | undefined
}>({
  key: 'snapDestinationCoord',
  default: getSnapDestinationCoordDefaultValue(),
})

export const supplementalLinesState = selector<LineShapeSeed[]>({
  key: 'supplementalLinesSelector',
  get: ({ get }) => {
    const shapes = get(shapesSelector)

    const snappingCoordInfo = get(snappingCoordInfoState)
    if (snappingCoordInfo === null) {
      return []
    }

    return snappingCoordInfo
      .filter(snapInfo => snapInfo.type === 'circleCenter')
      .map(snapInfo => {
        const circleCenterCoordInfo = snapInfo as SnapInfoCircumference
        const circle = shapes.find(
          shape => shape.id === circleCenterCoordInfo.targetShapeId
        ) as CircleShape
        return {
          type: 'line' as 'line',
          start: { x: circle.center.x - circle.radius, y: circle.center.y },
          end: { x: circle.center.x + circle.radius, y: circle.center.y },
        }
      })
  },
})

export const snappingCoordState = selector<SnappingCoordinate | null>({
  key: 'snappingCoord',
  get: ({ get }) => {
    const pointingCoord = get(pointingCoordState)
    if (pointingCoord === null) {
      return null
    }

    const circleShapes = get(filteredShapesSelector('circle')) as CircleShape[]
    // 現在指している座標と円周との距離近い円を探す
    let closeCircles: CircleShape[] = []
    for (const circle of circleShapes) {
      const distance = Math.abs(calcDistance(pointingCoord, circle.center) - circle.radius)
      if (distance < 10) {
        closeCircles = [...closeCircles, circle]
      }
    }

    let snapDestinationCoordOnCircle: [circleId: number, snapCoord: Coordinate][] = []
    // 現在指している座標と最も近い円の距離が1以下の場合はスナップとなる円周上の一点を特定する
    for (let closeCircle of closeCircles) {
      // 直線と円の交点を求めて、現在指している座標に近い方の点をスナップ先とする
      const intersections = findIntersectionOfCircleAndLine(closeCircle, {
        start: closeCircle.center,
        end: pointingCoord,
      })
      switch (intersections.length) {
        case 0:
          break
        case 1:
          snapDestinationCoordOnCircle = [
            ...snapDestinationCoordOnCircle,
            [closeCircle.id, intersections[0]],
          ]
          break
        case 2:
          const distance0 = calcDistance(pointingCoord, intersections[0])
          const distance1 = calcDistance(pointingCoord, intersections[1])
          snapDestinationCoordOnCircle = [
            ...snapDestinationCoordOnCircle,
            [closeCircle.id, distance0 < distance1 ? intersections[0] : intersections[1]],
          ]
          break
        default:
          throw new Error(`Unexpected too many intersections ${intersections}`)
      }
    }

    const snapDestinationCoord = get(snapDestinationCoordState)
    const snappingCoords = snapDestinationCoord[`${pointingCoord.x}-${pointingCoord.y}`]

    const allSnappingCoords: SnappingCoordCandidate[] = [
      ...(snappingCoords || ([] as SnappingCoordCandidate[])),
      ...snapDestinationCoordOnCircle.map(entry => {
        const [circleId, coord] = entry
        return {
          ...coord,
          priority: 1,
          snapInfo: { type: 'circumference', targetShapeId: circleId } as SnapInfoCircumference,
        }
      }),
    ]

    let maximumPriority = 0
    let maximumPrioritySnappingCoord: SnappingCoordinate | null = null
    for (const snappingCoord of allSnappingCoords) {
      const { x, y, priority, snapInfo } = snappingCoord

      if (maximumPrioritySnappingCoord === null) {
        maximumPriority = snappingCoord.priority
        maximumPrioritySnappingCoord = {
          x,
          y,
          snapInfoList: [snappingCoord.snapInfo],
        }
      } else {
        maximumPriority = Math.max(maximumPriority, priority)
        if (x === maximumPrioritySnappingCoord.x && y === maximumPrioritySnappingCoord.y) {
          maximumPrioritySnappingCoord = {
            x,
            y,
            snapInfoList: [...maximumPrioritySnappingCoord.snapInfoList, snapInfo],
          }
        } else {
          maximumPrioritySnappingCoord = {
            x: priority > maximumPriority ? x : maximumPrioritySnappingCoord.x,
            y: priority > maximumPriority ? y : maximumPrioritySnappingCoord.y,
            snapInfoList: [...maximumPrioritySnappingCoord.snapInfoList, snapInfo],
          }
        }
      }
    }

    return maximumPrioritySnappingCoord
  },
})

export const activeCoordState = selector<Coordinate | null>({
  key: 'activeCoord',
  get: ({ get }) => {
    const pointingCoord = get(pointingCoordState)
    if (pointingCoord === null) {
      return null
    }

    const snappingCoord = get(snappingCoordState)
    return snappingCoord || pointingCoord
  },
})

export const snappingCoordInfoState = selector<SnapInfo[]>({
  key: 'snappingCoordInfoSelector',
  get: ({ get }) => {
    const snappingCoord = get(snappingCoordState)
    return snappingCoord?.snapInfoList || []
  },
})

/*
 * Undo用のスナップショット管理用のAtom
 */

// スナップショットのリストを管理するAtom
export const snapshotsState = atom<Snapshot[]>({
  key: 'snapshots',
  default: [],
  dangerouslyAllowMutability: true,
})

// 現在描画されている状態を示しているスナップショットのバージョン
export const currentSnapshotVersionState = atom<number | null>({
  key: 'currentSnapshotVersion',
  default: null,
})

// Undoの可否をboolean値で返すSelector
export const canUndoSelector = selector<boolean>({
  key: 'canUndoSelector',
  get: ({ get }) => {
    const snapshots = get(snapshotsState)

    // 図形が最低1つ存在する状態でのみUndoを実行できる
    // （ = 初期状態と1つ目の図形を追加した状態の2つスナップショットが存在している状態）
    return snapshots.length >= 2
  },
})

// デバッグ用に点を描画する時に使う
// export let debugCoordState: RecoilState<Coordinate[]> | undefined = undefined
export let debugCoordState: RecoilValueReadOnly<Coordinate[]> | undefined = undefined
if (process.env.NODE_ENV === 'development') {
  // debugCoordState = atom<Coordinate[]>({
  //   key: 'debugCoord',
  //   default: [],
  // })
  // debugCoordState = selector<Coordinate[]>({
  //   key: 'debugCoord',
  //   get: ({ get }) => [],
  // })
}
