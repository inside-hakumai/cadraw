import React from 'react'
import { currentSnapshotVersionState, snapshotsState } from '../../container/state/snapshotsState'
import { useRecoilValue } from 'recoil'
import { useTranslation } from 'react-i18next'
import { css } from '@emotion/react'

const historyStyle = css`
  display: flex;
  flex-direction: column-reverse;
  margin-bottom: 10px;
  font-size: 12px;
`

const itemStyle = (isCurrentVersion: boolean) => css`
  position: relative;
  margin-top: 15px;
  margin-bottom: 0;
  color: ${isCurrentVersion ? 'red' : '#787878;'};

  &:not(:last-child):before {
    display: block;
    position: absolute;
    top: -12px;
    left: -2px;
    content: '▲';
    color: #a2a2a2;
    line-height: 10px;
  }
`

const HistoryViewer: React.FC = React.memo(function HistoryViewer() {
  const snapshots = useRecoilValue(snapshotsState)
  const currentSnapshotVersion = useRecoilValue(currentSnapshotVersionState)
  const { t } = useTranslation()

  const historyItems = []
  for (let i = 0; i < snapshots.length; i++) {
    const { lastOperation } = snapshots[i]

    if (lastOperation === 'noop') {
      continue
    }

    historyItems.push(
      <p key={`history-${i}`} css={itemStyle(currentSnapshotVersion === i)}>
        {i}: {t(`drawOperation.${lastOperation}`)}
      </p>
    )
  }

  return <div css={historyStyle}>{historyItems}</div>
})

export default HistoryViewer
