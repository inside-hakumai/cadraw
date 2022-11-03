import React from 'react'
import { css } from '@emotion/react'
import { useRecoilValue } from 'recoil'
import { pointingCoordState, snappingCoordState } from '../../container/states'

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

interface Props {}

const PointingCoordIndicator: React.FC<Props> = React.memo(function PointingCoordIndicator() {
  const pointingCoord = useRecoilValue(pointingCoordState)
  const snappingCoord = useRecoilValue(snappingCoordState)

  if (pointingCoord) {
    return (
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
    )
  } else {
    return null
  }
})

export default PointingCoordIndicator
