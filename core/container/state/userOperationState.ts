/**
 * ユーザーの操作モードや作成中の図形を管理するAtomです。
 */

import { atom, selector } from 'recoil'
import { isShapeType } from '../../lib/typeguard'
import { drawCommandList } from '../../lib/constants'

/** どの形状の図形を作成するモードなのか、もしくは選択モードなのかを管理するAtom */
export const operationModeState = atom<OperationMode>({
  key: 'operationMode',
  default: 'select',
})

/** どの形状の図形を作成するモードなのかを返すSelector（選択モード中はnullを返す） */
export const currentOperatingShapeSelector = selector<ShapeType | null>({
  key: 'currentOperatingShape',
  get: ({ get }) => {
    const operationMode = get(operationModeState)
    return isShapeType(operationMode) ? operationMode : null
  },
})

/** 作成中の図形が実線なのか補助線なのかを管理するAtom */
export const drawTypeState = atom<DrawType>({
  key: 'drawType',
  default: 'solid',
})

/** 図形の作成方法を管理するAtom */
export const drawCommandState = atom<DrawCommand | null>({
  key: 'drawCommand',
  default: null,
})

/** 図形の作成手順のうち、どの段階にあるのかを管理するAtom */
export const drawStepState = atom<DrawStep | null>({
  key: 'drawStep',
  default: null,
})

/** 現在選択されている図形形状について、選択できる作成方法をリストで返すSelector */
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
