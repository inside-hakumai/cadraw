import React from 'react'
import { useRecoilValue } from 'recoil'
import { css } from '@emotion/react'
import { tooltipState } from '../../container/state/hintState'

const tooltipStyle = css`
  position: absolute;
  padding: 10px;
  text-align: center;
  font-size: 10px;
  transform: translate(-50%, -50%);
  user-select: none;
  cursor: default;
  background: rgba(255, 255, 255, 0.5);
  margin: 0;
`

interface Props {}

/**
 * 図形作成中に長さなどを表示するためのツールチップです。
 */
const Tooltip: React.FC<Props> = React.memo(function Tooltip() {
  const tooltip = useRecoilValue(tooltipState)

  return (
    <>
      {tooltip && (
        <div
          css={tooltipStyle}
          style={{
            left: tooltip.clientPosition.x,
            top: tooltip.clientPosition.y,
          }}>
          {tooltip.content}
        </div>
      )}
    </>
  )
})

export default Tooltip
