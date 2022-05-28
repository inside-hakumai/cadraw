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

export const temporaryShapeState = atom<TemporaryShape | null>({
  key: 'temporaryShape',
  default: null,
})

export const snapDestinationCoordState = atom<{ [xy: string]: CoordinateWithDistance }>({
  key: 'snapDestinationCoord',
  default: {},
})

const supplementalLinesState = atom<Line[]>({
  key: 'supplementalLines',
  default: [],
})

export const supplementalLinesSelector = selector<Line[]>({
  key: 'supplementalLinesSelector',
  get: ({ get }) => get(supplementalLinesState),
  set: ({ get, set }, newValue) => {
    if (newValue instanceof DefaultValue) {
      set(supplementalLinesState, [])
    } else if (get(supplementalLinesState).length === 0 && newValue.length === 0) {
      // 更新前後で両方とも空配列の場合はレンダリングを行わないようにstateを更新しない
      return
    } else {
      set(supplementalLinesState, newValue)
    }
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

export const snappingCoordState = atom<Coordinate | null>({
  key: 'activeCoord',
  default: null,
})

export const tooltipContentState = atom<string | null>({
  key: 'tooltipContent',
  default: null,
})

export const activeCoordInfoState = atom<string[] | null>({
  key: 'activeCoordInfo',
  default: null,
})
