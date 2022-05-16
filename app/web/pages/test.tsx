import type { NextPage } from 'next'
import dynamic from 'next/dynamic'

const Cadraw = dynamic(() => import('../../../common/Cadraw'), { ssr: false })

const Test: NextPage = () => {

  return (
    <div>
      <Cadraw />
    </div>
  )
}

export default Test
