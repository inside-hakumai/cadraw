import React from 'react'
import { css } from '@emotion/react'

interface Props {
  onClickExportButton: () => void
}

const style = css`
  position: absolute;
  bottom: 10px;
  right: 10px;
`


const ToolWindow: React.FC<Props> = ({ onClickExportButton }) => {

  return (
    <div css={style}>
      <button onClick={onClickExportButton}>Export</button>
    </div>
  )

}

export default ToolWindow
