import React from 'react'
import { css } from '@emotion/react'

interface Props {
  activeShape: ShapeType | null
  onActivateLineDraw: () => void
  onActivateCircleDraw: () => void
  onClickExportButton: () => void
}

const style = css`
  position: absolute;
  bottom: 10px;
  right: 10px;
`


const ToolWindow: React.FC<Props> = ({ activeShape, onActivateLineDraw, onActivateCircleDraw, onClickExportButton }) => {

  return (
    <div css={style}>
      <button onClick={onActivateLineDraw} disabled={activeShape === 'line'}>線</button>
      <button onClick={onActivateCircleDraw} disabled={activeShape === 'circle'}>丸</button>
      <button onClick={onClickExportButton}>Export</button>
    </div>
  )

}

export default ToolWindow
