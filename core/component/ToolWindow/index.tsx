import React from 'react'
import PointingCoordViewer from './PointingCoordViewer'
import ButtonGroup from './ButtonGroup'

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
      <PointingCoordViewer />
    </div>
  )
})

export default ToolWindow
