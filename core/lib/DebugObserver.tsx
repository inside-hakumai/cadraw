import { useRecoilSnapshot } from 'recoil'
import React, { useEffect } from 'react'

const DebugObserver: React.FC = () => {
  const snapshot = useRecoilSnapshot()

  useEffect(() => {
    console.debug('The following atoms were modified:')
    for (const node of Array.from(snapshot.getNodes_UNSTABLE({ isModified: true }))) {
      console.debug(node.key, snapshot.getLoadable(node))
    }
  }, [snapshot])

  return null
}

export default DebugObserver
