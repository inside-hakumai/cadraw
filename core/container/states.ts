import { atom, DefaultValue, selector } from 'recoil'
import { calcDistance, findIntersection } from '../lib/function'

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

export const shapesState = atom<Shape[]>({
  key: 'shapes',
  default: [],
})

export const circleShapesState = selector<CircleShape[]>({
  key: 'circleShapes',
  get: ({ get }) => {
    const shapes = get(shapesState)
    return shapes.filter(shape => shape.type === 'circle') as CircleShape[]
  },
})

export const temporaryShapeBaseState = atom<TemporaryShapeBase | null>({
  key: 'temporaryShapeBase',
  default: null,
})

export const temporaryShapeState = selector<TemporaryShape | null>({
  key: 'temporaryShape',
  get: ({ get }) => {
    const operationMode = get(operationModeState)
    const temporaryShapeBase = get(temporaryShapeBaseState)
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

export const snapDestinationCoordState = atom<{ [xy: string]: SnappingCoordinate[] | undefined }>({
  key: 'snapDestinationCoord',
  default: {},
})

export const supplementalLinesState = selector<LineShapeSeed[]>({
  key: 'supplementalLinesSelector',
  get: ({ get }) => {
    const shapes = get(shapesState)

    const activeCoordInfo = get(activeCoordInfoState)
    if (activeCoordInfo === null) {
      return []
    }

    return activeCoordInfo
      .filter(cInfo => cInfo.type === 'circleCenter')
      .map(cInfo => {
        const circleCenterCoordInfo = cInfo as CoordInfoCircleCenter
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

export const coordInfoState = atom<{ [xy: string]: CoordInfo[] }>({
  key: 'coordInfo',
  default: {},
})

export const pointingCoordState = atom<Coordinate | null>({
  key: 'pointingCoord',
  default: null,
})

export const snappingCoordState = selector<Coordinate | null>({
  key: 'snappingCoord',
  get: ({ get }) => {
    const pointingCoord = get(pointingCoordState)
    if (pointingCoord === null) {
      return null
    }

    const circleShapes = get(circleShapesState)
    let minimumDistance = Number.MAX_VALUE
    // 現在指している座標と円周との距離近い円をひとつ探す
    let closestCircle: CircleShape | null = null
    for (const circle of circleShapes) {
      const distance = Math.abs(calcDistance(pointingCoord, circle.center) - circle.radius)
      if (distance < minimumDistance) {
        closestCircle = circle
        minimumDistance = distance
      }
    }

    let snappingToCircleCoord: Coordinate | null = null
    // 現在指している座標と最も近い円の距離が1以下の場合はスナップとなる円周上の一点を特定する
    if (closestCircle !== null && minimumDistance < 4) {
      // 直線と円の交点を求めて、現在指している座標に近い方の点をスナップ先とする
      const intersections = findIntersection(closestCircle, {
        start: closestCircle.center,
        end: pointingCoord,
      })
      switch (intersections.length) {
        case 0:
          break
        case 1:
          snappingToCircleCoord = intersections[0]
          break
        case 2:
          const distance0 = calcDistance(pointingCoord, intersections[0])
          const distance1 = calcDistance(pointingCoord, intersections[1])
          snappingToCircleCoord = distance0 < distance1 ? intersections[0] : intersections[1]
          break
        default:
          throw new Error(`Unexpected too many intersections ${intersections}`)
      }
    }

    const snapDestinationCoord = get(snapDestinationCoordState)
    const snappingCoords = snapDestinationCoord[`${pointingCoord.x}-${pointingCoord.y}`]

    const allSnappingCoords: SnappingCoordinate[] = [
      ...(snappingCoords || ([] as SnappingCoordinate[])),
      ...(snappingToCircleCoord ? [{ ...snappingToCircleCoord, priority: 1 }] : []),
    ]

    let maximumPriority = 0
    let maximumPrioritySnappingCoord: Coordinate | null = null
    for (const snappingCoord of allSnappingCoords) {
      if (snappingCoord.priority > maximumPriority) {
        maximumPriority = snappingCoord.priority
        maximumPrioritySnappingCoord = snappingCoord
      }
    }

    return maximumPrioritySnappingCoord
  },
})

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

export const activeCoordInfoState = selector<CoordInfo[] | null>({
  key: 'activeCoordInfoSelector',
  get: ({ get }) => {
    const coordInfo = get(coordInfoState)
    const activeCoord = get(activeCoordState)

    if (activeCoord === null) {
      return null
    }

    return coordInfo[`${activeCoord.x}-${activeCoord.y}`] || null
  },
})

// // デバッグ用に点を描画する時に使う
// export const debugCoordState = atom<Coordinate[]>({
//   key: 'debugCoord',
//   default: [],
// })
