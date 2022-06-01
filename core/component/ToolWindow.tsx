import React from 'react'
import { css } from '@emotion/react'
import { useRecoilValue } from 'recoil'
import {
  canUndoSelector,
  currentOperatingShapeSelector,
  currentSnapshotVersionState,
  operationModeState,
  pointingCoordState,
  selectedShapeIdsState,
  snappingCoordState,
} from '../container/states'

interface Props {
  onActivateShapeSelect: () => void
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

const coordViewerStyle = css`
  position: absolute;
  left: 10px;
  bottom: 10px;
  color: #787878;
  font-size: 14px;

  span.snap {
    padding-left: 5px;
    color: #008000;
  }
`

const ToolWindow: React.FC<Props> = ({
  onActivateShapeSelect,
  onActivateLineDraw,
  onActivateCircleDraw,
  onUndo,
  onClickExportButton,
}) => {
  const operationMode = useRecoilValue(operationModeState)
  const currentOperatingShape = useRecoilValue(currentOperatingShapeSelector)
  const pointingCoord = useRecoilValue(pointingCoordState)
  const snappingCoord = useRecoilValue(snappingCoordState)
  const canUndo = useRecoilValue(canUndoSelector)
  const currentSnapshotVersion = useRecoilValue(currentSnapshotVersionState)
  const selectedShapeIds = useRecoilValue(selectedShapeIdsState)

  return (
    <>
      <div css={style}>
        <button onClick={onActivateShapeSelect} disabled={operationMode === 'select'}>
          選択{selectedShapeIds.length > 0 && `(${selectedShapeIds.length})`}
        </button>
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
      {pointingCoord && (
        <div css={coordViewerStyle}>
          <span>
            座標: ({pointingCoord.x}, {pointingCoord.y})
          </span>
          {snappingCoord && (
            <span className={'snap'}>
              =&gt; スナップ先: ({snappingCoord.x.toFixed(2)}, {snappingCoord.y.toFixed(2)})
            </span>
          )}
        </div>
      )}
    </>
  )
}

export default ToolWindow
