import React from 'react'
import { css } from '@emotion/react'
import { useRecoilValue } from 'recoil'
import {
  canUndoSelector,
  currentOperatingShapeSelector,
  currentSnapshotVersionState,
  pointingCoordState,
  snappingCoordState,
} from '../container/states'

interface Props {
  onActivateLineDraw: () => void
  onActivateCircleDraw: () => void
  onUndo: () => void
  onClickExportButton: () => void
}

const style = css`
  position: absolute;
  bottom: 10px;
  right: 10px;

  span,
  button {
    margin-right: 10px;
  }
`

const ToolWindow: React.FC<Props> = ({
  onActivateLineDraw,
  onActivateCircleDraw,
  onUndo,
  onClickExportButton,
}) => {
  const currentOperatingShape = useRecoilValue(currentOperatingShapeSelector)
  const pointingCoord = useRecoilValue(pointingCoordState)
  const snappingCoord = useRecoilValue(snappingCoordState)
  const canUndo = useRecoilValue(canUndoSelector)
  const currentSnapshotVersion = useRecoilValue(currentSnapshotVersionState)

  return (
    <div css={style}>
      {pointingCoord &&
        (snappingCoord ? (
          <span>
            {snappingCoord.x.toFixed(2)}, {snappingCoord.y.toFixed(2)} &lt;- {pointingCoord.x},{' '}
            {pointingCoord.y}
          </span>
        ) : (
          <span>
            {pointingCoord.x}, {pointingCoord.y}
          </span>
        ))}
      <button onClick={onActivateLineDraw} disabled={currentOperatingShape === 'line'}>
        線
      </button>
      <button onClick={onActivateCircleDraw} disabled={currentOperatingShape === 'circle'}>
        丸
      </button>
      <button onClick={onUndo} disabled={!canUndo}>
        元に戻す({currentSnapshotVersion ?? 'null'})
      </button>
      <button onClick={onClickExportButton}>Export</button>
    </div>
  )
}

export default ToolWindow
