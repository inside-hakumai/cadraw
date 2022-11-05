import React from 'react'
import { css } from '@emotion/react'
import { useRecoilValue } from 'recoil'
import { snappingCoordState } from '../../container/state'
import Grid from './Grid'
import { useTranslation } from 'react-i18next'
import SupplementalRenderer from './SupplementalRenderer'
import Tooltip from './Tooltip'
import Renderer from './Renderer'

const style = css`
  width: 100vw;
  height: 100vh;
`

const svgStyle = css`
  position: absolute;
  top: 0;
  left: 0;
`

const rendererStyle = (isShapeFocused: boolean) =>
  css(
    svgStyle,
    css`
      cursor: ${isShapeFocused ? 'pointer' : 'default'};
    `
  )

const currentCoordInfoStyle = css`
  position: absolute;
  font-size: 10px;
  transform: translate(-40%);
  color: #008000;
  user-select: none;
`

interface Props {
  stageRef: React.RefObject<SVGSVGElement>
  onMouseDown?: (event: React.MouseEvent) => void
  onMouseMove?: (event: React.MouseEvent) => void
  onMouseup?: (event: React.MouseEvent) => void
}

const Canvas: React.FC<Props> = React.memo(function Canvas({
  stageRef,
  onMouseDown,
  onMouseMove,
  onMouseup,
}) {
  const { t } = useTranslation()
  const snappingCoord = useRecoilValue(snappingCoordState)

  const temporaryCircleCenterRef = React.useRef<SVGCircleElement>(null)
  const temporaryLineStartRef = React.useRef<SVGCircleElement>(null)
  const snappingDotRef = React.useRef<SVGCircleElement>(null)

  let currentCoordInfoPosition: { x: number; y: number } | null = null
  if (snappingDotRef.current) {
    currentCoordInfoPosition = {
      x: snappingDotRef.current.getBoundingClientRect().x,
      y: snappingDotRef.current.getBoundingClientRect().y - 15,
    }
  }

  return (
    <div css={style} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseup}>
      {/* 背景のグリッド線 */}
      <Grid />

      {/* エクスポート時に生成物に載せない図形をレンダリングするSVG */}
      <SupplementalRenderer dotRef={snappingDotRef} />

      {/* 作成した図形をレンダリングするSVG */}
      <Renderer
        svgRef={stageRef}
        centerRef={temporaryCircleCenterRef}
        startCircleRef={temporaryLineStartRef}
      />

      <Tooltip />

      {/* スナップ発生時、その座標の情報を表示 */}
      {snappingCoord && currentCoordInfoPosition && (
        <div
          css={currentCoordInfoStyle}
          style={{
            left: currentCoordInfoPosition.x,
            top: currentCoordInfoPosition.y,
            cursor: 'default',
          }}>
          {snappingCoord.snapInfoList.map(info => t(`snapInfo.${info.type}`)).join('・')}
        </div>
      )}
    </div>
  )
})

export default Canvas
