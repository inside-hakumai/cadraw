import { atom, selector, selectorFamily } from 'recoil'
import {
  assert,
  calcCentralAngleFromHorizontalLine,
  calcCircumferenceCoordFromDegree,
  calcDistance,
  calcDistanceFromCircumference,
  findIntersectionOfCircleAndLine,
  findNearestPointOnLineSegment,
  findNearestPointOnArc,
  getSnapDestinationCoordDefaultValue,
  findPointEquidistantFromThreePoints,
  findNearestPointOnRectangle,
  findNearestPointOnLine,
} from '../lib/function'
import {
  isArc,
  isArcConstrainedByCenterTwoPoints,
  isArcSeed1ConstrainedByCenterTwoPoints,
  isArcSeed2ConstrainedByCenterTwoPoints,
  isArcConstrainedByThreePoints,
  isArcSeed1ConstrainedByThreePoints,
  isArcSeed2ConstrainedByThreePoints,
  isLine,
  isRectangle,
  isShapeType,
  isRectangleSeedConstrainedByCenterCorner,
  isRectangleSeedConstrainedByTwoCorners,
  isCircleSeedConstrainedByCenterDiameter,
  isLineSeedConstrainedByStartEnd,
  isCircle,
  isCircleSeed1ConstrainedByTwoPointsRadius,
  isCircleSeed2ConstrainedByTwoPointsRadius,
} from '../lib/typeguard'
import { drawCommandList } from '../lib/constants'

export const operationModeState = atom<OperationMode>({
  key: 'operationMode',
  default: 'select',
})

export const drawTypeState = atom<DrawType>({
  key: 'drawType',
  default: 'solid',
})

export const drawCommandState = atom<DrawCommand | null>({
  key: 'drawCommand',
  default: null,
})

export const drawStepState = atom<DrawStep | null>({
  key: 'drawStep',
  default: null,
})

export const currentAvailableCommandSelector = selector<DrawCommand[] | null>({
  key: 'currentAvailableCommand',
  get: ({ get }) => {
    const operationMode = get(operationModeState)

    if (isShapeType(operationMode)) {
      return [...drawCommandList[operationMode]]
    } else {
      return null
    }
  },
})

export const currentOperatingShapeSelector = selector<ShapeType | null>({
  key: 'currentOperatingShape',
  get: ({ get }) => {
    const operationMode = get(operationModeState)
    return isShapeType(operationMode) ? operationMode : null
  },
})

/*
 * 作成した図形を管理するAtom、Selector
 */

// 図形を管理するAtom
export const shapesState = atom<Shape[]>({
  key: 'shapes',
  default: [],
})

// 図形を取得するSelectorFamily
export const shapeSelectorFamily = selectorFamily<Shape, number>({
  key: 'singleShape',
  get:
    (shapeId: number) =>
    ({ get }) => {
      const shapes = get(shapesState)
      const found = shapes.find(shape => shape.id === shapeId)
      if (found === undefined) {
        throw new Error(`Shape with id ${shapeId} not found`)
      }
      return found
    },
})

// 特定の形状の図形に限定してIDのリストを返すSelectorFamily
export const filteredShapeIdsSelector = selectorFamily<
  number[],
  { filterDrawType: DrawType; filterShapeType: ShapeType }
>({
  key: 'shapeTypeFilteredShapeIds',
  get:
    ({ filterDrawType, filterShapeType }) =>
    ({ get }) => {
      const allShapes = get(shapesState)

      return allShapes
        .filter(shape => shape.type === filterDrawType && shape.shape === filterShapeType)
        .map(shape => shape.id)
    },
})

// 特定の形状の図形に限定して図形のリストを返すSelectorFamily
export const filteredShapesSelector = selectorFamily<
  Shape[],
  { filterDrawType: DrawType; filterShapeType: ShapeType }
>({
  key: 'shapeTypeFilteredShapeIds',
  get:
    ({ filterDrawType, filterShapeType }) =>
    ({ get }) => {
      const allShapes = get(shapesState)
      return allShapes.filter(
        shape => shape.type === filterDrawType && shape.shape === filterShapeType
      )
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

// 図形の拘束点を返すSelector
export const shapeConstraintPointsSelector = selector<ShapeConstraintPoint[]>({
  key: 'shapeConstraintPoints',
  get: ({ get }) => {
    const shapes = get(shapesState)
    return shapes
      .map(shape => {
        if (shape.shape === 'line') {
          const lineShape = shape as Line
          const { startPoint, endPoint } = lineShape.constraints

          return [
            {
              coord: startPoint,
              targetShapeId: shape.id,
              constraintType: 'lineEdge' as const,
            } as ShapeConstraintPoint,
            {
              coord: endPoint,
              targetShapeId: shape.id,
              constraintType: 'lineEdge' as const,
            } as ShapeConstraintPoint,
          ]
        }

        if (shape.shape === 'circle') {
          const circleShape = shape as Circle
          const { center } = circleShape.computed

          return [
            {
              coord: center,
              targetShapeId: shape.id,
              constraintType: 'circleCenter' as const,
            } as ShapeConstraintPoint,
          ]
        }

        if (isArc(shape)) {
          if (isArcConstrainedByCenterTwoPoints(shape)) {
            const { center, radius, startPointAngle, endPointAngle } = shape.computed

            return [
              {
                coord: center,
                targetShapeId: shape.id,
                constraintType: 'arcCenter' as const,
              } as ShapeConstraintPoint,
              {
                coord: calcCircumferenceCoordFromDegree(center, radius, startPointAngle),
                targetShapeId: shape.id,
                constraintType: 'arcEdge' as const,
              } as ShapeConstraintPoint,
              {
                coord: calcCircumferenceCoordFromDegree(center, radius, endPointAngle),
                targetShapeId: shape.id,
                constraintType: 'arcEdge' as const,
              } as ShapeConstraintPoint,
            ]
          }
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
export const shapeSeedConstraintsState = atom<ShapeSeed | null>({
  key: 'shapeSeedConstraints',
  default: null,
})

// 作成中の図形を返すSelector
export const shapeSeedState = selector<ShapeSeed | null>({
  key: 'shapeSeed',
  get: ({ get }) => {
    const operationMode = get(operationModeState)
    const drawCommand = get(drawCommandState)
    const drawStep = get(drawStepState)
    const shapeSeed = get(shapeSeedConstraintsState)
    const coord = get(activeCoordState)

    if (drawCommand === null || drawStep === null || shapeSeed === null || coord === null) {
      return null
    }

    if (operationMode === 'select') {
      return null
    }

    if (operationMode === 'rectangle' && drawCommand === 'two-corners') {
      const rectangleDrawStep = drawStep as CommandDrawStep<'rectangle', 'two-corners'>

      if (rectangleDrawStep === 'corner-2' && isRectangleSeedConstrainedByTwoCorners(shapeSeed)) {
        const corner2Point = coord
        const { corner1Point } = shapeSeed

        if (corner2Point.x - corner1Point.x === 0) {
          return shapeSeed
        }

        const diagonalSlope = (corner2Point.y - corner1Point.y) / (corner2Point.x - corner1Point.x)
        console.debug(diagonalSlope)

        let upperLeftPoint: Coordinate
        if (diagonalSlope > 0) {
          // 対角線が右下に向かって引かれている場合
          upperLeftPoint = corner1Point.x < corner2Point.x ? corner1Point : corner2Point
        } else {
          // 対角線が右上に向かって引かれている場合
          upperLeftPoint =
            corner1Point.x < corner2Point.x
              ? { x: corner1Point.x, y: corner2Point.y }
              : { x: corner2Point.x, y: corner1Point.y }
        }

        return {
          ...shapeSeed,
          corner2Point,
          upperLeftPoint,
        } as RectangleSeedConstrainedByTwoCorners
      }
    }

    if (operationMode === 'rectangle' && drawCommand === 'center-corner') {
      const rectangleDrawStep = drawStep as CommandDrawStep<'rectangle', 'center-corner'>

      if (rectangleDrawStep === 'corner' && isRectangleSeedConstrainedByCenterCorner(shapeSeed)) {
        const cornerPoint = coord
        const { center } = shapeSeed

        if (center.x === cornerPoint.x && center.y === cornerPoint.y) {
          return shapeSeed
        }

        const diagonalSlope = (cornerPoint.y - center.y) / (cornerPoint.x - center.x)

        let upperLeftPoint: Coordinate
        if (diagonalSlope > 0) {
          // 対角線が右下に向かって引かれている場合

          if (center.x < cornerPoint.x) {
            upperLeftPoint = {
              x: center.x - (cornerPoint.x - center.x),
              y: center.y - (cornerPoint.y - center.y),
            }
          } else {
            upperLeftPoint = cornerPoint
          }
        } else {
          // 対角線が右上に向かって引かれている場合

          if (center.x < cornerPoint.x) {
            upperLeftPoint = {
              x: center.x - (cornerPoint.x - center.x),
              y: cornerPoint.y,
            }
          } else {
            upperLeftPoint = {
              x: cornerPoint.x,
              y: center.y - (cornerPoint.y - center.y),
            }
          }
        }

        return {
          ...shapeSeed,
          cornerPoint,
          upperLeftPoint,
        } as RectangleSeedConstrainedByCenterCorner
      }
    }

    if (operationMode === 'circle' && drawCommand === 'center-diameter') {
      const circleDrawStep = drawStep as CommandDrawStep<'circle', 'center-diameter'>

      if (circleDrawStep === 'diameter' && isCircleSeedConstrainedByCenterDiameter(shapeSeed)) {
        const temporaryCircleRadius = Math.sqrt(
          Math.pow(shapeSeed.center.x - coord.x, 2) + Math.pow(shapeSeed.center.y - coord.y, 2)
        )
        const temporaryCircleDiameterStart = coord
        const temporaryCircleDiameterEnd = {
          x: coord.x + (shapeSeed.center.x - coord.x) * 2,
          y: coord.y + (shapeSeed.center.y - coord.y) * 2,
        }

        return {
          ...shapeSeed,
          radius: temporaryCircleRadius,
          diameterStart: temporaryCircleDiameterStart,
          diameterEnd: temporaryCircleDiameterEnd,
        } as CircleSeedConstrainedByCenterDiameter
      }
    }

    if (operationMode === 'circle' && drawCommand === 'two-points-radius') {
      const circleDrawStep = drawStep as CommandDrawStep<'circle', 'two-points-radius'>

      if (circleDrawStep === 'point2' && isCircleSeed1ConstrainedByTwoPointsRadius(shapeSeed)) {
        return {
          ...shapeSeed,
          point2: coord,
          distanceBetweenPoints: calcDistance(shapeSeed.point1, coord),
        } as CircleSeed1ConstrainedByTwoPointsRadius
      }

      if (circleDrawStep === 'radius' && isCircleSeed2ConstrainedByTwoPointsRadius(shapeSeed)) {
        const { nearestCoord: center } = findNearestPointOnLine(
          coord,
          shapeSeed.lineEquidistantFromTwoPoints
        )

        return {
          ...shapeSeed,
          radius: calcDistance(center, shapeSeed.point1),
          center,
        }
      }
    }

    if (operationMode === 'arc' && drawCommand === 'center-two-points') {
      const arcDrawStep = drawStep as CommandDrawStep<'arc', 'center-two-points'>

      if (arcDrawStep === 'startPoint') {
        if (!isArcSeed1ConstrainedByCenterTwoPoints(shapeSeed)) {
          console.warn('shapeSeed is not ArcCenterTwoPointsSeed2')
          return shapeSeed
        }

        const temporaryRadius = calcDistance(shapeSeed.center, coord)
        const temporaryStartAngle = calcCentralAngleFromHorizontalLine(coord, shapeSeed.center)

        if (temporaryStartAngle === null) {
          return shapeSeed
        } else {
          const newValue: ArcSeed1ConstrainedByCenterTwoPoints = {
            ...shapeSeed,
            startPoint: coord,
            startPointAngle: temporaryStartAngle,
            radius: temporaryRadius,
          }
          return newValue
        }
      }

      if (arcDrawStep === 'endPoint') {
        if (!isArcSeed2ConstrainedByCenterTwoPoints(shapeSeed)) {
          console.warn('shapeSeed is not temporaryArcRadius')
          return shapeSeed
        }

        const { center, startPointAngle } = shapeSeed
        const temporaryEndAngle = calcCentralAngleFromHorizontalLine(coord, center)

        if (temporaryEndAngle === null) {
          return shapeSeed
        } else {
          const endCoord = calcCircumferenceCoordFromDegree(
            center,
            shapeSeed.radius,
            temporaryEndAngle
          )
          const counterClockWiseAngle =
            temporaryEndAngle > startPointAngle
              ? temporaryEndAngle - startPointAngle
              : 360 - (startPointAngle - temporaryEndAngle)

          const newValue: ArcSeed2ConstrainedByCenterTwoPoints = {
            ...shapeSeed,
            endPoint: endCoord,
            endPointAngle: temporaryEndAngle,
            angleDeltaFromStart: counterClockWiseAngle,
          }
          return newValue
        }
      }
    }

    if (operationMode === 'arc' && drawCommand === 'three-points') {
      const arcDrawStep = drawStep as CommandDrawStep<'arc', 'three-points'>

      if (arcDrawStep === 'endPoint') {
        if (!isArcSeed1ConstrainedByThreePoints(shapeSeed)) {
          console.warn('shapeSeed is not ArcThreePointsSeed2')
          return shapeSeed
        }

        const temporaryDistance = calcDistance(shapeSeed.startPoint, coord)

        const newValue: ArcSeed1ConstrainedThreePoints = {
          ...shapeSeed,
          endPoint: coord,
          distance: temporaryDistance,
        }
        return newValue
      }

      if (arcDrawStep === 'onLinePoint') {
        if (!isArcSeed2ConstrainedByThreePoints(shapeSeed)) {
          console.warn('shapeSeed is not ArcThreePointsSeed3')
          return shapeSeed
        }

        const { startPoint, endPoint } = shapeSeed

        const center = findPointEquidistantFromThreePoints(startPoint, endPoint, coord)
        const radius = calcDistance(center, coord)

        const startPointAngle = calcCentralAngleFromHorizontalLine(startPoint, center)
        const endPointAngle = calcCentralAngleFromHorizontalLine(endPoint, center)

        if (startPointAngle === null || endPointAngle === null) {
          return shapeSeed
        } else {
          const counterClockWiseAngle =
            endPointAngle > startPointAngle
              ? endPointAngle - startPointAngle
              : 360 - (startPointAngle - endPointAngle)

          const newValue: ArcSeed2ConstrainedByThreePoints = {
            ...shapeSeed,
            onLinePoint: coord,
            startPointAngle,
            endPointAngle,
            center,
            radius,
            angleDeltaFromStart: counterClockWiseAngle,
          }
          return newValue
        }
      }
    }

    if (operationMode === 'line' && drawCommand === 'start-end') {
      const lineDrawStep = drawStep as CommandDrawStep<'line', 'start-end'>

      if (lineDrawStep === 'endPoint' && isLineSeedConstrainedByStartEnd(shapeSeed)) {
        const newValue: LineSeedConstrainedByStartEnd = {
          ...shapeSeed,
          endPoint: coord,
        }
        return newValue
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

export const guidingLinesState = selector<Line['constraints'][]>({
  key: 'guidingLinesSelector',
  get: ({ get }) => {
    const shapes = get(shapesState)

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
        ) as Circle
        const { center, radius } = circle.constraints
        return {
          type: 'line' as const,
          startPoint: { x: center.x - radius, y: center.y },
          endPoint: { x: center.x + radius, y: center.y },
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

    const shapes = get(shapesState)

    // 現在指している座標と図形の最近傍点との距離が近い図形を探す
    let closeShapes: Shape[] = []
    for (const shape of shapes) {
      if (shape.shape === 'circle') {
        const circle = shape as Circle
        const { center, radius } = circle.computed

        const distance = Math.abs(calcDistance(pointingCoord, center) - radius)
        if (distance < 10) {
          closeShapes = [...closeShapes, circle]
        }
      }

      if (isLine(shape)) {
        const { distance, isLineTerminal } = findNearestPointOnLineSegment(
          pointingCoord,
          shape.constraints
        )
        // 最近傍点が線分の終点の場合は除外する（拘束点は別途スナップ判定するため）
        if (distance < 10 && !isLineTerminal) {
          closeShapes = [...closeShapes, shape]
        }
      }

      if (isRectangle(shape)) {
        const { distance, isRectangleCorner } = findNearestPointOnRectangle(
          pointingCoord,
          shape.computed
        )
        // 最近傍点が長方形の角の場合は除外する（別途スナップ判定するため）
        if (distance < 10 && !isRectangleCorner) {
          closeShapes = [...closeShapes, shape]
        }
      }

      if (shape.shape === 'arc') {
        if (!isArcConstrainedByCenterTwoPoints(shape) && !isArcConstrainedByThreePoints(shape)) {
          console.warn('shape is not ArcCenterTwoPoints')
          return null
        }

        const nearest = findNearestPointOnArc(pointingCoord, shape)

        // 最近傍点が線分の終点の場合は除外する（拘束点は別途スナップ判定するため）
        if (nearest !== null && nearest.distance < 10 && !nearest.isArcTerminal) {
          closeShapes = [...closeShapes, shape]
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
      if (isLine(shape)) {
        const { nearestCoord } = findNearestPointOnLineSegment(pointingCoord, shape.constraints)

        snapDestinationCoordOnShape = [
          ...snapDestinationCoordOnShape,
          [shape.id, nearestCoord, 'onLine'],
        ]
      }

      if (isRectangle(shape)) {
        const { nearestCoord } = findNearestPointOnRectangle(pointingCoord, shape.computed)

        snapDestinationCoordOnShape = [
          ...snapDestinationCoordOnShape,
          [shape.id, nearestCoord, 'onRectangle'],
        ]
      }

      if (isCircle(shape)) {
        // 円の中心点とカーソル座標を含む直線と円の交点を求める
        const intersections = findIntersectionOfCircleAndLine(shape.computed, {
          start: shape.computed.center,
          end: pointingCoord,
        })

        // 交点が必ず2つあることを確認し、円周に近いほうをスナップ先とする
        assert(intersections.length === 2, "Assertion 'intersections.length === 2' failed")
        const distance0 = calcDistance(pointingCoord, intersections[0])
        const distance1 = calcDistance(pointingCoord, intersections[1])
        snapDestinationCoordOnShape = [
          ...snapDestinationCoordOnShape,
          [shape.id, distance0 < distance1 ? intersections[0] : intersections[1], 'circumference'],
        ]
      }

      if (shape.shape === 'arc') {
        if (!isArcConstrainedByCenterTwoPoints(shape) && !isArcConstrainedByThreePoints(shape)) {
          console.warn('shape is not ArcCenterTwoPoints')
          return null
        }

        const nearest = findNearestPointOnArc(pointingCoord, shape)

        if (nearest !== null) {
          snapDestinationCoordOnShape = [
            ...snapDestinationCoordOnShape,
            [shape.id, nearest.nearestCoord, 'onArc'],
          ]
        }
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
export const snapshotsState = atom<Shape[][]>({
  key: 'snapshots',
  default: [[]],
  dangerouslyAllowMutability: true,
})

// 現在描画されている状態を示しているスナップショットのバージョン
export const currentSnapshotVersionState = atom<number>({
  key: 'currentSnapshotVersion',
  default: 0,
})

// Undoの可否をboolean値で返すSelector
export const canUndoSelector = selector<boolean>({
  key: 'canUndoSelector',
  get: ({ get }) => {
    const currentSnapshotVersion = get(currentSnapshotVersionState)

    // スナップショットが1つ以上追加されている状態でのみUndoを実行できる
    // （ = 初期状態と1つ目の図形を追加した状態の2つスナップショットが存在している状態）
    return currentSnapshotVersion >= 1
  },
})

/*
 * その他
 */

// 図形作成中に表示されるツールチップの中身テキストを返すSelector
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

// ショートカットカットキーのヒントを表示させるかどうかを管理するAtom
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
