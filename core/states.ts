import { atom, DefaultValue, selector } from 'recoil'

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

export const snapDestinationCoordState = atom<{ [xy: string]: CoordinateWithDistance }>({
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

    const snapDestinationCoord = get(snapDestinationCoordState)
    return snapDestinationCoord?.[`${pointingCoord.x}-${pointingCoord.y}`] || null
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
      console.warn('pointingCoord is null')
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
