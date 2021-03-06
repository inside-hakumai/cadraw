import { useRecoilSnapshot } from 'recoil'
import React, { useEffect } from 'react'

const DebugObserver: React.FC = () => {
  const snapshot = useRecoilSnapshot()

  useEffect(() => {
    const nodes = Array.from(snapshot.getNodes_UNSTABLE({ isModified: true })).filter(
      node => node.key !== 'pointingCoord' && node.key !== 'cursorClientPosition'
    )

    if (nodes.length > 0) {
      const entries = nodes.map(node => {
        const { key } = node
        return [key, snapshot.getLoadable(node).contents]
      })
      console.debug('The following atoms were modified: ', Object.fromEntries(entries))
    }
  }, [snapshot])

  return null
}

export default DebugObserver
