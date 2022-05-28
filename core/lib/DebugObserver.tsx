import { useRecoilSnapshot } from 'recoil'
import React, { useEffect } from 'react'

const DebugObserver: React.FC = () => {
  const snapshot = useRecoilSnapshot()

  useEffect(() => {
    const nodes = Array.from(snapshot.getNodes_UNSTABLE({ isModified: true })).filter(
      node => node.key !== 'pointingCoord'
    )

    if (nodes.length > 0) {
      console.debug('The following atoms were modified:')
      for (const node of nodes) {
        console.debug(node.key, snapshot.getLoadable(node))
      }
    }
  }, [snapshot])

  return null
}

export default DebugObserver
