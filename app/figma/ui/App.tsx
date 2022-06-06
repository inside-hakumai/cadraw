import React, { useCallback } from 'react'
import Cadraw from '../../../core/Cadraw'

const App = () => {
  const copyToFigma = (svgString: string) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'paste-svg',
          svgString: svgString,
        },
      },
      '*'
    )
  }

  const onKeyDown = useCallback((e: React.SyntheticEvent) => {
    // Figmaアプリケーション本体へのキーイベント伝搬を止める
    e.stopPropagation()
  }, [])

  return (
    <div onKeyDown={onKeyDown}>
      <Cadraw onExport={copyToFigma} />
    </div>
  )
}

export default App
