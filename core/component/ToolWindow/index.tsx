import React from 'react'
import PointingCoordViewer from './PointingCoordViewer'
import ButtonGroup from './ButtonGroup'
import HistoryViewer from './HistoryViewer'
import { css } from '@emotion/react'

const sectionStyle = css`
  position: absolute;
  left: 10px;
  bottom: 10px;
  pointer-events: none;
`

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

const ToolWindow: React.FC<Props> = React.memo(function ToolWindow(props) {
  return (
    <div>
      <ButtonGroup {...props} />
      <div css={sectionStyle}>
        <HistoryViewer />
        <PointingCoordViewer />
      </div>
    </div>
  )
})

export default ToolWindow
