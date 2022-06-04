import App from './container/App'
import { RecoilRoot } from 'recoil'
import DebugObserver from './lib/DebugObserver'
import React from 'react'

interface Props {
  onExport?: (data: string) => void
}

const Cadraw: React.FC<Props> = ({ onExport }) => {
  return (
    <RecoilRoot>
      {process.env.NODE_ENV === 'development' && <DebugObserver />}
      <App onExport={onExport} />
    </RecoilRoot>
  )
}

export default Cadraw
