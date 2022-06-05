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

const rootStyle = css`
  display: flex;
  position: absolute;
  bottom: 10px;
  right: 10px;

  span,
  button {
    margin-right: 10px;
  }
`

const toolGroupStyle = css`
  display: flex;
  margin: 0 10px;
  padding: 5px 10px;
  border: 1px solid #787878;
  border-radius: 5px;

  button {
    margin: 0 5px;
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

interface Props {
  onActivateSupplementalLineDraw: () => void
  onActivateShapeSelect: () => void
  onActivateLineDraw: () => void
  onActivateArcDraw: () => void
  onActivateCircleDraw: () => void
  onUndo: () => void
  onClickExportButton: () => void
}

const ToolWindow: React.FC<Props> = ({
  onActivateSupplementalLineDraw,
  onActivateShapeSelect,
  onActivateLineDraw,
  onActivateCircleDraw,
  onActivateArcDraw,
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
      <div css={rootStyle}>
        <div css={toolGroupStyle}>
          <button
            onClick={onActivateSupplementalLineDraw}
            disabled={currentOperatingShape === 'supplementalLine'}>
            補助線
          </button>
          <button onClick={onActivateLineDraw} disabled={currentOperatingShape === 'line'}>
            線
          </button>
          <button onClick={onActivateArcDraw} disabled={currentOperatingShape === 'arc'}>
            円弧
          </button>
          <button onClick={onActivateCircleDraw} disabled={currentOperatingShape === 'circle'}>
            円
          </button>
        </div>
        <div css={toolGroupStyle}>
          <button onClick={onActivateShapeSelect} disabled={operationMode === 'select'}>
            選択{selectedShapeIds.length > 0 && `(${selectedShapeIds.length})`}
          </button>
          <button onClick={onUndo} disabled={!canUndo}>
            元に戻す({currentSnapshotVersion ?? 'null'})
          </button>
          <button onClick={onClickExportButton}>エクスポート</button>
        </div>
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
