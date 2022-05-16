import React from 'react'
import Cadraw from '../../../common/cadraw'

const App = () => {

  const copyToFigma = (svgString: string) => {
    parent.postMessage({
      pluginMessage: {
        type: 'paste-svg',
        svgString: svgString,
      }
    }, '*')
  }

  return (
    <Cadraw onExport={copyToFigma} />
  )

}

export default App
