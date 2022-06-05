import { atom, atomFamily, selector, selectorFamily, Snapshot, waitForAll } from 'recoil'
import {
  assert,
  calcCentralAngleFromHorizontalLine,
  calcCircumferenceCoordFromDegree,
  calcDistance,
  calcDistanceFromCircumference,
  findIntersectionOfCircleAndLine,
  findNearestPointOnLine,
  findNearestPointOnSector,
  getSnapDestinationCoordDefaultValue,
} from '../lib/function'
import {
  isArcShape,
  isCircleShape,
  isLineShape,
  isSupplementalLineShape,
  isTemporaryArcRadius,
  isTemporaryArcShape,
} from '../lib/typeguard'

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
    } else if (operationMode.startsWith('arc:')) {
      return 'arc'
    } else if (operationMode.startsWith('supplementalLine:')) {
      return 'supplementalLine'
    } else {
      return null
    }
  },
})

/*
 * 作成した図形を管理するAtom、Selector
 */

// IDをキーにして図形を管理するAtomFamily
export const shapeStateFamily = atomFamily<Shape | undefined, number>({
  key: 'shape',
  default: undefined,
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
    return get(waitForAll(shapeIds.map(id => shapeStateFamily(id)))) as Shape[]
  },
})

// 図形の拘束点を返すSelector
export const shapeConstraintPointsSelector = selector<ShapeConstraintPoint[]>({
  key: 'shapeConstraintPoints',
  get: ({ get }) => {
    const shapes = get(shapesSelector)
    return shapes
      .map(shape => {
        if (shape.type === 'line') {
          const lineShape = shape as LineShape
          return [
            {
              coord: lineShape.start,
              targetShapeId: shape.id,
              constraintType: 'lineEdge' as const,
            } as ShapeConstraintPoint,
            {
              coord: lineShape.end,
              targetShapeId: shape.id,
              constraintType: 'lineEdge' as const,
            } as ShapeConstraintPoint,
          ]
        }

        if (shape.type === 'circle') {
          const circleShape = shape as CircleShape
          return [
            {
              coord: circleShape.center,
              targetShapeId: shape.id,
              constraintType: 'circleCenter' as const,
            } as ShapeConstraintPoint,
          ]
        }

        if (shape.type === 'arc') {
          const { id, center, radius, startAngle, endAngle } = shape as ArcShape

          return [
            {
              coord: center,
              targetShapeId: id,
              constraintType: 'arcCenter' as const,
            } as ShapeConstraintPoint,
            {
              coord: calcCircumferenceCoordFromDegree(center, radius, startAngle),
              targetShapeId: id,
              constraintType: 'arcEdge' as const,
            } as ShapeConstraintPoint,
            {
              coord: calcCircumferenceCoordFromDegree(center, radius, endAngle),
              targetShapeId: shape.id,
              constraintType: 'arcEdge' as const,
            } as ShapeConstraintPoint,
          ]
        }

        if (shape.type === 'supplementalLine') {
          const lineShape = shape as SupplementalLineShape
          return [
            {
              coord: lineShape.start,
              targetShapeId: shape.id,
              constraintType: 'lineEdge' as const,
            } as ShapeConstraintPoint,
            {
              coord: lineShape.end,
              targetShapeId: shape.id,
              constraintType: 'lineEdge' as const,
            } as ShapeConstraintPoint,
          ]
        }

        return [] as ShapeConstraintPoint[]
      })
      .flat()
  },
})

/*
 * 作成中の図形を管理するAtom、Selector
 */

// 作成中の図形の拘束条件を管理するAtom
export const temporaryShapeConstraintsState = atom<TemporaryShape | null>({
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
    }

    if (operationMode === 'arc:fix-radius') {
      const temporaryArcCenter = temporaryShapeBase as TemporaryArcCenter

      const temporaryRadius = Math.sqrt(
        Math.pow(temporaryArcCenter.center.x - coord.x, 2) +
          Math.pow(temporaryArcCenter.center.y - coord.y, 2)
      )

      const temporaryStartAngle = calcCentralAngleFromHorizontalLine(
        coord,
        temporaryArcCenter.center
      )

      return {
        ...temporaryShapeBase,
        radius: temporaryRadius,
        startAngle: temporaryStartAngle === null ? undefined : temporaryStartAngle,
      } as TemporaryArcRadius
    }

    if (operationMode === 'arc:fix-angle') {
      const temporaryArcRadius = temporaryShapeBase as TemporaryArcRadius

      const temporaryEndAngle = calcCentralAngleFromHorizontalLine(coord, temporaryArcRadius.center)

      return {
        ...temporaryShapeBase,
        endAngle: temporaryEndAngle === null ? undefined : temporaryEndAngle,
      } as TemporaryArcShape
    }

    if (operationMode === 'line:point-end') {
      const temporaryLineShapeBase = temporaryShapeBase as TemporaryLineShapeBase

      return {
        ...temporaryLineShapeBase,
        end: coord,
      } as TemporaryLineShape
    }

    if (operationMode === 'supplementalLine:point-end') {
      const temporaryLineShapeBase = temporaryShapeBase as TemporarySupplementalLineShapeBase

      return {
        ...temporaryLineShapeBase,
        end: coord,
      } as TemporarySupplementalLineShape
    }

    return null
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

    if (temporaryShape.type === 'tmp-circle') {
      const temporaryCircleShape = temporaryShape as TemporaryCircleShape
      return (temporaryCircleShape.radius * 2).toFixed(2) + 'px'
    }

    if (temporaryShape.type === 'tmp-line') {
      const temporaryLineShape = temporaryShape as TemporaryLineShape

      return (
        Math.sqrt(
          Math.pow(temporaryLineShape.start.x - coord.x, 2) +
            Math.pow(temporaryLineShape.start.y - coord.y, 2)
        ).toFixed(2) + 'px'
      )
    }

    if (temporaryShape.type === 'tmp-arc') {
      if (isTemporaryArcShape(temporaryShape)) {
        const { startAngle, endAngle } = temporaryShape

        let counterClockWiseAngle
        if (startAngle === endAngle) {
          counterClockWiseAngle = 0
        } else if (startAngle < endAngle) {
          counterClockWiseAngle = endAngle - startAngle
        } else {
          counterClockWiseAngle = 360 - (temporaryShape.startAngle - temporaryShape.endAngle)
        }
        return counterClockWiseAngle.toFixed(2) + '°'
      }

      if (isTemporaryArcRadius(temporaryShape)) {
        return (temporaryShape.radius * 2).toFixed(2) + 'px'
      }
    }

    return null
  },
})

/*
 * マウスカーソルが指している座標や図形を管理するAtom、Selector
 */

// カーソルが指しているDOM上の座標を管理するAtom
export const cursorClientPositionState = atom<Coordinate | null>({
  key: 'cursorClientPosition',
  default: null,
})

// カーソル位置のSVG上の座標を管理するAtom
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
      } else if (isArcShape(shape)) {
        const startCoord = calcCircumferenceCoordFromDegree(
          shape.center,
          shape.radius,
          shape.startAngle
        )

        const counterClockWiseAngle =
          shape.endAngle > shape.startAngle
            ? shape.endAngle - shape.startAngle
            : 360 - (shape.startAngle - shape.endAngle)

        console.debug(counterClockWiseAngle)
        const nearest = findNearestPointOnSector(pointingCoord, {
          center: shape.center,
          arcStartCoord: startCoord,
          angle: counterClockWiseAngle,
        })
        if (nearest !== null && nearest.distance < minimumDistance) {
          minimumDistance = nearest.distance
          nearestIndex = i
        }
      } else if (isSupplementalLineShape(shape)) {
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

// グリッドの交点へのスナップを機能させるために、カーソル座標とスナップ先グリッド交点の組を管理するAtom
export const snapToGridIntersectionState = atom<{
  [xy: string]: SnappingCoordCandidate[] | undefined
}>({
  key: 'snapDestinationCoord',
  default: getSnapDestinationCoordDefaultValue(),
})

// 図形の拘束点へのスナップを機能させるために、カーソル座標とスナップ先図形拘束点の組を返すSelector
export const snapToShapeConstraintPointSelector = selector<{
  [xy: string]: SnappingCoordCandidate[] | undefined
}>({
  key: 'snapToShapeConstraintPoint',
  get: ({ get }) => {
    const snapSrcToDestMapping: { [xy: string]: SnappingCoordCandidate[] } = {}

    const constraintPoints = get(shapeConstraintPointsSelector)

    for (const constraint of constraintPoints) {
      for (
        let x = Math.floor(constraint.coord.x) - 4;
        x <= Math.ceil(constraint.coord.x) + 4;
        x++
      ) {
        for (
          let y = Math.floor(constraint.coord.y) - 4;
          y <= Math.ceil(constraint.coord.y) + 4;
          y++
        ) {
          const key = `${x}-${y}`

          const snapInfo: ShapeRelatedSnapInfo = {
            type: constraint.constraintType,
            targetShapeId: constraint.targetShapeId,
          }
          snapSrcToDestMapping[key] = [
            ...(snapSrcToDestMapping[key] || []),
            { ...constraint.coord, snapInfo, priority: 4 },
          ]
        }
      }
    }

    return snapSrcToDestMapping
  },
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
          type: 'line' as const,
          start: { x: circle.center.x - circle.radius, y: circle.center.y },
          end: { x: circle.center.x + circle.radius, y: circle.center.y },
        }
      })
  },
})

// カーソル位置をもとにスナップ先を返すSelector
export const snappingCoordState = selector<SnappingCoordinate | null>({
  key: 'snappingCoord',
  get: ({ get }) => {
    const pointingCoord = get(pointingCoordState)
    if (pointingCoord === null) {
      return null
    }

    const shapes = get(shapesSelector)

    // 現在指している座標と図形の最近傍点との距離が近い図形を探す
    let closeShapes: Shape[] = []
    for (const shape of shapes) {
      if (shape.type === 'circle') {
        const circle = shape as CircleShape

        const distance = Math.abs(calcDistance(pointingCoord, circle.center) - circle.radius)
        if (distance < 10) {
          closeShapes = [...closeShapes, circle]
        }
      }

      if (shape.type === 'line') {
        const line = shape as LineShape

        const { distance, isLineTerminal } = findNearestPointOnLine(pointingCoord, line)
        // 最近傍点が線分の終点の場合は除外する（拘束点は別途スナップ判定するため）
        if (distance < 10 && !isLineTerminal) {
          closeShapes = [...closeShapes, line]
        }
      }

      if (shape.type === 'arc') {
        const arc = shape as ArcShape

        const { center, radius, startAngle, endAngle } = arc

        const startCoord = calcCircumferenceCoordFromDegree(center, radius, startAngle)

        const counterClockWiseAngle =
          arc.endAngle > arc.startAngle
            ? arc.endAngle - arc.startAngle
            : 360 - (arc.startAngle - arc.endAngle)

        const nearest = findNearestPointOnSector(pointingCoord, {
          center: arc.center,
          arcStartCoord: startCoord,
          angle: counterClockWiseAngle,
        })

        // 最近傍点が線分の終点の場合は除外する（拘束点は別途スナップ判定するため）
        if (nearest !== null && nearest.distance < 10) {
          closeShapes = [...closeShapes, arc]
        }
      }

      if (shape.type === 'supplementalLine') {
        const line = shape as SupplementalLineShape

        const { distance, isLineTerminal } = findNearestPointOnLine(pointingCoord, line)
        // 最近傍点が線分の終点の場合は除外する（拘束点は別途スナップ判定するため）
        if (distance < 10 && !isLineTerminal) {
          closeShapes = [...closeShapes, line]
        }
      }
    }

    let snapDestinationCoordOnShape: [
      shapeId: number,
      snapCoord: Coordinate,
      snapType: SnapType
    ][] = []
    // カーソル座標と図形の最近傍点間の距離が1以下の場合は、スナップ先となる図形上の一点を特定する
    for (const shape of closeShapes) {
      if (shape.type === 'circle') {
        const circle = shape as CircleShape

        // 円の中心点とカーソル座標を含む直線と円の交点を求める
        const intersections = findIntersectionOfCircleAndLine(circle, {
          start: circle.center,
          end: pointingCoord,
        })

        // 交点が必ず2つあることを確認し、円周に近いほうをスナップ先とする
        assert(intersections.length === 2, "Assertion 'intersections.length === 2' failed")
        const distance0 = calcDistance(pointingCoord, intersections[0])
        const distance1 = calcDistance(pointingCoord, intersections[1])
        snapDestinationCoordOnShape = [
          ...snapDestinationCoordOnShape,
          [circle.id, distance0 < distance1 ? intersections[0] : intersections[1], 'circumference'],
        ]
      }

      if (shape.type === 'arc') {
        const arc = shape as ArcShape

        const { center, radius, startAngle, endAngle } = arc

        const startCoord = calcCircumferenceCoordFromDegree(center, radius, startAngle)

        const counterClockWiseAngle =
          arc.endAngle > arc.startAngle
            ? arc.endAngle - arc.startAngle
            : 360 - (arc.startAngle - arc.endAngle)

        const nearest = findNearestPointOnSector(pointingCoord, {
          center: arc.center,
          arcStartCoord: startCoord,
          angle: counterClockWiseAngle,
        })

        snapDestinationCoordOnShape = [
          ...snapDestinationCoordOnShape,
          [arc.id, nearest!.nearestCoord, 'onArc'],
        ]
      }

      if (shape.type === 'line') {
        const line = shape as LineShape
        const { nearestCoord } = findNearestPointOnLine(pointingCoord, line)
        snapDestinationCoordOnShape = [
          ...snapDestinationCoordOnShape,
          [line.id, nearestCoord, 'onLine'],
        ]
      }

      if (shape.type === 'supplementalLine') {
        const line = shape as SupplementalLineShape
        const { nearestCoord } = findNearestPointOnLine(pointingCoord, line)
        snapDestinationCoordOnShape = [
          ...snapDestinationCoordOnShape,
          [line.id, nearestCoord, 'onLine'],
        ]
      }
    }

    const snapToGridIntersectionMap = get(snapToGridIntersectionState)
    const snappingGridIntersection =
      snapToGridIntersectionMap[`${pointingCoord.x}-${pointingCoord.y}`] ||
      ([] as SnappingCoordCandidate[])

    const snapToConstraintPointMap = get(snapToShapeConstraintPointSelector)
    const snappingConstraintPoint =
      snapToConstraintPointMap[`${pointingCoord.x}-${pointingCoord.y}`] ||
      ([] as SnappingCoordCandidate[])

    const allSnappingCoords: SnappingCoordCandidate[] = [
      ...snappingGridIntersection,
      ...snappingConstraintPoint,
      ...snapDestinationCoordOnShape
        .filter(entry => {
          // 図形上の拘束点にスナップが可能な場合、同じ図形上の拘束点以外へのスナップは行わない
          const [shapeId] = entry
          return !snappingConstraintPoint.some(
            constraint => (constraint.snapInfo as ShapeRelatedSnapInfo).targetShapeId === shapeId
          )
        })
        .map(entry => {
          const [shapeId, coord, snapType] = entry
          return {
            ...coord,
            priority: 1,
            snapInfo: { type: snapType, targetShapeId: shapeId } as SnapInfoCircumference,
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
