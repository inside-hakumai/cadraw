import { css } from '@emotion/react'
import {
  isValidArcCommand,
  isValidCircleCommand,
  isValidLineCommand,
  isValidRectangleCommand,
} from '../../lib/typeguard'
import { shapeList } from '../../lib/constants'
import React, { MouseEvent, useCallback } from 'react'
import { useRecoilValue } from 'recoil'
import { useTranslation } from 'react-i18next'
import {
  currentAvailableCommandSelector,
  currentOperatingShapeSelector,
  drawCommandState,
  drawTypeState,
  operationModeState,
} from '../../container/state/userOperationState'
import { selectedShapeIdsState } from '../../container/state/shapeState'
import { canUndoSelector, currentSnapshotVersionState } from '../../container/state/snapshotsState'
import { isShowingShortcutKeyHintState } from '../../container/state/hintState'

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

const shortCutKeyMapping: { [key: string]: string } = {
  line: 'L',
  rectangle: 'R',
  circle: 'C',
  arc: 'E',
}

interface Props {
  changeDrawType: (newDrawType: DrawType) => void
  changeCommand: (newCommand: string) => void
  changeShape: (newShape: ShapeType) => void
  onActivateShapeSelect: () => void
  onUndo: () => void
  onClickExportButton: () => void
  showShortcutKeyHint: () => void
  hideShortcutKeyHint: () => void
}

const ButtonGroup: React.FC<Props> = React.memo(function ButtonGroup({
  changeDrawType,
  changeCommand,
  changeShape,
  onActivateShapeSelect,
  onUndo,
  onClickExportButton,
  showShortcutKeyHint,
  hideShortcutKeyHint,
}) {
  const isShowingShortcutHint = useRecoilValue(isShowingShortcutKeyHintState)
  const operationMode = useRecoilValue(operationModeState)
  const drawType = useRecoilValue(drawTypeState)
  const drawCommand = useRecoilValue(drawCommandState)
  const currentAvailableCommands = useRecoilValue(currentAvailableCommandSelector)
  const currentOperatingShape = useRecoilValue(currentOperatingShapeSelector)
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

  const ShapeSelector: React.FC<{ shape: ShapeType }> = ({ shape }) => (
    <div css={buttonWrapperStyle}>
      <button
        css={buttonStyle}
        onClick={useCallback(() => changeShape(shape), [shape])}
        disabled={operationMode === shape}>
        {t(`shape.${shape}`)}
      </button>
      {isShowingShortcutHint && (
        <div css={shortcutHintWrapperStyle}>
          <div css={shortcutHintStyle(shortCutKeyMapping[shape])}>{shortCutKeyMapping[shape]}</div>
        </div>
      )}
    </div>
  )

  return (
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
            let i18nKey
            if (currentOperatingShape === 'line' && isValidLineCommand(command)) {
              i18nKey = `command.${currentOperatingShape}.${command}` as const
            } else if (currentOperatingShape === 'rectangle' && isValidRectangleCommand(command)) {
              i18nKey = `command.${currentOperatingShape}.${command}` as const
            } else if (currentOperatingShape === 'circle' && isValidCircleCommand(command)) {
              i18nKey = `command.${currentOperatingShape}.${command}` as const
            } else if (currentOperatingShape === 'arc' && isValidArcCommand(command)) {
              i18nKey = `command.${currentOperatingShape}.${command}` as const
            } else {
              return null
            }

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
          })}
        </div>
      )}
      <div css={toolGroupStyle}>
        {shapeList.map(shape => (
          <ShapeSelector key={`shapeSelector-${shape}`} shape={shape} />
        ))}
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
  )
})

export default ButtonGroup
