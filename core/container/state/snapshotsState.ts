/**
 * 元に戻す・やり直し操作のために作成状況のスナップショットを管理するためのAtom・Selector
 */

import { atom, selector } from 'recoil'

/** スナップショットのリストを管理するAtom */
export const snapshotsState = atom<
  {
    lastOperation: DrawOperation
    shapes: Shape[]
  }[]
>({
  key: 'snapshots',
  default: [
    {
      lastOperation: 'noop',
      shapes: [],
    },
  ],
  dangerouslyAllowMutability: true,
})

/** 現在描画されている状態を示しているスナップショットのバージョン */
export const currentSnapshotVersionState = atom<number>({
  key: 'currentSnapshotVersion',
  default: 0,
})

/** Undoの可否をboolean値で返すSelector */
export const canUndoSelector = selector<boolean>({
  key: 'canUndoSelector',
  get: ({ get }) => {
    const currentSnapshotVersion = get(currentSnapshotVersionState)

    // スナップショットが1つ以上追加されている状態でのみUndoを実行できる
    // （ = 初期状態と1つ目の図形を追加した状態の2つスナップショットが存在している状態）
    return currentSnapshotVersion >= 1
  },
})
