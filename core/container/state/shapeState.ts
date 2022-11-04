/**
 * 作成した図形に関するAtomやSelectorです。
 */

import { atom, selector, selectorFamily } from 'recoil'

/** 作成した図形を管理するAtom */
export const shapesState = atom<Shape[]>({
  key: 'shapes',
  default: [],
})

/** IDを指定して図形を取得するSelectorFamily */
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

/** 特定の形状の図形に限定して図形IDのリストを返すSelectorFamily */
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

/** 特定の形状の図形に限定して図形のリストで返すSelectorFamily */
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

/** 作成した図形について、図形IDをkey、図形をvalueとするMapを返すSelector */
export const idToShapeMapSelector = selector<Map<number, Shape>>({
  key: 'idToShapeMap',
  get: ({ get }) => {
    const shapes = get(shapesState)
    return new Map(shapes.map(shape => [shape.id, shape]))
  },
})

/** クリックして選択状態になっている図形のIDを管理するAtom */
export const selectedShapeIdsState = atom<number[]>({
  key: 'selectedShapeIds',
  default: [],
})

/** クリックして選択状態になっている図形のリストを返すSelector */
export const selectedShapesSelector = selector<Shape[]>({
  key: 'selectedShapes',
  get: ({ get }) => {
    const selectedShapeIds = get(selectedShapeIdsState)
    const idToShapeMap = get(idToShapeMapSelector)
    return selectedShapeIds.map(id => idToShapeMap.get(id) as Shape)
  },
})

/** 図形のIDを指定し、その図形が選択されているかどうかを返すSelectorFamily */
export const isShapeSelectedSelectorFamily = selectorFamily<boolean, number>({
  key: 'isShapeSelected',
  get:
    (shapeId: number) =>
    ({ get }) => {
      const selectedShapeIds = get(selectedShapeIdsState)
      return selectedShapeIds.includes(shapeId)
    },
})
