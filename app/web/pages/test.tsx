import type { NextPage } from 'next'
import dynamic from 'next/dynamic'

const Cadraw = dynamic(() => import('../../../core/Cadraw'), { ssr: false })

const Test: NextPage = () => {

  return (
    <div>
      <Cadraw />
    </div>
  )
}

export default Test
