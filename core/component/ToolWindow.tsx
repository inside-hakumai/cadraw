import React, { MouseEvent, useCallback } from 'react'
import { css } from '@emotion/react'
import { useRecoilValue } from 'recoil'
import {
  canUndoSelector,
  currentAvailableCommandSelector,
  currentOperatingShapeSelector,
  currentSnapshotVersionState,
  drawCommandState,
  drawTypeState,
  isShowingShortcutKeyHintState,
  operationModeState,
  pointingCoordState,
  selectedShapeIdsState,
  snappingCoordState,
} from '../container/states'
import { useTranslation } from 'react-i18next'

import {
  isValidArcCommand,
  isValidCircleCommand,
  isValidLineCommand,
  isValidRectangleCommand,
} from '../lib/typeguard'

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
  changeDrawType: (newDrawType: DrawType) => void
  changeCommand: (newCommand: string) => void
  onActivateShapeSelect: () => void
  onActivateLineDraw: () => void
  onActivateRectangleDraw: () => void
  onActivateArcDraw: () => void
  onActivateCircleDraw: () => void
  onUndo: () => void
  onClickExportButton: () => void
  showShortcutKeyHint: () => void
  hideShortcutKeyHint: () => void
}

const ToolWindow: React.FC<Props> = ({
  changeDrawType,
  changeCommand,
  onActivateShapeSelect,
  onActivateLineDraw,
  onActivateRectangleDraw,
  onActivateCircleDraw,
  onActivateArcDraw,
  onUndo,
  onClickExportButton,
  showShortcutKeyHint,
  hideShortcutKeyHint,
}) => {
  const isShowingShortcutHint = useRecoilValue(isShowingShortcutKeyHintState)
  const operationMode = useRecoilValue(operationModeState)
  const drawType = useRecoilValue(drawTypeState)
  const drawCommand = useRecoilValue(drawCommandState)
  const currentAvailableCommands = useRecoilValue(currentAvailableCommandSelector)
  const currentOperatingShape = useRecoilValue(currentOperatingShapeSelector)
  const pointingCoord = useRecoilValue(pointingCoordState)
  const snappingCoord = useRecoilValue(snappingCoordState)
  const canUndo = useRecoilValue(canUndoSelector)
  const currentSnapshotVersion = useRecoilValue(currentSnapshotVersionState)
  const selectedShapeIds = useRecoilValue(selectedShapeIdsState)
  const { t } = useTranslation()

  const onClickCommandChangeButton = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const target = event.target as HTMLButtonElement
      const newCommand = target.getAttribute('data-command')
      if (newCommand === null) {
        throw new Error('newCommand is null')
      }
      changeCommand(newCommand)
    },
    [changeCommand]
  )

  const onChangeDrawType = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.value === 'solid' || event.target.value === 'supplemental') {
        changeDrawType(event.target.value)
      } else {
        throw new Error(`Unexpected DrawType: ${event.target.value}`)
      }
    },
    [changeDrawType]
  )

  return (
    <>
      <div css={rootStyle}>
        <div css={toolGroupStyle}>
          <input
            type='radio'
            id='solid'
            name='drawType'
            value='solid'
            checked={drawType === 'solid'}
            onChange={onChangeDrawType}
          />
          <label htmlFor='solid'>{t('drawType.solid')}</label>
          <input
            type='radio'
            id='supplemental'
            name='drawType'
            value='supplemental'
            checked={drawType === 'supplemental'}
            onChange={onChangeDrawType}
          />
          <label htmlFor='supplemental'>{t('drawType.supplemental')}</label>
        </div>
        {currentOperatingShape && currentAvailableCommands && (
          <div css={toolGroupStyle}>
            {currentAvailableCommands.map(command => {
              // TODO: if文の条件文以外の中身が同じものが4つ並んでいる冗長な書き方をしているので改善する
              if (currentOperatingShape === 'line' && isValidLineCommand(command)) {
                const i18nKey = `command.${currentOperatingShape}.${command}` as const
                return (
                  <div css={buttonWrapperStyle} key={i18nKey}>
                    <button
                      css={buttonStyle}
                      disabled={command === drawCommand}
                      data-command={command}
                      onClick={onClickCommandChangeButton}>
                      {t(i18nKey)}
                    </button>
                  </div>
                )
              }
              if (currentOperatingShape === 'rectangle' && isValidRectangleCommand(command)) {
                const i18nKey = `command.${currentOperatingShape}.${command}` as const
                return (
                  <div css={buttonWrapperStyle} key={i18nKey}>
                    <button
                      css={buttonStyle}
                      disabled={command === drawCommand}
                      data-command={command}
                      onClick={onClickCommandChangeButton}>
                      {t(i18nKey)}
                    </button>
                  </div>
                )
              }
              if (currentOperatingShape === 'circle' && isValidCircleCommand(command)) {
                const i18nKey = `command.${currentOperatingShape}.${command}` as const
                return (
                  <div css={buttonWrapperStyle} key={command}>
                    <button
                      css={buttonStyle}
                      disabled={command === drawCommand}
                      data-command={command}
                      onClick={onClickCommandChangeButton}>
                      {t(i18nKey)}
                    </button>
                  </div>
                )
              }
              if (currentOperatingShape === 'arc' && isValidArcCommand(command)) {
                const i18nKey = `command.${currentOperatingShape}.${command}` as const
                return (
                  <div css={buttonWrapperStyle} key={command}>
                    <button
                      css={buttonStyle}
                      disabled={command === drawCommand}
                      data-command={command}
                      onClick={onClickCommandChangeButton}>
                      {t(i18nKey)}
                    </button>
                  </div>
                )
              }
            })}
          </div>
        )}
        <div css={toolGroupStyle}>
          <div css={buttonWrapperStyle}>
            <button
              css={buttonStyle}
              onClick={onActivateLineDraw}
              disabled={operationMode === 'line'}>
              {t('shape.line')}
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
              onClick={onActivateRectangleDraw}
              disabled={operationMode === 'rectangle'}>
              {t('shape.rectangle')}
            </button>
            {isShowingShortcutHint && (
              <div css={shortcutHintWrapperStyle}>
                <div css={shortcutHintStyle('R')}>R</div>
              </div>
            )}
          </div>
          <div css={buttonWrapperStyle}>
            <button
              css={buttonStyle}
              onClick={onActivateArcDraw}
              disabled={operationMode === 'arc'}>
              {t('shape.arc')}
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
              {t('shape.circle')}
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
              {t('operation.select')}
              {selectedShapeIds.length > 0 && `(${selectedShapeIds.length})`}
            </button>
            {isShowingShortcutHint && (
              <div css={shortcutHintWrapperStyle}>
                <div css={shortcutHintStyle('ESC')}>ESC</div>
              </div>
            )}
          </div>
          <div css={buttonWrapperStyle}>
            <button css={buttonStyle} onClick={onUndo} disabled={!canUndo}>
              {t('operation.undo')}
              {currentSnapshotVersion && `(${currentSnapshotVersion})`}
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
              {t('operation.showShortcut')}
            </button>
            {isShowingShortcutHint && (
              <div css={shortcutHintWrapperStyle}>
                <div css={shortcutHintStyle('H')}>H</div>
              </div>
            )}
          </div>
          <button css={buttonStyle} onClick={onClickExportButton}>
            {t('operation.export')}
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
