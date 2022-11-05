import React from 'react'
import { useRecoilValue } from 'recoil'
import { css } from '@emotion/react'
import { tooltipState } from '../../container/state/hintState'

const tooltipStyle = css`
  position: absolute;
  font-size: 10px;
  transform: translate(-40%);
  user-select: none;
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
            top: tooltip.clientPosition.y - 30,
            cursor: 'default',
          }}>
          {tooltip.content}
        </div>
      )}
    </>
  )
})

export default Tooltip
