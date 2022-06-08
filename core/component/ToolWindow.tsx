import React from 'react'
import { css } from '@emotion/react'
import { useRecoilValue } from 'recoil'
import {
  canUndoSelector,
  currentSnapshotVersionState,
  isShowingShortcutKeyHintState,
  operationModeState,
  pointingCoordState,
  selectedShapeIdsState,
  snappingCoordState,
} from '../container/states'

const rootStyle = css`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
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
  margin: 20px 10px 0 10px;
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

const buttonWrapperStyle = css`
  position: relative;
`

const buttonStyle = css`
  min-width: 60px;
`

const shortcutHintWrapperStyle = css`
  display: flex;
  justify-content: space-around;
  position: absolute;
  height: 30px;
  line-height: 30px;
  margin: auto;
  top: -45px;
  left: 0;
  right: 0;
`

const shortcutHintStyle = (keyLabel: string) => css`
  width: 30px;
  height: 30px;
  font-size: ${keyLabel.length > 1 ? 10 : 14}px;
  line-height: 30px;
  text-align: center;
  border-radius: 5px;
  background: #5d5d5d;
  color: #ffffff;
`

interface Props {
  onActivateSupplementalLineDraw: () => void
  onActivateShapeSelect: () => void
  onActivateLineDraw: () => void
  onActivateArcDraw: () => void
  onActivateCircleDraw: () => void
  onUndo: () => void
  onClickExportButton: () => void
  showShortcutKeyHint: () => void
  hideShortcutKeyHint: () => void
}

const ToolWindow: React.FC<Props> = ({
  onActivateSupplementalLineDraw,
  onActivateShapeSelect,
  onActivateLineDraw,
  onActivateCircleDraw,
  onActivateArcDraw,
  onUndo,
  onClickExportButton,
  showShortcutKeyHint,
  hideShortcutKeyHint,
}) => {
  const isShowingShortcutHint = useRecoilValue(isShowingShortcutKeyHintState)
  const operationMode = useRecoilValue(operationModeState)
  const pointingCoord = useRecoilValue(pointingCoordState)
  const snappingCoord = useRecoilValue(snappingCoordState)
  const canUndo = useRecoilValue(canUndoSelector)
  const currentSnapshotVersion = useRecoilValue(currentSnapshotVersionState)
  const selectedShapeIds = useRecoilValue(selectedShapeIdsState)

  return (
    <>
      <div css={rootStyle}>
        <div css={toolGroupStyle}>
          <div css={buttonWrapperStyle}>
            <button
              css={buttonStyle}
              onClick={onActivateSupplementalLineDraw}
              disabled={operationMode === 'supplementalLine'}>
              補助線
            </button>
            {isShowingShortcutHint && (
              <div css={shortcutHintWrapperStyle}>
                <div css={shortcutHintStyle('S')}>S</div>
              </div>
            )}
          </div>
          <div css={buttonWrapperStyle}>
            <button
              css={buttonStyle}
              onClick={onActivateLineDraw}
              disabled={operationMode === 'line'}>
              線
            </button>
            {isShowingShortcutHint && (
              <div css={shortcutHintWrapperStyle}>
                <div css={shortcutHintStyle('L')}>L</div>
              </div>
            )}
          </div>
          <div css={buttonWrapperStyle}>
            <button
              css={buttonStyle}
              onClick={onActivateArcDraw}
              disabled={operationMode === 'arc'}>
              円弧
            </button>
            {isShowingShortcutHint && (
              <div css={shortcutHintWrapperStyle}>
                <div css={shortcutHintStyle('E')}>E</div>
              </div>
            )}
          </div>
          <div css={buttonWrapperStyle}>
            <button
              css={buttonStyle}
              onClick={onActivateCircleDraw}
              disabled={operationMode === 'circle'}>
              円
            </button>
            {isShowingShortcutHint && (
              <div css={shortcutHintWrapperStyle}>
                <div css={shortcutHintStyle('C')}>C</div>
              </div>
            )}
          </div>
        </div>
        <div css={toolGroupStyle}>
          <div css={buttonWrapperStyle}>
            <button
              css={buttonStyle}
              onClick={onActivateShapeSelect}
              disabled={operationMode === 'select'}>
              選択{selectedShapeIds.length > 0 && `(${selectedShapeIds.length})`}
            </button>
            {isShowingShortcutHint && (
              <div css={shortcutHintWrapperStyle}>
                <div css={shortcutHintStyle('ESC')}>ESC</div>
              </div>
            )}
          </div>
          <div css={buttonWrapperStyle}>
            <button css={buttonStyle} onClick={onUndo} disabled={!canUndo}>
              元に戻す({currentSnapshotVersion ?? 'null'})
            </button>
            {isShowingShortcutHint && (
              <div css={shortcutHintWrapperStyle}>
                <div css={shortcutHintStyle('CMD + Z')}>CMD</div>+
                <div css={shortcutHintStyle('Z')}>Z</div>
              </div>
            )}
          </div>
          <div css={buttonWrapperStyle}>
            <button
              css={buttonStyle}
              onMouseDown={showShortcutKeyHint}
              onMouseUp={hideShortcutKeyHint}>
              ショートカットキーを表示
            </button>
            {isShowingShortcutHint && (
              <div css={shortcutHintWrapperStyle}>
                <div css={shortcutHintStyle('H')}>H</div>
              </div>
            )}
          </div>
          <button css={buttonStyle} onClick={onClickExportButton}>
            エクスポート
          </button>
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
